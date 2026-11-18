create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  family text not null check (family in ('Press', 'Lower', 'Pull')),
  weight numeric(7, 2) not null check (weight >= 0),
  previous numeric(7, 2) not null default 0 check (previous >= 0),
  achieved_at date not null default current_date,
  created_at timestamptz not null default now()
);

create unique index if not exists exercises_user_name_unique
  on public.exercises (user_id, lower(name));

alter table public.exercises enable row level security;

create policy "Users can read their own exercises"
  on public.exercises for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own exercises"
  on public.exercises for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own exercises"
  on public.exercises for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own exercises"
  on public.exercises for delete to authenticated
  using ((select auth.uid()) = user_id);
