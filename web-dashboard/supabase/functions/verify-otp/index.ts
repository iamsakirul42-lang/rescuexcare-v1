import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, otp } = await req.json()
    
    if (!session_id || !otp) {
      return new Response(
        JSON.stringify({ error: 'Missing session_id or OTP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaGd2cmp4eHBib2x4Z3NsemFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NjEyOSwiZXhwIjoyMDk4MTMyMTI5fQ.32kmL6SYyCIH1tgFacSrdQXTKvZPrKLzSMCWDXHQ7s4"
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch the OTP record
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('admin_otps')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (fetchError || !record) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Check Expiry
    if (new Date(record.expires_at) < new Date()) {
      await supabaseAdmin.from('admin_otps').delete().eq('session_id', session_id)
      return new Response(
        JSON.stringify({ error: 'OTP has expired. Please try logging in again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 3. Check Attempts
    if (record.attempts >= 5) {
      await supabaseAdmin.from('admin_otps').delete().eq('session_id', session_id)
      return new Response(
        JSON.stringify({ error: 'Maximum verification attempts reached. Please try logging in again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 4. Verify OTP Hash
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (otpHash !== record.otp_hash) {
      // Increment attempts
      await supabaseAdmin
        .from('admin_otps')
        .update({ attempts: record.attempts + 1 })
        .eq('session_id', session_id)

      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 5. Success! Return tokens and delete record
    await supabaseAdmin.from('admin_otps').delete().eq('session_id', session_id)

    return new Response(
      JSON.stringify({ 
        access_token: record.access_token,
        refresh_token: record.refresh_token
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
