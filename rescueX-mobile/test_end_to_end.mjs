import { createClient } from '@supabase/supabase-js';

// Environment variables provided by user earlier
const supabaseUrl = 'https://mjhgvrjxxpbolxgslzaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaGd2cmp4eHBib2x4Z3NsemFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTYxMjksImV4cCI6MjA5ODEzMjEyOX0.ir8hHUa5PYrKthOQvtlcmzhDO6eJ7Tx01ss85Huzr9Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
  console.log('--- Starting End-to-End Test ---');

  const userId = '429fbcb1-a3d9-4f03-b7ea-7abb606d9662';
  const testEmail = 'testexpert5699@gmail.com';

  console.log(`1. Using existing User ID: ${userId} due to rate limits...`);
  
  // Login to ensure session
  await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'TestPassword123!',
  });

  console.log('2. Simulating App Profile Creation...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      role: 'expert',
      full_name: 'Test Expert',
      email: testEmail,
      mobile: '1234567890',
      city: 'Test City'
    });

  if (profileError) {
    console.error('❌ Profile Creation Failed:', profileError.message);
    return;
  }
  console.log('✅ Profile inserted successfully into `profiles` table!');

  console.log('3. Simulating Expert Onboarding Submission...');
  const { error: expertProfileError } = await supabase
    .from('expert_profiles')
    .insert({
      id: userId,
      kyc_status: 'pending', // default
      dob: '01/01/1990',
      full_address: '123 Test Street, Test City',
      pin_code: '123456',
      vehicles: ['Car', 'Bike'],
      services: ['Towing', 'Jumpstart'],
      experience_years: 5,
      bank_account_name: 'Test Expert',
      bank_account_number: '1234567890',
      bank_name: 'Test Bank',
      emergency_contact_name: 'Test Emergency',
      emergency_contact_relation: 'Friend',
      emergency_contact_mobile: '0987654321'
    });

  if (expertProfileError) {
    console.error('❌ Expert Onboarding Submission Failed:', expertProfileError.message);
    return;
  }
  console.log('✅ Expert details inserted successfully into `expert_profiles` table!');

  console.log('4. Simulating Admin Dashboard Fetch (Pending Experts)...');
  const { data: adminData, error: adminError } = await supabase
    .from('expert_profiles')
    .select('*, profiles(full_name, mobile)')
    .eq('id', userId)
    .single();

  if (adminError) {
    console.error('❌ Admin Dashboard Fetch Failed:', adminError.message);
    return;
  }
  console.log(`✅ Admin Fetch Successful! Expert Name: ${adminData.profiles.full_name}, Status: ${adminData.kyc_status}`);

  console.log('5. Simulating Admin Approval Action...');
  const { error: approveError } = await supabase
    .from('expert_profiles')
    .update({ kyc_status: 'approved' })
    .eq('id', userId);

  if (approveError) {
    console.error('❌ Admin Approval Failed:', approveError.message);
    return;
  }
  
  // Verify it was updated
  const { data: verifyData } = await supabase.from('expert_profiles').select('kyc_status').eq('id', userId).single();
  console.log(`✅ Admin Approval Successful! New Status: ${verifyData.kyc_status}`);

  console.log('--- End-to-End Test Completed Successfully ---');
}

testFlow();
