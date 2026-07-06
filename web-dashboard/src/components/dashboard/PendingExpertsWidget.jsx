import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileSignature, CheckCircle, XCircle } from 'lucide-react';

export function PendingExpertsWidget() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
    
    const subscription = supabase
      .channel('pending-experts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kyc_verifications' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPending = async () => {
    const { data } = await supabase
      .from('kyc_verifications')
      .select('*, mechanics(name, city)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (data) setPending(data);
    setLoading(false);
  };

  return (
    <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1326]">
        <div className="flex items-center gap-2">
          <FileSignature className="text-blue-500" size={18} />
          <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
        </div>
        <span className="text-xs font-bold bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full">
          {pending.length} New
        </span>
      </div>
      
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No pending approvals.</p>
        ) : (
          pending.map(item => (
            <div key={item.id} className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold uppercase overflow-hidden">
                  {item.mechanics?.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{item.mechanics?.name || 'Unknown'}</h4>
                  <p className="text-xs text-gray-500">{item.mechanics?.city || 'Bangalore'} • Applied {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-green-500 hover:text-green-400 bg-green-500/10 p-1.5 rounded-full transition-colors">
                  <CheckCircle size={16} />
                </button>
                <button className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-full transition-colors">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        <button className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors mt-2 pt-2 border-t border-gray-800">
          View All KYC Applications
        </button>
      </div>
    </div>
  );
}
