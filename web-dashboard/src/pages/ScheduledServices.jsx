import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function ScheduledServices() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [onlineMechanics, setOnlineMechanics] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchOnlineMechanics();

    const subscription = supabase
      .channel('scheduled-services-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    const mechanicChannel = supabase
      .channel('public:mechanics-sched')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mechanics' }, () => {
        fetchOnlineMechanics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(mechanicChannel);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, mobile)')
      .eq('booking_type', 'scheduled')
      .order('created_at', { ascending: false });

    if (data) {
      const expertIds = data.map(b => b.expert_id).filter(Boolean);
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

      const enrichedBookings = data.map(b => ({
        ...b,
        mechanics: b.expert_id ? { name: mechanicsMap[b.expert_id] } : null
      }));

      setBookings(enrichedBookings);
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'waiting_assignment', 'expert_assigned', 'expert_on_way', 'service_in_progress'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'booking_completed' || booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const fetchOnlineMechanics = async () => {
    const { data } = await supabase
      .from('mechanics')
      .select('*')
      .eq('is_online', true)
      .eq('kyc_status', 'approved');
    if (data) setOnlineMechanics(data);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled booking?")) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (error) throw error;
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel request.');
    }
  };

  const handleAssignMechanic = async (bookingId, mechanicId) => {
    if (assigningId) return;
    setAssigningId(mechanicId);
    try {
      // Auto-cancel any previous active jobs for this expert
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('expert_id', mechanicId)
        .neq('id', bookingId)
        .in('status', ['expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification']);

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'expert_assigned',
          expert_id: mechanicId
        })
        .eq('id', bookingId);
      if (error) throw error;
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert('Failed to assign mechanic.');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <CalendarClock className="text-primary" size={32} />
            Scheduled Services
          </h1>
          <p className="text-gray-400 text-sm">Manage all scheduled rescue requests</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'all' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>All ({bookings.length})</button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'active' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>Active ({bookings.filter(b => ['pending', 'waiting_assignment', 'expert_assigned', 'expert_on_way', 'service_in_progress'].includes(b.status)).length})</button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'completed' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>Completed ({bookings.filter(b => b.status === 'booking_completed' || b.status === 'completed').length})</button>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking ID</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Schedule Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading scheduled services...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No scheduled services found.</td></tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">#{booking.id.split('-')[0]}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.profiles?.full_name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.vehicle_type || 'Not Specified'}</td>
                    <td className="p-4 text-sm text-purple-200 font-medium">{booking.notes || 'General Service'}</td>
                    <td className="p-4 text-sm text-green-400 font-medium">₹{booking.total_amount || 0}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {booking.scheduled_date ? `${booking.scheduled_date} at ${booking.scheduled_time || '10:00 AM'}` : 'Not Specified'}
                    </td>
                    <td className="p-4">
                      {['booking_completed', 'completed'].includes(booking.status) ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">Completed</span> :
                        ['pending', 'waiting_assignment'].includes(booking.status) ? <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span> :
                          ['expert_assigned', 'expert_on_way'].includes(booking.status) ? <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">Assigned</span> :
                            booking.status === 'service_in_progress' ? <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">In Progress</span> :
                              <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">Cancelled</span>}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {['pending', 'waiting_assignment'].includes(booking.status) && (
                        <>
                          <button onClick={() => setSelectedBooking(booking)} className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-xs font-bold px-3">
                            Assign
                          </button>
                          <button onClick={() => handleCancel(booking.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-xs font-bold px-3">
                            Cancel
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 rounded-lg transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-sidebar w-full max-w-md rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">Assign Mechanic</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <p className="text-sm text-gray-400 mb-2">Select an expert for booking #{selectedBooking.id.split('-')[0]}</p>
              {onlineMechanics.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">No mechanics online.</div>
              ) : (
                onlineMechanics.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-[#0B1020] p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {m.name ? m.name.substring(0, 2).toUpperCase() : 'M'}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.phone}</div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="text-xs py-1 px-3"
                      onClick={() => handleAssignMechanic(selectedBooking.id, m.id)}
                      disabled={!!assigningId}
                    >
                      {assigningId === m.id ? 'Assigning...' : 'Dispatch'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
