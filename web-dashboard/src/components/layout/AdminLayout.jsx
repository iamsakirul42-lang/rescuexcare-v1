import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!user) return;

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error || data?.role !== 'admin') {
        setIsAdmin(false);
        await signOut();
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user, signOut]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

