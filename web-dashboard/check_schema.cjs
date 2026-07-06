require('dotenv').config({ path: '../rescueX-mobile/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error('Error fetching notifications:', error);
  } else {
    console.log('Notifications Table Row Sample:');
    console.log(data);
  }
}

checkSchema();
