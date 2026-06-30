import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function KYC() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    setLoading(true);
    // Join with mechanics table assuming mechanic_id references mechanics
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        mechanics ( name, phone )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (data) setKycRequests(data);
    setLoading(false);
  };

  const handleApprove = async (id, mechanicId) => {
    await supabase.from('kyc_verifications').update({ status: 'approved' }).eq('id', id);
    await supabase.from('mechanics').update({ kyc_status: 'approved' }).eq('id', mechanicId);
    setKycRequests(kycRequests.filter(req => req.id !== id));
  };

  const handleReject = async (id, mechanicId) => {
    await supabase.from('kyc_verifications').update({ status: 'rejected' }).eq('id', id);
    await supabase.from('mechanics').update({ kyc_status: 'rejected' }).eq('id', mechanicId);
    setKycRequests(kycRequests.filter(req => req.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">KYC Verification</h1>
        <p className="text-gray-400 text-sm">Review and approve mechanic documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-gray-400 p-8 text-center bg-sidebar rounded-xl border border-gray-800">
            Loading KYC requests...
          </div>
        ) : kycRequests.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-sidebar rounded-xl border border-gray-800 text-gray-500">
            <CheckCircle size={48} className="mb-4 text-green-500/50" />
            <p>All caught up! No pending KYC requests.</p>
          </div>
        ) : (
          kycRequests.map(req => (
            <div key={req.id} className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800 bg-[#0d1326] flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {req.mechanics?.name?.substring(0,2).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{req.mechanics?.name || 'Unknown Mechanic'}</h3>
                    <p className="text-xs text-gray-400">{req.mechanics?.phone || 'No Phone'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">Pending</span>
              </div>
              
              <div className="p-4 flex-1 grid grid-cols-2 gap-3">
                <div className="bg-[#0B1020] border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                  <FileText size={24} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Aadhaar Card</span>
                </div>
                <div className="bg-[#0B1020] border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                  <FileText size={24} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">PAN Card</span>
                </div>
                <div className="bg-[#0B1020] border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                  <FileText size={24} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Driving License</span>
                </div>
                <div className="bg-[#0B1020] border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                  <FileText size={24} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Vehicle RC</span>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800 flex gap-3 bg-[#0B1020]">
                <Button variant="danger" className="flex-1" onClick={() => handleReject(req.id, req.mechanic_id)}>
                  Reject
                </Button>
                <Button variant="success" className="flex-1" onClick={() => handleApprove(req.id, req.mechanic_id)}>
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
