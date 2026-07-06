-- Create mechanics table
create table if not exists public.mechanics (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    phone text not null,
    email text,
    kyc_status text default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create kyc_verifications table
create table if not exists public.kyc_verifications (
    id uuid default gen_random_uuid() primary key,
    mechanic_id uuid references public.mechanics(id) on delete cascade not null,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    aadhaar_url text,
    pan_url text,
    license_url text,
    rc_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.mechanics enable row level security;
alter table public.kyc_verifications enable row level security;

-- Create basic RLS policies
create policy "Allow public read access on mechanics"
  on public.mechanics for select
  to public
  using (true);

create policy "Allow all operations for admins on mechanics"
  on public.mechanics for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow public read access on kyc_verifications"
  on public.kyc_verifications for select
  to public
  using (true);

create policy "Allow all operations for admins on kyc_verifications"
  on public.kyc_verifications for all
  to authenticated
  using (true)
  with check (true);

-- Insert dummy data for testing the dashboard
insert into public.mechanics (id, name, phone, email, kyc_status)
values 
  ('11111111-1111-1111-1111-111111111111', 'Rahul Sharma', '+91 9876543210', 'rahul@example.com', 'pending');

insert into public.kyc_verifications (mechanic_id, status, aadhaar_url, pan_url, license_url, rc_url)
values
  ('11111111-1111-1111-1111-111111111111', 'pending', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1616422285623-aa301b8772a2?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1555529771-33234b3e8e12?q=80&w=600&auto=format&fit=crop');

-- Note: We are using Unsplash placeholder URLs for the documents so we can test the image viewer immediately without manually uploading files to the bucket first.

-- Enable storage bucket for real documents later
insert into storage.buckets (id, name, public) 
values ('kyc-documents', 'kyc-documents', true)
on conflict (id) do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'kyc-documents' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'kyc-documents' AND auth.role() = 'authenticated' );
