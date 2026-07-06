import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { IndianRupee, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export function FinancialActivityWidget() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking fetching financial activities by merging latest withdrawals and earnings
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    const { data: withdrawals } = await supabase
      .from('finance_withdrawals')
      .select('*, mechanics(name)')
      .order('created_at', { ascending: false })
      .limit(2);
      
    const { data: earnings } = await supabase
      .from('finance_earnings')
      .select('*, mechanics(name)')
      .order('created_at', { ascending: false })
      .limit(3);
      
    let combined = [];
    if (withdrawals) {
      combined = [...combined, ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))];
    }
    if (earnings) {
      combined = [...combined, ...earnings.map(e => ({ ...e, type: 'earning' }))];
    }
    
    // Sort combined by created_at desc
    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setActivities(combined.slice(0, 4));
    setLoading(false);
  };

  const renderActivityIcon = (type) => {
    switch (type) {
      case 'withdrawal':
        return <div className="p-2 bg-red-500/10 text-red-500 rounded-full"><ArrowUpRight size={14} /></div>;
      case 'earning':
        return <div className="p-2 bg-green-500/10 text-green-500 rounded-full"><ArrowDownRight size={14} /></div>;
      default:
        return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full"><CheckCircle2 size={14} /></div>;
    }
  };

  return (
    <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1326]">
        <div className="flex items-center gap-2">
          <IndianRupee className="text-yellow-500" size={18} />
          <h3 className="text-lg font-semibold text-white">Financial Activity</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent financial activity.</p>
        ) : (
          activities.map((act, idx) => (
            <div key={act.id || idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderActivityIcon(act.type)}
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {act.type === 'withdrawal' ? 'Withdrawal Request' : 'Commission Earned'}
                  </h4>
                  <p className="text-xs text-gray-500">{act.mechanics?.name || 'System'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${act.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                  {act.type === 'withdrawal' ? '-' : '+'}₹{act.amount}
                </span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{act.status || 'Success'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
