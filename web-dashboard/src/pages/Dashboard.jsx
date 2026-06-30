import React from 'react';
import { Users, Wrench, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const revenueData = [
  { name: 'Mon', value: 42000 },
  { name: 'Tue', value: 51000 },
  { name: 'Wed', value: 48000 },
  { name: 'Thu', value: 62000 },
  { name: 'Fri', value: 75000 },
  { name: 'Sat', value: 89000 },
  { name: 'Sun', value: 84000 },
];

const vehicleData = [
  { name: 'Bike', value: 145, color: '#3B82F6' },
  { name: 'Car', value: 289, color: '#F97316' },
  { name: 'Auto', value: 87, color: '#22C55E' },
  { name: 'Truck', value: 42, color: '#8B5CF6' },
];

export function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">{currentDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard title="Total Users" value="12,458" change="+12.5%" changeType="positive" icon={Users} iconColor="#3B82F6" />
        <KpiCard title="Total Mechanics" value="847" change="+8.2%" changeType="positive" icon={Wrench} iconColor="#8B5CF6" />
        <KpiCard title="Active Bookings" value="342" change="+23.1%" changeType="positive" icon={Calendar} iconColor="#22C55E" />
        <KpiCard title="Revenue Today" value="₹4.2L" change="+18.7%" changeType="positive" icon={IndianRupee} iconColor="#F59E0B" />
        <KpiCard title="Pending KYC" value="5" change="Needs Action" changeType="negative" icon={AlertCircle} iconColor="#EF4444" />
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

      <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Live Activity</h3>
        <div className="space-y-4">
          <ActivityItem dotColor="bg-green-500" text="New booking #RX20260627 — Car, Flat Tire" time="Just now" />
          <ActivityItem dotColor="bg-blue-500" text="Mechanic Rajesh accepted job #RX20260627" time="2 min ago" />
          <ActivityItem dotColor="bg-primary" text="New user registered: Arun Kumar (+91 98765xxxxx)" time="5 min ago" />
          <ActivityItem dotColor="bg-green-500" text="Booking #RX20260626 completed — ₹499" time="12 min ago" />
          <ActivityItem dotColor="bg-purple-500" text="KYC submitted by mechanic Suresh M." time="15 min ago" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ dotColor, text, time }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
      <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></div>
      <span className="text-sm text-gray-300 flex-1">{text}</span>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
}
