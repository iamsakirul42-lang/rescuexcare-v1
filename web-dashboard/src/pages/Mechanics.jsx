import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, CheckCircle, Ban, Clock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mechanics')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setMechanics(data);
    setLoading(false);
  };

  const filteredMechanics = mechanics.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Mechanic Management</h1>
          <p className="text-gray-400 text-sm">Manage rescue experts and service providers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-800 flex flex-wrap gap-4 justify-between items-center bg-[#0d1326] rounded-t-xl">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search mechanics..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] text-sm text-white rounded-lg pl-10 pr-4 py-2 w-full border border-gray-800 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-[#111827] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
              <option>All KYC Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <select className="bg-[#111827] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary">
              <option>Online/Offline</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mechanic</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">KYC</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Jobs</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Earnings</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading mechanics...</td></tr>
              ) : filteredMechanics.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No mechanics found.</td></tr>
              ) : (
                filteredMechanics.map(m => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                          {m.name ? m.name.substring(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div className="font-medium text-white">{m.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{m.phone}</td>
                    <td className="p-4">
                      {m.kyc_status === 'approved' ? <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">Approved</span> :
                       m.kyc_status === 'pending' ? <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span> :
                       <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">Rejected</span>}
                    </td>
                    <td className="p-4 text-sm text-gray-300 flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" /> {m.rating || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${m.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm text-gray-300">{m.is_online ? 'Online' : 'Offline'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{m.total_jobs || 0}</td>
                    <td className="p-4 text-sm text-gray-300">₹{m.total_earnings || 0}</td>
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
      </div>
    </div>
  );
}
