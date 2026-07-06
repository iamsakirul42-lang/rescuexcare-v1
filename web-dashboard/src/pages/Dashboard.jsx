import React, { useState, useEffect } from 'react';
import { Users, Wrench, Calendar, IndianRupee, AlertCircle, Search, Filter } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

import { LiveUsersTable } from '../components/dashboard/LiveUsersTable';
import { LiveExpertsTable } from '../components/dashboard/LiveExpertsTable';
import { InstantRequestsTable } from '../components/dashboard/InstantRequestsTable';
import { ScheduledBookingsTable } from '../components/dashboard/ScheduledBookingsTable';
import { PendingExpertsWidget } from '../components/dashboard/PendingExpertsWidget';
import { FinancialActivityWidget } from '../components/dashboard/FinancialActivityWidget';
import { LiveNotificationsWidget } from '../components/dashboard/LiveNotificationsWidget';

const revenueData = [];

const vehicleData = [];

export function Dashboard() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const [filters, setFilters] = useState({ city: 'All', vehicle: 'All', status: 'All' });
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalExperts, setTotalExperts] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (usersCount !== null) setTotalUsers(usersCount);

      const { count: expertsCount } = await supabase
        .from('mechanics')
        .select('*', { count: 'exact', head: true });
        
      if (expertsCount !== null) setTotalExperts(expertsCount);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">RescueX Operations Center</h1>
          <p className="text-gray-400 text-sm">{currentDate}</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-[#111827] text-sm text-white rounded-lg pl-9 pr-4 py-2 w-64 border border-gray-800 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#111827] border border-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-600 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Users" value={totalUsers.toString()} change="0%" changeType="neutral" icon={Users} iconColor="#3B82F6" onClick={() => navigate('/users')} />
        <KpiCard title="Total Experts" value={totalExperts.toString()} change="0%" changeType="neutral" icon={Wrench} iconColor="#8B5CF6" onClick={() => navigate('/mechanics')} />
        <KpiCard title="Active Bookings" value="0" change="0%" changeType="neutral" icon={Calendar} iconColor="#22C55E" />
        <KpiCard title="Revenue Today" value="₹0" change="0%" changeType="neutral" icon={IndianRupee} iconColor="#F59E0B" />
        <KpiCard title="Pending KYC" value="0" change="None" changeType="neutral" icon={AlertCircle} iconColor="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InstantRequestsTable />
          <ScheduledBookingsTable />
        </div>
        <div className="space-y-6">
          <LiveNotificationsWidget />
          <PendingExpertsWidget />
          <FinancialActivityWidget />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveExpertsTable />
        <LiveUsersTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B3FD4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5B3FD4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#5B3FD4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Bookings by Vehicle</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: '#1f2937'}}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {vehicleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
