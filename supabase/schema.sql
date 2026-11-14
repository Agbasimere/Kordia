-- ====================================================================
-- KORDIA ESCROW PLATFORM · SUPABASE DATABASE SCHEMA
-- Version 1.2 · Direct Peer-to-Peer Escrow (Hirer & Talent) Architecture
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type user_role as enum ('client', 'freelancer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type agreement_status as enum (
    'Awaiting acceptance',
    'Awaiting funding',
    'Active',
    'Submitted',
    'Approved',
    'Released',
    'Refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payout_status as enum ('PENDING', 'PROCESSING', 'PAYOUT_COMPLETED', 'REFUNDED_TO_HIRER', 'FAILED');
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE (Verified Users & Unique Tags)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_tag text unique not null,
  email text unique not null,
  full_name text not null,
  role user_role not null default 'client',
  company_or_title text,
  location text,
  is_verified boolean not null default false,
  verified_at timestamp with time zone,
  shielded_z_address text,
  pollar_id text,
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_profiles_user_tag on public.profiles (lower(user_tag));

-- 4. AGREEMENTS TABLE
create table if not exists public.agreements (
  id text primary key,
  creator_tag text references public.profiles(user_tag) on delete set null,
  client_tag text references public.profiles(user_tag) on delete set null,
  freelancer_tag text references public.profiles(user_tag) on delete set null,
  title text not null,
  description text not null,
  category text not null default 'Full-Stack Web Development',
  total_amount numeric(12,2) not null check (total_amount > 0),
  currency text not null default 'USD',
  equivalent_zec numeric(12,4) not null default 0,
  status agreement_status not null default 'Awaiting acceptance',
  deadline date not null,
  objection_window_days integer not null default 7,
  evidence_standard text default 'Verifiable deployed URL, Git commit history, test logs',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_agreements_client on public.agreements (client_tag);
create index if not exists idx_agreements_freelancer on public.agreements (freelancer_tag);
create index if not exists idx_agreements_status on public.agreements (status);

-- 5. MILESTONES TABLE
create table if not exists public.milestones (
  id text primary key,
  agreement_id text references public.agreements(id) on delete cascade not null,
  title text not null,
  deliverable text not null,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'Pending',
  submission_url text,
  repo_url text,
  submission_notes text,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ESCROW VAULTS TABLE (Zcash Orchard Shielded Pool Records)
create table if not exists public.escrow_vaults (
  id uuid primary key default uuid_generate_v4(),
  agreement_id text references public.agreements(id) on delete cascade unique not null,
  pool_name text not null default 'Zcash Orchard Shielded Pool',
  tx_hash text not null,
  shielded_memo text,
  deposit_asset text not null default 'ZEC (Shielded)',
  deposit_amount numeric(12,4) not null,
  usd_value numeric(12,2) not null,
  is_funded boolean not null default false,
  funded_at timestamp with time zone,
  is_simulated boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SETTLEMENT PAYOUTS TABLE (Pollar Stablecoin & Local Bank Clearing)
create table if not exists public.settlement_payouts (
  id uuid primary key default uuid_generate_v4(),
  agreement_id text references public.agreements(id) on delete cascade unique not null,
  beneficiary_tag text references public.profiles(user_tag) not null,
  target_currency text not null default 'NGN',
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  gross_amount_usd numeric(12,2) not null,
  protocol_fee_usd numeric(12,2) not null default 0,
  net_amount_usd numeric(12,2) not null,
  fx_rate numeric(12,4) not null,
  estimated_local_amount numeric(14,2) not null,
  status payout_status not null default 'PENDING',
  provider_reference text,
  cleared_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ACTIVITY LOGS (Immutable Cryptographic Audit Trail)
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  agreement_id text references public.agreements(id) on delete cascade not null,
  actor_tag text not null,
  action text not null,
  details text not null,
  event_type text not null default 'system',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.agreements enable row level security;
alter table public.milestones enable row level security;
alter table public.escrow_vaults enable row level security;
alter table public.settlement_payouts enable row level security;
alter table public.activity_logs enable row level security;

-- Drop existing policies if any to prevent duplicate errors
drop policy if exists "Allow reading verified profiles" on public.profiles;
drop policy if exists "Allow all operations on profiles" on public.profiles;
drop policy if exists "Users can view agreements they belong to" on public.agreements;
drop policy if exists "Allow all operations on agreements" on public.agreements;
drop policy if exists "Allow all operations on milestones" on public.milestones;
drop policy if exists "Allow all operations on escrow_vaults" on public.escrow_vaults;
drop policy if exists "Allow all operations on settlement_payouts" on public.settlement_payouts;
drop policy if exists "Allow all operations on activity_logs" on public.activity_logs;

-- Permissive policies for MVP application synchronization
create policy "Allow all operations on profiles"
  on public.profiles for all
  using (true)
  with check (true);

create policy "Allow all operations on agreements"
  on public.agreements for all
  using (true)
  with check (true);

create policy "Allow all operations on milestones"
  on public.milestones for all
  using (true)
  with check (true);

create policy "Allow all operations on escrow_vaults"
  on public.escrow_vaults for all
  using (true)
  with check (true);

create policy "Allow all operations on settlement_payouts"
  on public.settlement_payouts for all
  using (true)
  with check (true);

create policy "Allow all operations on activity_logs"
  on public.activity_logs for all
  using (true)
  with check (true);

-- 10. INITIAL SEED DATA
insert into public.profiles (user_tag, email, full_name, role, company_or_title, location, is_verified, verified_at, shielded_z_address, pollar_id, bank_name, bank_account_number, bank_account_name)
values 
  ('@davidvance', 'david@apexdesign.co.uk', 'David Vance', 'client', 'Apex Design Studio Ltd', 'London, UK', true, now(), 'u1apex93kd84920kmd01928472910kdjs8839201928374652019283746589', 'POL-UK-9921', null, null, null),
  ('@amaraokafor', 'amara.okafor@devhub.ng', 'Amara Okafor', 'freelancer', 'Senior Full-Stack Engineer', 'Lagos, Nigeria', true, now(), 'u1amara01928374650192837465lagos091827364510293847561029384756', 'POL-NG-8840', 'Guaranty Trust Bank (GTBank)', '0149928371', 'AMARA BLESSING OKAFOR'),
  ('@admin', 'admin@kordia.work', 'Kordia Node Admin', 'admin', 'Kordia Protocol Operations', 'Global Escrow Network', true, now(), null, 'POL-GLOBAL-0001', null, null, null)
on conflict (user_tag) do nothing;

-- 11. SUPABASE STORAGE BUCKET FOR IMAGES & DELIVERABLES
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/zip']
)
on conflict (id) do update set public = true;

drop policy if exists "Public Access to Images" on storage.objects;
create policy "Public Access to Images"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "Allow Public Uploads to Images" on storage.objects;
create policy "Allow Public Uploads to Images"
  on storage.objects for insert
  with check (bucket_id = 'images');

drop policy if exists "Allow Public Updates on Images" on storage.objects;
create policy "Allow Public Updates on Images"
  on storage.objects for update
  using (bucket_id = 'images');

drop policy if exists "Allow Public Deletes on Images" on storage.objects;
create policy "Allow Public Deletes on Images"
  on storage.objects for delete
  using (bucket_id = 'images');
