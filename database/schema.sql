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
    pairing_pin varchar(6) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. User Profiles (Linked to Supabase Auth)
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    household_id uuid references public.households(id) on delete set null,
    email text not null,
    full_name text,
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
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'child')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. Enable Realtime Publications (Instant WebSocket Sync)
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.devices;

-- 9. Base Row Level Security (RLS) Policies
create policy "Allow users to read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow authenticated users to read households"
  on public.households for select
  to authenticated
  using (true);

create policy "Allow authenticated users to create households"
  on public.households for insert
  to authenticated
  with check (true);

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
