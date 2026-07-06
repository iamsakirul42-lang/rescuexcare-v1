import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function InstantRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    const subscription = supabase
      .channel('instant-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, mobile)')
      .eq('booking_type', 'instant')
      .in('status', ['pending', 'waiting_assignment'])
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (data) setRequests(data);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'waiting_assignment':
        return <span className="text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Unassigned</span>;
      case 'expert_assigned':
      case 'expert_on_way':
        return <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Assigned</span>;
      default:
        return <span className="text-gray-400 bg-gray-500/10 border border-gray-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-sidebar rounded-xl border border-[#ff5e2c]/30 shadow-[0_0_15px_rgba(255,94,44,0.05)] overflow-hidden flex flex-col h-full min-w-0">
      <div className="p-4 border-b border-[#ff5e2c]/20 flex justify-between items-center bg-[#1a0f0c]">
        <div className="flex items-center gap-2">
          <Zap className="text-[#ff5e2c] fill-[#ff5e2c]" size={18} />
          <h3 className="text-lg font-semibold text-white">Instant Rescue Requests</h3>
        </div>
        <span className="text-xs font-bold bg-[#ff5e2c]/20 text-[#ff5e2c] px-3 py-1 rounded-full uppercase tracking-widest border border-[#ff5e2c]/30">
          Emergency
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#140b09] border-b border-[#ff5e2c]/20">
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Booking #</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Customer</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Problem</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Location</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Wait Time</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ff5e2c]/10">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-sm text-gray-500">No active instant requests.</td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="hover:bg-[#ff5e2c]/5 transition-colors group">
                  <td className="p-3 text-sm font-bold text-white">#{req.id.slice(0, 8)}</td>
                  <td className="p-3 text-sm text-gray-300">{req.profiles?.full_name || 'User'}</td>
                  <td className="p-3 text-sm text-orange-200 font-medium">{req.notes || 'General Issue'}</td>
                  <td className="p-3 text-sm text-gray-400 truncate max-w-[150px]">{req.location_address || 'Current Location'}</td>
                  <td className="p-3 text-sm text-gray-300">
                    <div className="flex items-center gap-1 text-[#ff5e2c]">
                      <Clock size={12} />
                      <span>-</span>
                    </div>
                  </td>
                  <td className="p-3">{getStatusBadge(req.status)}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <Link to="/dispatch" className="bg-[#ff5e2c]/20 hover:bg-[#ff5e2c]/30 text-[#ff5e2c] border border-[#ff5e2c]/50 px-2 py-1 rounded text-xs font-bold transition-colors">
                      Assign
                    </Link>
                    <Link to="/bookings" className="text-gray-400 hover:text-white text-xs font-medium transition-colors px-2 py-1">
                      View
                    </Link>
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
