-- ================================================================
-- CHORPY INCREMENTAL MIGRATION: CO-MEMBER PROFILES RLS & REALTIME
-- Paste and run this entire script in the Supabase SQL Editor.
-- ================================================================

-- 1. Household Member Read Helper (Prevents RLS Self-Recursion on public.profiles)
create or replace function public.get_my_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_household_id() from public;
grant execute on function public.get_my_household_id() to authenticated;

-- 2. Allow Authenticated Household Members to Read Co-Member Profiles
drop policy if exists "Allow users to read their own profile" on public.profiles;
drop policy if exists "Allow household members to read co-member profiles" on public.profiles;

create policy "Allow household members to read co-member profiles"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or (
      household_id is not null
      and household_id = public.get_my_household_id()
    )
  );

-- 3. Publish public.profiles to Supabase Realtime (Idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end;
$$;

-- ================================================================
-- CHORPY INCREMENTAL MIGRATION: CHORE SCHEDULE & PHONE LOCK TIMING
-- Idempotent: Safe to paste and re-run in the Supabase SQL Editor.
-- ================================================================

-- 1. Add scheduling & phone lock timing columns to public.chores
alter table public.chores
  add column if not exists scheduled_at timestamp with time zone,
  add column if not exists lock_at timestamp with time zone,
  add column if not exists lock_mode text;

-- 2. Backfill existing chores safely using created_at
update public.chores
set
  scheduled_at = coalesce(scheduled_at, created_at, timezone('utc'::text, now())),
  lock_at      = coalesce(lock_at, scheduled_at, created_at, timezone('utc'::text, now())),
  lock_mode    = coalesce(lock_mode, 'immediate')
where scheduled_at is null
   or lock_at is null
   or lock_mode is null;

-- 3. Enforce defaults and NOT NULL guarantees
alter table public.chores
  alter column scheduled_at set default timezone('utc'::text, now()),
  alter column scheduled_at set not null,
  alter column lock_at set default timezone('utc'::text, now()),
  alter column lock_at set not null,
  alter column lock_mode set default 'immediate',
  alter column lock_mode set not null;

-- 4. Validate lock_mode enum values and temporal ordering (idempotent)
alter table public.chores
  drop constraint if exists chores_lock_mode_chk;

alter table public.chores
  add constraint chores_lock_mode_chk
  check (lock_mode in ('immediate', 'offset_30m', 'offset_1h', 'offset_2h', 'custom'));

alter table public.chores
  drop constraint if exists chores_lock_after_schedule_chk;

alter table public.chores
  add constraint chores_lock_after_schedule_chk
  check (lock_at >= scheduled_at);

-- 5. Indexes for household calendar scheduling and pending lock evaluation
create index if not exists idx_chores_household_scheduled
  on public.chores (household_id, scheduled_at desc);

create index if not exists idx_chores_pending_lock_at
  on public.chores (assigned_child_id, lock_at)
  where status in ('pending', 'rejected');

-- 6. Immediate device lock sync when a 'Right Now' ('immediate') chore is inserted
create or replace function public.sync_immediate_chore_device_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lock_mode = 'immediate' and new.status = 'pending' then
    update public.devices
      set lock_status = 'locked',
          last_seen = timezone('utc'::text, now())
      where child_id = new.assigned_child_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_chore_created_immediate_lock on public.chores;
create trigger on_chore_created_immediate_lock
  after insert on public.chores
  for each row execute function public.sync_immediate_chore_device_lock();

-- 7. Confirm fail-closed RLS remains enabled on public.chores and public.devices
alter table public.chores enable row level security;
alter table public.devices enable row level security;

-- ================================================================
-- CHORPY INCREMENTAL MIGRATION: FAIL-CLOSED CHORE EDIT RLS & UPDATE SYNC
-- Idempotent: Safe to paste and re-run in the Supabase SQL Editor.
-- ================================================================

-- 1. Role lookup helper (prevents RLS self-recursion on public.profiles)
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_role() from public;
grant execute on function public.get_my_role() to authenticated;

-- 2. BEFORE UPDATE guard: stamps updated_at, freezes household_id,
--    and prevents children from editing chore details (proof submission only)
create or replace function public.enforce_chore_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  new.updated_at := timezone('utc'::text, now());

  if new.household_id is distinct from old.household_id then
    raise exception 'Chore household cannot be changed.';
  end if;

  if auth.uid() is not null then
    v_role := public.get_my_role();
    if v_role is distinct from 'parent' then
      if new.title is distinct from old.title
        or new.description is distinct from old.description
        or new.assigned_child_id is distinct from old.assigned_child_id
        or new.scheduled_at is distinct from old.scheduled_at
        or new.lock_at is distinct from old.lock_at
        or new.lock_mode is distinct from old.lock_mode
        or new.created_at is distinct from old.created_at
      then
        raise exception 'Only parents and co-parents can edit chore details.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_chore_before_update_guard on public.chores;
create trigger on_chore_before_update_guard
  before update on public.chores
  for each row execute function public.enforce_chore_update_guard();

-- 3. Extend immediate device lock sync to INSERT and relevant UPDATEs
create or replace function public.sync_immediate_chore_device_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lock_mode = 'immediate' and new.status in ('pending', 'rejected') then
    if tg_op = 'INSERT'
      or old.lock_mode is distinct from new.lock_mode
      or old.assigned_child_id is distinct from new.assigned_child_id
      or old.status is distinct from new.status
    then
      update public.devices
        set lock_status = 'locked',
            last_seen = timezone('utc'::text, now())
        where child_id = new.assigned_child_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_chore_created_immediate_lock on public.chores;
drop trigger if exists on_chore_synced_immediate_lock on public.chores;
create trigger on_chore_synced_immediate_lock
  after insert or update of lock_mode, assigned_child_id, status on public.chores
  for each row execute function public.sync_immediate_chore_device_lock();

-- 4. Fail-closed household-scoped & role-scoped RLS on public.chores
alter table public.chores enable row level security;

drop policy if exists "Allow users to read household chores" on public.chores;
drop policy if exists "Allow household members to read household chores" on public.chores;
create policy "Allow household members to read household chores"
  on public.chores for select
  to authenticated
  using (
    household_id is not null
    and household_id = public.get_my_household_id()
    and (
      public.get_my_role() = 'parent'
      or assigned_child_id = auth.uid()
    )
  );

drop policy if exists "Allow users to insert chores" on public.chores;
drop policy if exists "Allow household parents to insert chores" on public.chores;
create policy "Allow household parents to insert chores"
  on public.chores for insert
  to authenticated
  with check (
    public.get_my_role() = 'parent'
    and household_id = public.get_my_household_id()
    and exists (
      select 1
      from public.profiles p
      where p.id = assigned_child_id
        and p.household_id = public.get_my_household_id()
        and p.role = 'child'
    )
  );

drop policy if exists "Allow users to update chores" on public.chores;
drop policy if exists "Allow household parents to update chores" on public.chores;
create policy "Allow household parents to update chores"
  on public.chores for update
  to authenticated
  using (
    public.get_my_role() = 'parent'
    and household_id = public.get_my_household_id()
  )
  with check (
    public.get_my_role() = 'parent'
    and household_id = public.get_my_household_id()
    and exists (
      select 1
      from public.profiles p
      where p.id = assigned_child_id
        and p.household_id = public.get_my_household_id()
        and p.role = 'child'
    )
  );

drop policy if exists "Allow assigned child to submit chore proof" on public.chores;
create policy "Allow assigned child to submit chore proof"
  on public.chores for update
  to authenticated
  using (
    public.get_my_role() = 'child'
    and household_id = public.get_my_household_id()
    and assigned_child_id = auth.uid()
    and status in ('pending', 'rejected')
  )
  with check (
    public.get_my_role() = 'child'
    and household_id = public.get_my_household_id()
    and assigned_child_id = auth.uid()
    and status = 'awaiting_approval'
    and proof_image_url is not null
  );

-- 5. Fail-closed household-scoped RLS on public.devices
alter table public.devices enable row level security;

drop policy if exists "Allow authenticated users to read devices" on public.devices;
drop policy if exists "Allow household members to read devices" on public.devices;
create policy "Allow household members to read devices"
  on public.devices for select
  to authenticated
  using (
    child_id = auth.uid()
    or (
      public.get_my_role() = 'parent'
      and exists (
        select 1
        from public.profiles p
        where p.id = child_id
          and p.household_id = public.get_my_household_id()
      )
    )
  );

drop policy if exists "Allow authenticated users to register devices" on public.devices;
drop policy if exists "Allow child to register own device" on public.devices;
create policy "Allow child to register own device"
  on public.devices for insert
  to authenticated
  with check (child_id = auth.uid());

drop policy if exists "Allow authenticated users to update devices" on public.devices;
drop policy if exists "Allow child or household parent to update devices" on public.devices;
create policy "Allow child or household parent to update devices"
  on public.devices for update
  to authenticated
  using (
    child_id = auth.uid()
    or (
      public.get_my_role() = 'parent'
      and exists (
        select 1
        from public.profiles p
        where p.id = child_id
          and p.household_id = public.get_my_household_id()
      )
    )
  )
  with check (
    child_id = auth.uid()
    or (
      public.get_my_role() = 'parent'
      and exists (
        select 1
        from public.profiles p
        where p.id = child_id
          and p.household_id = public.get_my_household_id()
      )
    )
  );
