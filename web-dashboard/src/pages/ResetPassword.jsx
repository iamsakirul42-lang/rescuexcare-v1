import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, KeyRound } from 'lucide-react';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  // If they arrived here but aren't authenticated by the recovery token, 
  // they can't reset their password. (Though Supabase Auth processes the token instantly)
  useEffect(() => {
    // We give it a moment to see if the session initializes from the hash
    const timeout = setTimeout(() => {
      if (!user && !window.location.hash.includes('access_token')) {
        navigate('/login');
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setSuccess(true);
      // Redirect to login after success
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-sidebar p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden">
        
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

        <div className="flex justify-center mb-4 mt-2 text-primary">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound size={32} />
          </div>
        </div>

        <div className="mb-8 text-center mt-4">
          <h1 className="text-3xl font-extrabold tracking-tighter mb-2">
            Set New Password
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2">
            Password successfully updated! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-gray-400 text-sm mb-6 text-center">
              Please enter your new secure password below.
            </p>

            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Input 
              label="Confirm Password" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" size={18} /> Updating...
                </span>
              ) : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
