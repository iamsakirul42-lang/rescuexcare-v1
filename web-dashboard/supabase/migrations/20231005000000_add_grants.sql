-- Grant necessary permissions to the API roles
GRANT ALL ON TABLE public.mechanics TO anon;
GRANT ALL ON TABLE public.mechanics TO authenticated;
GRANT ALL ON TABLE public.mechanics TO service_role;

GRANT ALL ON TABLE public.kyc_verifications TO anon;
GRANT ALL ON TABLE public.kyc_verifications TO authenticated;
GRANT ALL ON TABLE public.kyc_verifications TO service_role;
