-- ============================================================
-- NextDoor Daily Shop — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run
-- ============================================================

-- ---------- Tables ----------

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  image_url  text,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text not null,
  price      numeric not null default 0,
  image_url  text,
  created_at timestamptz not null default now()
);

-- Profile per auth user, used to mark admins
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------

alter table categories enable row level security;
alter table items      enable row level security;
alter table profiles   enable row level security;

-- Everyone can read the catalog
drop policy if exists "read categories" on categories;
create policy "read categories" on categories for select using (true);

drop policy if exists "read items" on items;
create policy "read items" on items for select using (true);

-- Only admins can add/update/delete catalog rows
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admin write items" on items;
create policy "admin write items" on items for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- Profiles: a user can read their own profile
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles for select using (auth.uid() = id);

-- ---------- Storage (images) ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "authed upload images" on storage.objects;
create policy "authed upload images" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "authed delete images" on storage.objects;
create policy "authed delete images" on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- AFTER running this:
-- 1) Authentication → Users → Add user → create rinti@gmail.com (your admin)
-- 2) Run:  update profiles set is_admin = true where email = 'rinti@gmail.com';
-- ============================================================
