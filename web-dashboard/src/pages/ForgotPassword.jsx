import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-sidebar p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden">
        
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

        <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="mb-8 text-center mt-4">
          <h1 className="text-3xl font-extrabold tracking-tighter mb-2">
            Reset Password
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4 text-green-500">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
              Click the link to create a new password.
            </p>
            <Link to="/login">
              <Button fullWidth>Return to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-gray-400 text-sm mb-6 text-center">
              Enter your admin email address and we'll send you a link to reset your password.
            </p>

            <Input 
              label="Admin Email" 
              type="email" 
              placeholder="admin@rescuex.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth disabled={loading} className="mt-4">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" size={18} /> Sending Link...
                </span>
              ) : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
