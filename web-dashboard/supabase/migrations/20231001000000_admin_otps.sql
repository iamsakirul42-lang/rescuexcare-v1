create table if not exists public.admin_otps (
    session_id uuid default gen_random_uuid() primary key,
    email text not null,
    otp_hash text not null,
    access_token text not null,
    refresh_token text not null,
    expires_at timestamp with time zone not null,
    attempts integer default 0 not null,
    created_at timestamp with time zone default now() not null
);

-- Secure the table
alter table public.admin_otps enable row level security;
-- No policies mean no one can access from the API (only service_role can access via backend)
