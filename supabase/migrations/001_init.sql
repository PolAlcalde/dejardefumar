-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  start_date date,
  titles_opt_in boolean default true,
  created_at timestamptz default now()
);

-- Seasons
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  prize_text text,
  created_at timestamptz default now()
);

-- Checkins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  date date not null,
  smoked_today boolean not null,
  intensity text,
  mood text,
  mission_done boolean default false,
  note text,
  created_at timestamptz default now(),
  unique (user_id, season_id, date)
);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.checkins enable row level security;

-- Profiles policies
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (auth.uid() = id);

-- Seasons policies
create policy "seasons_select" on public.seasons
  for select to authenticated
  using (true);

-- Checkins policies
create policy "checkins_select" on public.checkins
  for select to authenticated
  using (true);

create policy "checkins_insert" on public.checkins
  for insert to authenticated
  with check (auth.uid() = user_id);
