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
