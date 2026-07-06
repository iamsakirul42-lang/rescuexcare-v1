import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export function Login() {
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP
  const [email, setEmail] = useState('dearsakirul@gmail.com');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      // AuthContext will update user state, useEffect will redirect
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-sidebar p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden">
        
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

        <div className="mb-8 flex flex-col items-center justify-center">
          <img 
            src="/logo.png" 
            alt="RescueX" 
            className="h-32 w-full object-contain mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2 hidden" style={{ display: 'none' }}>
            <span className="text-text">rescue</span>
            <span className="text-primary">X</span>
          </h1>
          <span className="text-xs font-bold tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">
            Admin Secured
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        {success && !error && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-1 text-center">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6 text-center">Sign in to manage your platform</p>

            <Input 
              label="Admin Email" 
              type="email" 
              placeholder="admin@rescuex.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-accent transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" size={18} /> Authenticating...
                </span>
              ) : 'Continue'}
            </Button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button 
              onClick={() => { setStep(1); setError(''); setSuccess(''); }}
              className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex justify-center mb-4 text-primary">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-center">Two-Step Verification</h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Enter the 6-digit code sent to <br/><span className="text-white font-medium">{email}</span>
            </p>

            <OtpInput length={6} onComplete={handleOtpComplete} disabled={loading || timeLeft === 0} />

            <div className="text-center mt-6">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-400 mb-2">
                  Code expires in <span className="text-primary font-bold">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-500 mb-2">Code expired. Please request a new one.</p>
              )}

              <button 
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : 'Didn\'t receive a code? Resend'}
              </button>
            </div>
            
            {loading && (
              <div className="flex justify-center mt-6 text-primary">
                <Loader2 className="animate-spin" size={24} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
