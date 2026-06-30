import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-sidebar p-8 rounded-2xl shadow-xl border border-gray-800">
        
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            <span className="text-text">rescue</span>
            <span className="text-primary">X</span>
          </h1>
          <span className="text-xs font-bold tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full uppercase">
            Admin Panel
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to manage your platform</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm px-4 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="admin@rescuex.in" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="flex items-center justify-between mt-2 mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary" defaultChecked />
              Remember me
            </label>
            <a href="#" className="text-sm text-primary hover:text-accent transition-colors">
              Forgot password?
            </a>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
