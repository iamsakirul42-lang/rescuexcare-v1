import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { MapPin, PhoneCall, Truck, AlertTriangle } from 'lucide-react';

export function DispatchCenter() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('rescue_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
        
      if (data) setRequests(data);
      setLoading(false);
    };

    fetchRequests();

    const channel = supabase
      .channel('public:rescue_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRequests((curr) => [...curr, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status !== 'pending') {
            setRequests((curr) => curr.filter((req) => req.id !== payload.new.id));
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dispatch Center</h1>
        <p className="text-gray-400 text-sm">Manage live rescue requests and assign mechanics manually</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px]">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Pending Requests ({requests.length})</h2>
          
          {loading ? (
            <div className="text-gray-400 py-4">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <AlertTriangle size={48} className="mb-4 opacity-50" />
              <p>No pending rescue requests right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-[#0B1020] p-4 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded">#{req.id.split('-')[0]}</span>
                      <h3 className="font-semibold text-white mt-2">{req.issue_type || 'General Service'}</h3>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(req.created_at).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <MapPin size={14} />
                    <span>{req.location_address || 'Location not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <PhoneCall size={14} />
                    <span>User: {req.user_phone || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1 text-xs">Assign Mechanic</Button>
                    <Button variant="danger" className="text-xs">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
            <Truck size={20} />
            Available Mechanics Map
          </h2>
          <div className="flex-1 bg-[#0B1020] rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for real Map integration */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=800x600&sensor=false&style=feature:all|element:labels|visibility:off&style=feature:water|element:geometry|color:0x0b1020&style=feature:landscape|element:geometry|color:0x111827')] bg-cover bg-center"></div>
            <div className="text-center z-10 p-6 bg-sidebar/80 backdrop-blur rounded-xl border border-gray-800 max-w-xs">
              <MapPin size={32} className="mx-auto mb-2 text-primary" />
              <p className="font-medium text-white">Map View Locked</p>
              <p className="text-xs text-gray-400 mt-1">Integrate Google Maps API to view mechanics in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
