-- =============================================
-- NutriCare: Initial Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- Patients table
-- =============================================
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age >= 0 and age <= 150),
  gender text not null,
  ward text not null default '',
  admission_date text not null default '',
  discharge_date text not null default '',
  patient_type text not null default '',
  weight numeric not null check (weight > 0),
  height numeric not null check (height > 0),
  diagnosis text not null default '',
  allergies text[] not null default '{}',
  medications text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- Nutrition menus table
-- =============================================
create table public.nutrition_menus (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  patient_name text not null,
  nutrition_type text not null check (nutrition_type in ('enteral', 'parenteral')),
  menu_name text not null,
  items jsonb not null default '[]',
  total_energy numeric not null default 0,
  total_volume numeric not null default 0,
  requirements jsonb,
  current_intake jsonb not null default '{}',
  notes text not null default '',
  activity_level text not null default 'bedrest',
  stress_level text not null default 'moderate',
  medical_condition text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- Indexes
-- =============================================
create index idx_patients_user_id on public.patients(user_id);
create index idx_nutrition_menus_user_id on public.nutrition_menus(user_id);
create index idx_nutrition_menus_patient_id on public.nutrition_menus(patient_id);
create index idx_nutrition_menus_created_at on public.nutrition_menus(created_at desc);

-- =============================================
-- Row Level Security
-- =============================================
alter table public.patients enable row level security;
alter table public.nutrition_menus enable row level security;

-- Patients: users can only access their own patients
create policy "Users can view own patients"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "Users can insert own patients"
  on public.patients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own patients"
  on public.patients for update
  using (auth.uid() = user_id);

create policy "Users can delete own patients"
  on public.patients for delete
  using (auth.uid() = user_id);

-- Nutrition menus: users can only access their own menus
create policy "Users can view own menus"
  on public.nutrition_menus for select
  using (auth.uid() = user_id);

create policy "Users can insert own menus"
  on public.nutrition_menus for insert
  with check (auth.uid() = user_id);

create policy "Users can update own menus"
  on public.nutrition_menus for update
  using (auth.uid() = user_id);

create policy "Users can delete own menus"
  on public.nutrition_menus for delete
  using (auth.uid() = user_id);

-- =============================================
-- Updated_at trigger
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_patients_updated_at
  before update on public.patients
  for each row execute function public.handle_updated_at();

create trigger set_nutrition_menus_updated_at
  before update on public.nutrition_menus
  for each row execute function public.handle_updated_at();
