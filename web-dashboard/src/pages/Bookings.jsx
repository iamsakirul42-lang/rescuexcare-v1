import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rescue_requests')
      .select('*, users(name), mechanics(name)')
      .order('created_at', { ascending: false });
      
    if (data) setBookings(data);
    setLoading(false);
  };

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

      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full">All ({bookings.length})</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Active (23)</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Completed (1,180)</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancelled (44)</button>
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
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No bookings found.</td></tr>
              ) : (
                bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">#{booking.id.split('-')[0]}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.users?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.mechanics?.name || '—'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.vehicle_type || 'Car'}</td>
                    <td className="p-4 text-sm text-gray-300">{booking.issue_type || 'General'}</td>
                    <td className="p-4">
                      {booking.status === 'completed' ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">Completed</span> :
                       booking.status === 'pending' ? <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span> :
                       booking.status === 'in-progress' ? <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">In Progress</span> :
                       <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">Cancelled</span>}
                    </td>
                    <td className="p-4 text-sm font-medium text-white">₹{booking.amount || 0}</td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors">
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
    </div>
  );
}
