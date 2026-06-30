import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) || 
    user.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">User Management</h1>
          <p className="text-gray-400 text-sm">View and manage customer accounts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export CSV</Button>
          <Button variant="primary">+ Add User</Button>
        </div>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-800 flex flex-wrap gap-4 justify-between items-center bg-[#0d1326] rounded-t-xl">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] text-sm text-white rounded-lg pl-10 pr-4 py-2 w-full border border-gray-800 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-[#111827] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
              <option>All Status</option>
              <option>Active</option>
              <option>Blocked</option>
            </select>
            <select className="bg-[#111827] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
              <option>All Time</option>
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bookings</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 border border-gray-700">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="font-medium">{user.name || 'Unknown User'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{user.phone}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-300">{user.total_bookings || 0}</td>
                    <td className="p-4">
                      {user.status === 'blocked' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                          <Ban size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
          <span>Showing {filteredUsers.length} users</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
