import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar } from 'lucide-react';

export function ScheduledBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
    const subscription = supabase
      .channel('scheduled-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchBookings = async () => {
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, mobile)')
      .eq('booking_type', 'scheduled')
      .in('status', ['pending', 'waiting_assignment'])
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (bookingsData) {
      // Fetch mechanics to map their names
      const expertIds = bookingsData.map(b => b.expert_id).filter(Boolean);
      let mechanicsMap = {};
      
      if (expertIds.length > 0) {
        const { data: mechanicsData } = await supabase
          .from('mechanics')
          .select('id, name')
          .in('id', expertIds);
          
        if (mechanicsData) {
          mechanicsData.forEach(m => {
            mechanicsMap[m.id] = m.name;
          });
        }
      }
      
      const enrichedBookings = bookingsData.map(b => ({
        ...b,
        mechanics: b.expert_id ? { name: mechanicsMap[b.expert_id] } : null
      }));
      
      setBookings(enrichedBookings);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'waiting_assignment':
        return <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Unassigned</span>;
      case 'expert_assigned':
      case 'expert_on_way':
        return <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">Assigned</span>;
      default:
        return <span className="text-gray-400 bg-gray-500/10 border border-gray-500/20 px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-sidebar rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)] overflow-hidden flex flex-col h-full min-w-0">
      <div className="p-4 border-b border-purple-500/20 flex justify-between items-center bg-[#130f1f]">
        <div className="flex items-center gap-2">
          <Calendar className="text-purple-500" size={18} />
          <h3 className="text-lg font-semibold text-white">Scheduled Bookings</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B1020] border-b border-purple-500/20">
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Booking #</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Customer</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Service</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Price</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Schedule</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Expert</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-sm text-gray-500">No scheduled bookings.</td>
              </tr>
            ) : (
              bookings.map(req => (
                <tr key={req.id} className="hover:bg-purple-500/5 transition-colors group">
                  <td className="p-3 text-sm font-bold text-white">#{req.id.slice(0, 8)}</td>
                  <td className="p-3 text-sm text-gray-300">{req.profiles?.full_name || 'User'}</td>
                  <td className="p-3 text-sm text-purple-200 font-medium">{req.notes || 'General Service'}</td>
                  <td className="p-3 text-sm text-green-400 font-medium">₹{req.total_amount || 0}</td>
                  <td className="p-3 text-sm text-gray-400">
                    {req.scheduled_date ? `${req.scheduled_date} at ${req.scheduled_time || '10:00 AM'}` : 'Tomorrow at 10:00 AM'}
                  </td>
                  <td className="p-3 text-sm text-gray-300">{req.mechanics?.name || <span className="text-gray-500 italic">None</span>}</td>
                  <td className="p-3">{getStatusBadge(req.status)}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button className="text-purple-400 hover:text-white text-xs font-medium transition-colors px-2 py-1">
                      Reassign
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs font-medium transition-colors px-2 py-1">
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
