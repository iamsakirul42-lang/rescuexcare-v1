import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export function Analytics() {
  const [signupData, setSignupData] = useState([]);
  const [cancellationData, setCancellationData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    try {
      // 1. Fetch User Signups (profiles table)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at');
        
      if (profiles) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const signupCounts = {};
        
        profiles.forEach(p => {
          if (p.created_at) {
            const date = new Date(p.created_at);
            const monthName = months[date.getMonth()];
            signupCounts[monthName] = (signupCounts[monthName] || 0) + 1;
          }
        });
        
        const currentMonth = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          let d = new Date();
          d.setMonth(currentMonth - i);
          const m = months[d.getMonth()];
          last6Months.push({
            name: m,
            value: signupCounts[m] || 0
          });
        }
        setSignupData(last6Months);
      }

      // 2. Fetch Bookings for Cancellations and Response Times
      const { data: bookings } = await supabase
        .from('bookings')
        .select('created_at, status, service_start_time');

      if (bookings) {
        // Cancellations
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const cancellations = bookings.filter(b => b.status === 'cancelled' && b.created_at);
        const weeksCount = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
        
        cancellations.forEach(c => {
          const d = new Date(c.created_at);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const date = d.getDate();
            const week = Math.ceil(date / 7);
            const weekName = `Week ${week > 4 ? 4 : week}`;
            weeksCount[weekName] = (weeksCount[weekName] || 0) + 1;
          }
        });
        
        setCancellationData([
          { name: 'Week 1', value: weeksCount['Week 1'] },
          { name: 'Week 2', value: weeksCount['Week 2'] },
          { name: 'Week 3', value: weeksCount['Week 3'] },
          { name: 'Week 4', value: weeksCount['Week 4'] + weeksCount['Week 5'] },
        ]);

        // Response Time
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const responseTimes = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        
        bookings.forEach(b => {
          if (b.created_at && b.service_start_time) {
            const start = new Date(b.created_at);
            const serviceStart = new Date(b.service_start_time);
            const diffInMinutes = Math.floor((serviceStart - start) / 60000);
            
            if (diffInMinutes > 0 && diffInMinutes < 1440) { // Assuming response within 24 hrs
               const dayName = daysOfWeek[start.getDay()];
               if (responseTimes[dayName]) {
                 responseTimes[dayName].push(diffInMinutes);
               }
            }
          }
        });
        
        const avgResponseData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
          const times = responseTimes[day];
          const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
          return { name: day, value: avg };
        });
        
        setResponseTimeData(avgResponseData);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <div className="flex items-center justify-center h-64 border border-gray-800 rounded-xl bg-sidebar">
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
