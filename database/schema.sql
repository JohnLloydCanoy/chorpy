-- ================================================================
-- CHORPY DATABASE SETUP SCRIPT
-- ================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Automatic RLS Trigger (Fail-Closed Security)
create or replace function public.enable_rls_on_new_tables()
returns event_trigger
language plpgsql
security definer
as $$
declare
  obj record;
begin
  for obj in select * from pg_event_trigger_ddl_commands() where command_tag in ('CREATE TABLE', 'CREATE TABLE AS')
  loop
    if obj.schema_name = 'public' then
      execute format('alter table %s enable row level security;', obj.object_identity);
    end if;
  end loop;
end;
$$;

drop event trigger if exists auto_enable_rls;
create event trigger auto_enable_rls
on ddl_command_end
when tag in ('CREATE TABLE', 'CREATE TABLE AS')
execute function public.enable_rls_on_new_tables();

-- 3. Households (Family Circles)
create table if not exists public.households (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    pairing_pin varchar(6) unique,
    pin_expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_households_active_pin
  on public.households (pairing_pin)
  where pairing_pin is not null;

-- 4. User Profiles (Linked to Supabase Auth)
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    household_id uuid references public.households(id) on delete set null,
    email text not null,
    full_name text,
    phone_number text,
    date_of_birth date,
    age integer,
    role text check (role in ('parent', 'child')) not null default 'child',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Registered Enforcement Devices
create table if not exists public.devices (
    id uuid primary key default uuid_generate_v4(),
    child_id uuid not null references public.profiles(id) on delete cascade,
    device_name text not null,
    lock_status text check (lock_status in ('locked', 'unlocked')) default 'unlocked' not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Household Chores
create table if not exists public.chores (
    id uuid primary key default uuid_generate_v4(),
    household_id uuid not null references public.households(id) on delete cascade,
    assigned_child_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    description text,
    status text check (status in ('pending', 'awaiting_approval', 'approved', 'rejected')) default 'pending' not null,
    proof_image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Automatic Profile Creation on Signup Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone_number, date_of_birth, age, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone_number',
    (new.raw_user_meta_data->>'date_of_birth')::date,
    (new.raw_user_meta_data->>'age')::integer,
    coalesce(new.raw_user_meta_data->>'role', 'child')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. Household Pairing PIN 30-Minute TTL & Reclamation RPCs
create or replace function public.allocate_household_pin()
returns varchar(6)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt integer;
  v_pin varchar(6);
  v_existing_id uuid;
  v_existing_expires timestamp with time zone;
begin
  for v_attempt in 1..15 loop
    v_pin := (100000 + floor(random() * 900000)::integer)::varchar(6);

    select id, pin_expires_at
      into v_existing_id, v_existing_expires
      from public.households
      where pairing_pin = v_pin
      for update;

    if not found then
      return v_pin;
    end if;

    if v_existing_expires is null or v_existing_expires <= now() then
      update public.households
        set pairing_pin = null,
            pin_expires_at = null
        where id = v_existing_id;
      return v_pin;
    end if;
  end loop;

  raise exception 'Unable to allocate a unique active Family PIN. Please try again.';
end;
$$;

revoke all on function public.allocate_household_pin() from public;
revoke all on function public.allocate_household_pin() from anon, authenticated;

create or replace function public.verify_household_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pin text;
begin
  v_pin := trim(coalesce(p_pin, ''));
  if v_pin !~ '^\d{6}$' then
    return false;
  end if;

  return exists (
    select 1
      from public.households
      where pairing_pin = v_pin
        and pin_expires_at > now()
  );
end;
$$;

revoke all on function public.verify_household_pin(text) from public;
grant execute on function public.verify_household_pin(text) to anon, authenticated;

create or replace function public.create_household_with_pin(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_role text;
  v_name text;
  v_pin varchar(6);
  v_now timestamp with time zone;
  v_expires timestamp with time zone;
  v_household public.households%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required.';
  end if;

  select role
    into v_role
    from public.profiles
    where id = v_uid;

  if v_role is distinct from 'parent' then
    raise exception 'Only parent accounts can create a household.';
  end if;

  v_name := trim(coalesce(p_name, ''));
  if v_name = '' then
    raise exception 'Household name is required.';
  end if;

  v_pin := public.allocate_household_pin();
  v_now := now();
  v_expires := v_now + interval '30 minutes';

  insert into public.households (name, pairing_pin, pin_expires_at)
  values (v_name, v_pin, v_expires)
  returning * into v_household;

  update public.profiles
    set household_id = v_household.id
    where id = v_uid;

  return jsonb_build_object(
    'id', v_household.id,
    'name', v_household.name,
    'pairing_pin', v_household.pairing_pin,
    'pin_expires_at', v_household.pin_expires_at,
    'created_at', v_household.created_at,
    'server_now', v_now
  );
end;
$$;

revoke all on function public.create_household_with_pin(text) from public;
grant execute on function public.create_household_with_pin(text) to authenticated;

create or replace function public.regenerate_household_pin()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_role text;
  v_household_id uuid;
  v_pin varchar(6);
  v_now timestamp with time zone;
  v_expires timestamp with time zone;
  v_household public.households%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required.';
  end if;

  select role, household_id
    into v_role, v_household_id
    from public.profiles
    where id = v_uid;

  if v_role is distinct from 'parent' then
    raise exception 'Only parent accounts can regenerate the Family PIN.';
  end if;

  if v_household_id is null then
    raise exception 'No household is linked to your profile.';
  end if;

  v_pin := public.allocate_household_pin();
  v_now := now();
  v_expires := v_now + interval '30 minutes';

  update public.households
    set pairing_pin = v_pin,
        pin_expires_at = v_expires
    where id = v_household_id
    returning * into v_household;

  if not found then
    raise exception 'Household not found.';
  end if;

  return jsonb_build_object(
    'id', v_household.id,
    'name', v_household.name,
    'pairing_pin', v_household.pairing_pin,
    'pin_expires_at', v_household.pin_expires_at,
    'created_at', v_household.created_at,
    'server_now', v_now
  );
end;
$$;

revoke all on function public.regenerate_household_pin() from public;
grant execute on function public.regenerate_household_pin() to authenticated;

create or replace function public.join_household_with_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_role text;
  v_pin text;
  v_household public.households%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required.';
  end if;

  v_pin := trim(coalesce(p_pin, ''));
  if v_pin !~ '^\d{6}$' then
    raise exception 'Invalid or expired Family PIN.';
  end if;

  select *
    into v_household
    from public.households
    where pairing_pin = v_pin
      and pin_expires_at > now()
    limit 1;

  if not found then
    raise exception 'Invalid or expired Family PIN.';
  end if;

  select role
    into v_role
    from public.profiles
    where id = v_uid;

  update public.profiles
    set household_id = v_household.id
    where id = v_uid;

  return jsonb_build_object(
    'id', v_household.id,
    'name', v_household.name,
    'pairing_pin', case when v_role = 'parent' then v_household.pairing_pin else null end,
    'pin_expires_at', case when v_role = 'parent' then v_household.pin_expires_at else null end,
    'created_at', v_household.created_at,
    'server_now', now()
  );
end;
$$;

revoke all on function public.join_household_with_pin(text) from public;
grant execute on function public.join_household_with_pin(text) to authenticated;

create or replace function public.get_my_household()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_role text;
  v_household_id uuid;
  v_household public.households%rowtype;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required.';
  end if;

  select role, household_id
    into v_role, v_household_id
    from public.profiles
    where id = v_uid;

  if v_household_id is null then
    return null;
  end if;

  select *
    into v_household
    from public.households
    where id = v_household_id;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_household.id,
    'name', v_household.name,
    'pairing_pin', case when v_role = 'parent' then v_household.pairing_pin else null end,
    'pin_expires_at', case when v_role = 'parent' then v_household.pin_expires_at else null end,
    'created_at', v_household.created_at,
    'server_now', now()
  );
end;
$$;

revoke all on function public.get_my_household() from public;
grant execute on function public.get_my_household() to authenticated;

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

-- 9. Enable Realtime Publications (Instant WebSocket Sync)
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.devices;

-- 10. Base Row Level Security (RLS) Policies
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.chores enable row level security;

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

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Allow authenticated users to read households" on public.households;
drop policy if exists "Allow authenticated users to create households" on public.households;
drop policy if exists "Allow members to read their own household" on public.households;

create policy "Allow members to read their own household"
  on public.households for select
  to authenticated
  using (
    id = (select household_id from public.profiles where id = auth.uid())
  );

create policy "Allow users to read household chores"
  on public.chores for select
  to authenticated
  using (true);

create policy "Allow users to insert chores"
  on public.chores for insert
  to authenticated
  with check (true);

create policy "Allow users to update chores"
  on public.chores for update
  to authenticated
  using (true);

create policy "Allow authenticated users to read devices"
  on public.devices for select
  to authenticated
  using (true);

create policy "Allow authenticated users to update devices"
  on public.devices for update
  to authenticated
  using (true);

create policy "Allow authenticated users to register devices"
  on public.devices for insert
  to authenticated
  with check (true);
