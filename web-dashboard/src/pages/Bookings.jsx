import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, X, Clock, User, Wrench, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data: bookingsData, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Bookings Fetch Error:', error);
      setLoading(false);
      return;
    }

    if (bookingsData && bookingsData.length > 0) {
      // Manually fetch relations since Foreign Keys might be missing
      const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
      const expertIds = [...new Set(bookingsData.map(b => b.expert_id).filter(Boolean))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, mobile')
        .in('id', userIds);

      const { data: mechanics } = await supabase
        .from('mechanics')
        .select('id, name')
        .in('id', expertIds);

      const mappedBookings = bookingsData.map(b => ({
        ...b,
        profiles: profiles?.find(p => p.id === b.user_id) || null,
        mechanics: mechanics?.find(m => m.id === b.expert_id) || null
      }));

      setBookings(mappedBookings);
    } else {
      setBookings([]);
    }
    
    setLoading(false);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'instant') return booking.booking_type === 'instant';
    if (filter === 'scheduled') return booking.booking_type === 'scheduled';
    if (filter === 'active') return ['pending', 'waiting_assignment', 'expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification'].includes(booking.status);
    if (filter === 'completed') return ['booking_completed', 'completed'].includes(booking.status);
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Booking Management</h1>
          <p className="text-gray-400 text-sm">View all active and past service requests</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'all' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>All ({bookings.length})</button>
        <button onClick={() => setFilter('instant')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'instant' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>Instant ({bookings.filter(b => b.booking_type === 'instant').length})</button>
        <button onClick={() => setFilter('scheduled')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'scheduled' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>Scheduled ({bookings.filter(b => b.booking_type === 'scheduled').length})</button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'active' ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white'}`}>Active ({bookings.filter(b => ['pending', 'waiting_assignment', 'expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification'].includes(b.status)).length})</button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'completed' ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:text-white'}`}>Completed ({bookings.filter(b => ['booking_completed', 'completed'].includes(b.status)).length})</button>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking ID</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mechanic</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Issue</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading bookings...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No bookings found.</td></tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">#{booking.id.split('-')[0]}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.profiles?.full_name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.mechanics?.name || '—'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.vehicle_type || 'Car'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.notes || 'General'}</td>
                    <td className="p-4">
                      {['booking_completed', 'completed'].includes(booking.status) ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">Completed</span> :
                       ['pending', 'waiting_assignment'].includes(booking.status) ? <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span> :
                       ['expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification'].includes(booking.status) ? <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">In Progress</span> :
                       <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">Cancelled</span>}
                    </td>
                    <td className="p-4 text-sm font-medium text-white">₹{booking.total_amount || 0}</td>
                    <td className="p-4">
                      {booking.rating ? (
                        <div className="flex flex-col">
                          <span className="text-yellow-500 font-bold">★ {booking.rating}/5</span>
                          {booking.review && <span className="text-xs text-gray-400 truncate max-w-[150px]">{booking.review}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
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
      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">Booking Details</h2>
                <p className="text-sm text-gray-400">ID: #{selectedBooking.id}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800/50 hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Users Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-blue-400" />
                    <span className="font-semibold text-gray-300">Customer</span>
                  </div>
                  <p className="text-lg font-medium text-white">{selectedBooking.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{selectedBooking.profiles?.mobile || 'No mobile'}</p>
                </div>
                <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench size={16} className="text-orange-400" />
                    <span className="font-semibold text-gray-300">Expert Assigned</span>
                  </div>
                  <p className="text-lg font-medium text-white">{selectedBooking.mechanics?.name || 'Pending'}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-800">
                <h3 className="font-semibold text-gray-300 mb-3 border-b border-gray-700/50 pb-2">Service Information</h3>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Vehicle</span>
                    <p className="text-sm font-medium text-white">{selectedBooking.vehicle_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Status</span>
                    <p className="text-sm font-medium text-blue-400 capitalize">{selectedBooking.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Issue / Service</span>
                    <p className="text-sm font-medium text-white">{selectedBooking.notes || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Amount</span>
                    <p className="text-sm font-medium text-white">₹{selectedBooking.total_amount || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-700/50 pb-2">
                  <Clock size={16} className="text-green-400" />
                  <h3 className="font-semibold text-gray-300">Service Timing</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Requested At</span>
                    <p className="text-sm font-medium text-white">
                      {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Started At</span>
                    <p className="text-sm font-medium text-white">
                      {selectedBooking.service_start_time ? new Date(selectedBooking.service_start_time).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Completed At</span>
                    <p className="text-sm font-medium text-white">
                      {selectedBooking.service_end_time ? new Date(selectedBooking.service_end_time).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 mt-2 pt-2 border-t border-gray-700/50">
                    <span className="text-xs text-gray-500 uppercase">Total Service Time</span>
                    <p className="text-lg font-bold text-green-400">
                      {(() => {
                        if (!selectedBooking.service_start_time || !selectedBooking.service_end_time) return 'N/A';
                        const start = new Date(selectedBooking.service_start_time);
                        const end = new Date(selectedBooking.service_end_time);
                        const diffInSeconds = Math.floor((end - start) / 1000);
                        if (diffInSeconds < 0) return 'Invalid time';
                        const h = Math.floor(diffInSeconds / 3600);
                        const m = Math.floor((diffInSeconds % 3600) / 60);
                        const s = diffInSeconds % 60;
                        return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {selectedBooking.rating && (
                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-yellow-500" />
                    <h3 className="font-semibold text-yellow-500">Customer Rating & Feedback</h3>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xl font-bold text-white">{selectedBooking.rating}</span>
                    <span className="text-gray-400">/ 5</span>
                  </div>
                  {selectedBooking.review && selectedBooking.review.trim() !== '' ? (
                    <p className="text-sm text-gray-300 italic mt-2">"{selectedBooking.review}"</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-2">No written review provided.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
