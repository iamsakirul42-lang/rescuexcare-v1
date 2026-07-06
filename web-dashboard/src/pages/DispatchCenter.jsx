import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { MapPin, PhoneCall, Truck, AlertTriangle, UserCheck } from 'lucide-react';

export function DispatchCenter() {
  const [requests, setRequests] = useState([]);
  const [onlineMechanics, setOnlineMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  let isAssigningRef = React.useRef(false);

  const handleDeclineRequest = async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      setRequests(curr => curr.filter(r => r.id !== bookingId));
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request.');
    }
  };

  const handleAssignMechanic = async (bookingId, mechanicId) => {
    if (assigningId || isAssigningRef.current) return; // Prevent double click
    isAssigningRef.current = true;
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
      
      // Update local state to remove assigned request
      setRequests(curr => curr.filter(r => r.id !== bookingId));
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error assigning mechanic:', err);
      alert('Failed to assign mechanic.');
    } finally {
      setAssigningId(null);
      isAssigningRef.current = false;
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles(full_name, mobile)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (data) setRequests(data);
    };

    const fetchOnlineMechanics = async () => {
      const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .eq('is_online', true)
        .eq('kyc_status', 'approved');
      
      if (data) setOnlineMechanics(data);
      setLoading(false);
    };

    fetchRequests();
    fetchOnlineMechanics();

    const requestChannel = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRequests((curr) => [payload.new, ...curr]);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status !== 'pending') {
            setRequests((curr) => curr.filter((req) => req.id !== payload.new.id));
          }
        }
      })
      .subscribe();

    const mechanicChannel = supabase
      .channel('public:mechanics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mechanics' }, (payload) => {
        fetchOnlineMechanics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
      supabase.removeChannel(mechanicChannel);
    };
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
                      <h3 className="font-semibold text-white mt-2">{req.notes || 'General Service'}</h3>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(req.created_at).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <MapPin size={14} />
                    <span>{req.location_address || 'Location not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <PhoneCall size={14} />
                    <span>User: {req.profiles?.mobile || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1 text-xs" onClick={() => setSelectedRequest(req)}>Assign Mechanic</Button>
                    <Button variant="danger" className="text-xs" onClick={() => handleDeclineRequest(req.id)}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm h-[300px] flex flex-col">
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

          <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck size={20} />
                Online Experts
              </div>
              <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded-full border border-green-500/30">
                {onlineMechanics.length} Live
              </span>
            </h2>
            
            {onlineMechanics.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No approved experts are currently online.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {onlineMechanics.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-[#0B1020] p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {m.name ? m.name.substring(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B1020]"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.phone}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-sidebar w-full max-w-md rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">Assign Mechanic</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <p className="text-sm text-gray-400 mb-2">Select an expert for booking #{selectedRequest.id.split('-')[0]}</p>
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
                      onClick={() => handleAssignMechanic(selectedRequest.id, m.id)}
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
