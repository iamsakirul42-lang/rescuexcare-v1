import React from 'react';
import { Button } from '../components/ui/Button';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const signupData = [
  { name: 'Jan', value: 500 },
  { name: 'Feb', value: 800 },
  { name: 'Mar', value: 1200 },
  { name: 'Apr', value: 1900 },
  { name: 'May', value: 2500 },
  { name: 'Jun', value: 3100 },
];

const cancellationData = [
  { name: 'Week 1', value: 12 },
  { name: 'Week 2', value: 19 },
  { name: 'Week 3', value: 15 },
  { name: 'Week 4', value: 8 },
];

const responseTimeData = [
  { name: 'Mon', value: 15 },
  { name: 'Tue', value: 12 },
  { name: 'Wed', value: 10 },
  { name: 'Thu', value: 14 },
  { name: 'Fri', value: 8 },
  { name: 'Sat', value: 18 },
  { name: 'Sun', value: 20 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm">Detailed insights on platform performance</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-[#111827] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <Button variant="outline">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Signups */}
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">User Signups</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Cancellation Trends</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cancellationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#1f2937'}}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Average Mechanic Response Time (min)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
