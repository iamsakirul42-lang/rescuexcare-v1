import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaGd2cmp4eHBib2x4Z3NsemFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NjEyOSwiZXhwIjoyMDk4MTMyMTI5fQ.32kmL6SYyCIH1tgFacSrdQXTKvZPrKLzSMCWDXHQ7s4"
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify Password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.session) {
      return new Response(
        JSON.stringify({ error: 'Invalid login credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Verify Role = 'admin' (Using anon key since it works)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          error: `Unauthorized access. Admins only. (Found role: ${profile?.role || 'none'})`,
          debug: { 
            userId: authData.user.id, 
            profile, 
            profileError,
            hasServiceKey: !!supabaseServiceKey,
            serviceKeyPrefix: supabaseServiceKey.substring(0, 10)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 3. Generate OTP & Hash
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Store in admin_otps
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // 5 min expiry

    const { data: otpRecord, error: insertError } = await supabaseAdmin
      .from('admin_otps')
      .insert({
        email,
        otp_hash: otpHash,
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: expiresAt.toISOString(),
      })
      .select('session_id')
      .single()

    if (insertError) throw insertError

    // 5. Send via Resend
    // Use RESEND_API_KEY from environment variables
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    await resend.emails.send({
      from: 'RescueX Security <security@rescuex.in>', 
      to: email,
      subject: 'Your RescueX Admin Login Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h1 style="color: #FF5A5F; margin-bottom: 0;">rescue<span style="color: #333;">X</span></h1>
          <p style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Admin Panel Verification</p>
          <h2 style="color: #333; margin-top: 30px;">Your Verification Code</h2>
          <p style="color: #555;">Please use the following 6-digit code to complete your login. This code is valid for 5 minutes.</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 14px;">If you did not request this login, please ignore this email and secure your account.</p>
        </div>
      `
    })

    return new Response(
      JSON.stringify({ session_id: otpRecord.session_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
