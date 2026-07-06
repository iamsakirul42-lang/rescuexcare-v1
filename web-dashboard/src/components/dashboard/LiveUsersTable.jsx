import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function LiveUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveUsers();
    
    const subscription = supabase
      .channel('live-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchLiveUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLiveUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setUsers(data);
    setLoading(false);
  };

  return (
    <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col h-full min-w-0">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1326]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Live Users</h3>
        </div>
        <span className="text-xs font-medium bg-green-500/20 text-green-500 px-2.5 py-1 rounded-full">
          {users.length} Active
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B1020] border-b border-gray-800">
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">User Name</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Mobile</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">City</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-3 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-sm text-gray-500">No active users.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-3 text-sm font-medium text-white">{user.name || 'Unknown'}</td>
                  <td className="p-3 text-sm text-gray-300">{user.phone}</td>
                  <td className="p-3 text-sm text-gray-400">{user.city || '-'}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Online
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-primary hover:text-white text-xs font-medium transition-colors">
                      View Profile
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
