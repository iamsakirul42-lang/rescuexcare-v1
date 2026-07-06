const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const bookingPayload = {
    booking_number: 'BK' + Date.now().toString().slice(-6),
    status: 'pending',
    booking_type: 'instant',
    vehicle_type: null,
    notes: 'General Service',
    location_address: 'Unknown Location',
    scheduled_date: null,
    scheduled_time: null,
    total_amount: 0,
    payment_method: 'cash',
    payment_status: 'pending',
    start_otp: '1234',
    completion_otp: '5678'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingPayload])
    .select()
    .single();

  console.log('Insert Result:', { data, error });
  
  if (data) {
    const { data: allBookings, error: fetchError } = await supabase.from('bookings').select('*');
    console.log('All Bookings Count:', allBookings?.length);
  }
}

testInsert();
