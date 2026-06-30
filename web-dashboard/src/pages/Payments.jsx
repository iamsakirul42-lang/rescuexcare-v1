import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { KpiCard } from '../components/ui/KpiCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTrend = [
  { name: 'W1', value: 250000 },
  { name: 'W2', value: 310000 },
  { name: 'W3', value: 280000 },
  { name: 'W4', value: 420000 },
];

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*, users(name), mechanics(name)')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (data) setPayments(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Revenue & Payments</h1>
        <p className="text-gray-400 text-sm">Monitor platform earnings and transaction history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Today's Revenue" value="₹42,350" icon={IndianRupee} iconColor="#22C55E" />
        <KpiCard title="This Week" value="₹2.8L" icon={TrendingUp} iconColor="#3B82F6" />
        <KpiCard title="This Month" value="₹11.2L" icon={Wallet} iconColor="#F97316" />
        <KpiCard title="Total Revenue" value="₹84.5L" icon={CreditCard} iconColor="#8B5CF6" />
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Revenue Trend (30 Days)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTrend}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-[#0d1326]">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Txn ID</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mechanic</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading transactions...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No transactions found.</td></tr>
              ) : (
                payments.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">#{txn.id.split('-')[0]}</td>
                    <td className="p-4 text-sm text-gray-300">{txn.users?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-300">{txn.mechanics?.name || '—'}</td>
                    <td className="p-4 text-sm font-medium text-white">₹{txn.amount}</td>
                    <td className="p-4 text-sm text-gray-400 uppercase">{txn.method || 'UPI'}</td>
                    <td className="p-4">
                      {txn.status === 'success' ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">Success</span> :
                       <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span>}
                    </td>
                    <td className="p-4 text-sm text-gray-400">{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
