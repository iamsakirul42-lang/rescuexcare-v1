import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Logging in to Supabase...');
  
  // NOTE TO USER: enter your password here before running!
  const password = process.argv[2] || 'YOUR_PASSWORD_HERE';
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dearsakirul@gmail.com',
    password: password
  });

  if (error) {
    console.error('Login Failed:', error.message);
    console.log('\nDid you forget your password? Use the Forgot Password link on the dashboard!');
    return;
  }

  const userId = data.user.id;
  console.log('\n✅ Login Successful!');
  console.log('----------------------------------------');
  console.log(`YOUR CORRECT USER ID IS: ${userId}`);
  console.log('----------------------------------------\n');

  console.log('Checking profiles table for this exact ID...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.log('❌ NO ROW FOUND IN PROFILES TABLE!');
    console.log(`\nYou must go to the Table Editor -> 'profiles' and insert a row with:`);
    console.log(`id:   ${userId}`);
    console.log(`role: admin\n`);
  } else {
    console.log('✅ Row found in profiles table!');
    console.log(`Current Role: ${profile.role}`);
    if (profile.role !== 'admin') {
      console.log(`\n❌ Your role is NOT admin. Please change it to 'admin' in the Table Editor.`);
    } else {
      console.log(`\n✅ Everything is perfect. You should be able to log in to the dashboard!`);
    }
  }
}

check();
