import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function LiveExpertsTable() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveExperts();
    
    const subscription = supabase
      .channel('live-experts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mechanics' }, () => {
        fetchLiveExperts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLiveExperts = async () => {
    const { data } = await supabase
      .from('mechanics')
      .select('*')
      .eq('is_online', true)
      .limit(6);
      
    // If we don't have is_online data, fallback to some latest experts
    if (data && data.length > 0) {
      setExperts(data);
    } else {
      const { data: fallback } = await supabase
        .from('mechanics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setExperts(fallback || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (expert) => {
    // Mock logic
    const status = expert.is_online ? 'online' : 'offline';
    const colors = {
      online: 'bg-green-500/10 text-green-400 border-green-500/20',
      busy: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      offline: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors[status]}`}>
        {status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
        {status}
      </span>
    );
  };

  return (
    <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col h-full min-w-0">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1326]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Live Experts</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B1020] border-b border-gray-800">
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Expert Name</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Vehicle</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">City</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Today's Jobs</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : experts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-sm text-gray-500">No live experts.</td>
              </tr>
            ) : (
              experts.map(expert => (
                <tr key={expert.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-3 text-sm font-medium text-white">{expert.name || 'Unknown'}</td>
                  <td className="p-3 text-sm text-gray-300">{expert.specialization || 'All'}</td>
                  <td className="p-3 text-sm text-gray-400">{expert.city || '-'}</td>
                  <td className="p-3">{getStatusBadge(expert)}</td>
                  <td className="p-3 text-sm text-gray-300 font-medium">0</td>
                  <td className="p-3 text-right">
                    <button className="text-primary hover:text-white text-xs font-medium transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
