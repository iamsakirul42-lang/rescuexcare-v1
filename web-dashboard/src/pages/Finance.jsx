import React, { useState, useEffect, useMemo } from 'react';
import { IndianRupee, TrendingUp, CreditCard, Wallet, AlertCircle, CheckCircle, Clock, XCircle, Building2, Banknote, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { KpiCard } from '../components/ui/KpiCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatINR = (num) => {
  return '₹' + (Number(num) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

export function Finance() {
  const [earnings, setEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [chartPeriod, setChartPeriod] = useState('This Month');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Earnings
    const { data: eData } = await supabase
      .from('expert_earnings')
      .select('*')
      .order('created_at', { ascending: true }); // Ascending for chart
      
    if (eData) setEarnings(eData);

    // Fetch Withdrawals with expert details
    const { data: wData } = await supabase
      .from('withdrawal_requests')
      .select('*, expert_profiles(name, phone, bank_name, bank_account_name, bank_account_number)')
      .order('created_at', { ascending: false });

    if (wData) setWithdrawals(wData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Setup realtime subscriptions
    const eSub = supabase.channel('finance-earnings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expert_earnings' }, fetchData)
      .subscribe();

    const wSub = supabase.channel('finance-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(eSub);
      supabase.removeChannel(wSub);
    };
  }, []);

  const handleWithdrawalAction = async (id, status) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      alert('Failed to update status: ' + error.message);
    }
    // Realtime subscription will refresh the data automatically
  };

  // --- Calculations ---
  const metrics = useMemo(() => {
    let platformRevenue = 0;
    let todaysRevenue = 0;
    let thisMonthRevenue = 0;
    let grossBookingValue = 0;
    let totalExpertEarnings = 0;
    
    // RescueX Due
    let totalRescueXDue = 0;
    let pendingRescueXDue = 0;
    let collectedRescueXDue = 0;
    
    // Business Cards
    let totalCashJobs = 0;
    let totalOnlineJobs = 0;
    let totalCashCollected = 0;
    let totalOnlineCollection = 0;
    let onlineExpertPayable = 0;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    earnings.forEach(e => {
      const eDate = new Date(e.created_at);
      const isToday = e.created_at.startsWith(todayStr);
      const isThisMonth = eDate.getMonth() === thisMonth && eDate.getFullYear() === thisYear;
      
      const commission = Number(e.commission_amount) || 0;
      const expertAmt = Number(e.expert_amount) || 0;
      const serviceAmt = Number(e.service_amount) || 0;
      const platformDue = Number(e.platform_due) || 0;
      
      platformRevenue += commission;
      grossBookingValue += serviceAmt;
      totalExpertEarnings += expertAmt;
      
      if (isToday) todaysRevenue += commission;
      if (isThisMonth) thisMonthRevenue += commission;
      
      if (e.payment_method === 'cash') {
        totalCashJobs++;
        totalCashCollected += serviceAmt;
        totalRescueXDue += platformDue;
        if (e.platform_due_status === 'unpaid') pendingRescueXDue += platformDue;
        if (e.platform_due_status === 'paid') collectedRescueXDue += platformDue;
      } else {
        totalOnlineJobs++;
        totalOnlineCollection += serviceAmt;
        onlineExpertPayable += expertAmt;
      }
    });

    let wRequested = 0, wProcessing = 0, wApproved = 0, wPaid = 0, wRejected = 0;
    withdrawals.forEach(w => {
      const amt = Number(w.amount) || 0;
      wRequested += amt;
      if (w.status === 'processing') wProcessing += amt;
      if (w.status === 'approved') wApproved += amt;
      if (w.status === 'paid') wPaid += amt;
      if (w.status === 'rejected') wRejected += amt;
    });

    return {
      platformRevenue, todaysRevenue, thisMonthRevenue, grossBookingValue, totalExpertEarnings,
      avgBookingValue: earnings.length ? (grossBookingValue / earnings.length) : 0,
      totalRescueXDue, pendingRescueXDue, collectedRescueXDue,
      totalCashJobs, totalOnlineJobs, totalCashCollected, totalOnlineCollection, onlineExpertPayable,
      wRequested, wProcessing, wApproved, wPaid, wRejected
    };
  }, [earnings, withdrawals]);

  // Chart Data Generation based on chartPeriod
  const chartData = useMemo(() => {
    const dataMap = {};
    const now = new Date();
    now.setHours(0,0,0,0);
    
    let filterFn = () => true;
    let keyFn = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (chartPeriod === 'Today') {
      filterFn = (d) => d.getTime() === now.getTime();
      keyFn = (d) => d.getHours() + ':00';
    } else if (chartPeriod === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filterFn = (d) => d >= sevenDaysAgo;
    } else if (chartPeriod === 'This Month') {
      filterFn = (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (chartPeriod === 'This Year') {
      filterFn = (d) => d.getFullYear() === now.getFullYear();
      keyFn = (d) => d.toLocaleDateString('en-US', { month: 'short' });
    }

    earnings.forEach(e => {
      const d = new Date(e.created_at);
      const compareD = new Date(d);
      compareD.setHours(0,0,0,0);
      
      if (filterFn(compareD)) {
        const key = keyFn(d);
        if (!dataMap[key]) dataMap[key] = { name: key, value: 0 };
        dataMap[key].value += (Number(e.commission_amount) || 0);
      }
    });

    return Object.values(dataMap);
  }, [earnings, chartPeriod]);

  const filteredWithdrawals = withdrawals.filter(w => statusFilter === 'All' || w.status === statusFilter);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Financial Dashboard</h1>
        <p className="text-gray-400 text-sm">Real-time overview of platform revenue, expert earnings, and cash flow</p>
      </div>

      {/* Main Revenue KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Platform Revenue (13%)" value={formatINR(metrics.platformRevenue)} icon={IndianRupee} iconColor="#22C55E" />
        <KpiCard title="Today's Revenue" value={formatINR(metrics.todaysRevenue)} icon={TrendingUp} iconColor="#3B82F6" />
        <KpiCard title="This Month's Revenue" value={formatINR(metrics.thisMonthRevenue)} icon={Wallet} iconColor="#F97316" />
        <KpiCard title="Gross Booking Value" value={formatINR(metrics.grossBookingValue)} icon={CreditCard} iconColor="#8B5CF6" />
      </div>

      {/* RescueX Business KPIs */}
      <h3 className="text-lg font-semibold mt-8 mb-2">RescueX Business KPIs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Cash Jobs" value={metrics.totalCashJobs} icon={Briefcase} iconColor="#EAB308" />
        <KpiCard title="Total Online Jobs" value={metrics.totalOnlineJobs} icon={Briefcase} iconColor="#06B6D4" />
        <KpiCard title="Total Expert Earnings" value={formatINR(metrics.totalExpertEarnings)} icon={Banknote} iconColor="#10B981" />
        <KpiCard title="Avg Booking Value" value={formatINR(metrics.avgBookingValue)} icon={TrendingUp} iconColor="#6366F1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash vs Online Split */}
        <div className="space-y-6">
          <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
            <h4 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><Banknote size={18} className="text-yellow-500"/> Cash Jobs</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400"><span>Total Cash Collected</span><span className="text-white font-medium">{formatINR(metrics.totalCashCollected)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Platform Due Pending</span><span className="text-orange-500 font-medium">{formatINR(metrics.pendingRescueXDue)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Platform Due Paid</span><span className="text-green-500 font-medium">{formatINR(metrics.collectedRescueXDue)}</span></div>
              <div className="pt-2 mt-2 border-t border-gray-800 flex justify-between font-semibold">
                <span>Total RescueX Due</span><span className="text-white">{formatINR(metrics.totalRescueXDue)}</span>
              </div>
            </div>
          </div>

          <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
            <h4 className="font-semibold text-gray-200 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-cyan-500"/> Online Jobs</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400"><span>Total Online Collection</span><span className="text-white font-medium">{formatINR(metrics.totalOnlineCollection)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Platform Commission</span><span className="text-green-500 font-medium">{formatINR(metrics.totalOnlineCollection - metrics.onlineExpertPayable)}</span></div>
              <div className="pt-2 mt-2 border-t border-gray-800 flex justify-between font-semibold">
                <span>Expert Amount Payable</span><span className="text-white">{formatINR(metrics.onlineExpertPayable)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Platform Revenue Trend</h3>
            <select 
              value={chartPeriod} 
              onChange={e => setChartPeriod(e.target.value)}
              className="bg-[#0f1525] border border-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => [formatINR(val), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No revenue data for this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal KPIs */}
      <h3 className="text-lg font-semibold mt-8 mb-2">Withdrawals Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-sidebar border border-gray-800 p-4 rounded-xl text-center">
          <div className="text-sm text-gray-400 mb-1">Total Requested</div>
          <div className="text-xl font-bold">{formatINR(metrics.wRequested)}</div>
        </div>
        <div className="bg-[#1f2937]/30 border border-yellow-500/30 p-4 rounded-xl text-center">
          <div className="text-sm text-yellow-500 mb-1 flex items-center justify-center gap-1"><Clock size={14}/> Processing</div>
          <div className="text-xl font-bold text-yellow-400">{formatINR(metrics.wProcessing)}</div>
        </div>
        <div className="bg-[#1f2937]/30 border border-blue-500/30 p-4 rounded-xl text-center">
          <div className="text-sm text-blue-500 mb-1 flex items-center justify-center gap-1"><CheckCircle size={14}/> Approved</div>
          <div className="text-xl font-bold text-blue-400">{formatINR(metrics.wApproved)}</div>
        </div>
        <div className="bg-[#1f2937]/30 border border-green-500/30 p-4 rounded-xl text-center">
          <div className="text-sm text-green-500 mb-1 flex items-center justify-center gap-1"><Banknote size={14}/> Paid</div>
          <div className="text-xl font-bold text-green-400">{formatINR(metrics.wPaid)}</div>
        </div>
        <div className="bg-[#1f2937]/30 border border-red-500/30 p-4 rounded-xl text-center">
          <div className="text-sm text-red-500 mb-1 flex items-center justify-center gap-1"><XCircle size={14}/> Rejected</div>
          <div className="text-xl font-bold text-red-400">{formatINR(metrics.wRejected)}</div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-[#0d1326] flex justify-between items-center">
          <h3 className="text-lg font-semibold">Withdrawal Requests</h3>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0f1525] border border-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Expert Details</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Information</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading data...</td></tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No withdrawal requests found.</td></tr>
              ) : (
                filteredWithdrawals.map(w => {
                  const p = w.expert_profiles || {};
                  return (
                    <tr key={w.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{p.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{p.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300 font-medium">{p.bank_name || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{p.bank_account_number ? 'Acct: ' + p.bank_account_number : ''}</div>
                        <div className="text-xs text-gray-500">{p.bank_account_name ? 'Holder: ' + p.bank_account_name : ''}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-bold text-white">{formatINR(w.amount)}</td>
                      <td className="p-4">
                        {w.status === 'processing' && <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold uppercase">Processing</span>}
                        {w.status === 'approved' && <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold uppercase">Approved</span>}
                        {w.status === 'paid' && <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold uppercase">Paid</span>}
                        {w.status === 'rejected' && <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {w.status === 'processing' && (
                          <>
                            <button onClick={() => handleWithdrawalAction(w.id, 'approved')} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition">Approve</button>
                            <button onClick={() => handleWithdrawalAction(w.id, 'rejected')} className="bg-red-600/20 text-red-500 hover:bg-red-600/40 px-3 py-1.5 rounded text-xs font-semibold transition">Reject</button>
                          </>
                        )}
                        {w.status === 'approved' && (
                          <button onClick={() => handleWithdrawalAction(w.id, 'paid')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
