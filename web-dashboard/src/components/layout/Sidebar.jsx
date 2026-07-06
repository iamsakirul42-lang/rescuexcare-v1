import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  FileCheck, 
  Calendar, 
  CalendarClock,
  IndianRupee, 
  Settings, 
  Bell, 
  Star, 
  LogOut,
  Map,
  Truck,
  UserMinus,
  PieChart
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Live Activity', icon: Map, path: '/live-activity' },
  { name: 'Dispatch Center', icon: Truck, path: '/dispatch' },
  { name: 'Scheduled Services', icon: CalendarClock, path: '/scheduled-services' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Account Deletions', icon: UserMinus, path: '/account-deletions' },
  { name: 'Mechanics', icon: Wrench, path: '/mechanics' },
  { name: 'KYC Verification', icon: FileCheck, path: '/kyc' },
  { name: 'Bookings', icon: Calendar, path: '/bookings' },
  { name: 'Financial Dashboard', icon: IndianRupee, path: '/finance' },
  { name: 'Services', icon: Settings, path: '/services' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Reviews', icon: Star, path: '/reviews' },
  { name: 'Analytics', icon: PieChart, path: '/analytics' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-gray-800 flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="flex items-center px-6 py-4 mb-2">
        <img 
          src="/logo.png" 
          alt="RescueX" 
          className="h-20 w-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
        <h1 className="text-3xl font-extrabold tracking-tighter hidden" style={{ display: 'none' }}>
          <span className="text-text">rescue</span>
          <span className="text-primary">X</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto flex flex-col gap-1 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
