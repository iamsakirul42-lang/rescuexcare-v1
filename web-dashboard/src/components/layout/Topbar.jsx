import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="h-18 bg-sidebar border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white lg:hidden">
          <Menu size={24} />
        </button>
        <div className="text-lg font-semibold text-white hidden sm:block">
          Welcome back, Admin
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#0B1020] text-sm text-white rounded-full pl-10 pr-4 py-2 w-64 border border-gray-800 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-800 pl-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white">Admin User</div>
            <div className="text-xs text-gray-500">{user?.email || 'admin@rescuex.in'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
