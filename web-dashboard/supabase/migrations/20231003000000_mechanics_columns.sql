alter table public.mechanics
add column dob text,
add column full_address text,
add column pin_code text,
add column vehicles text[],
add column services text[],
add column experience_years integer default 0,
add column bank_account_name text,
add column bank_account_number text,
add column bank_name text,
add column emergency_contact_name text,
add column emergency_contact_relation text,
add column emergency_contact_mobile text;
