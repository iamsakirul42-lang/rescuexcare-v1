-- Drop existing policies if any to avoid conflicts
drop policy if exists "Allow all operations for admins on mechanics" on public.mechanics;
drop policy if exists "Allow public read access on mechanics" on public.mechanics;
drop policy if exists "Allow all operations for admins on kyc_verifications" on public.kyc_verifications;
drop policy if exists "Allow public read access on kyc_verifications" on public.kyc_verifications;
drop policy if exists "Enable insert for authenticated users" on public.mechanics;
drop policy if exists "Enable update for authenticated users" on public.mechanics;

-- Recreate policies broadly for mechanics
create policy "mechanics_select_all" on public.mechanics for select using (true);
create policy "mechanics_insert_auth" on public.mechanics for insert to authenticated with check (true);
create policy "mechanics_update_auth" on public.mechanics for update to authenticated using (true) with check (true);

-- Recreate policies broadly for kyc_verifications
create policy "kyc_verifications_select_all" on public.kyc_verifications for select using (true);
create policy "kyc_verifications_insert_auth" on public.kyc_verifications for insert to authenticated with check (true);
create policy "kyc_verifications_update_auth" on public.kyc_verifications for update to authenticated using (true) with check (true);
