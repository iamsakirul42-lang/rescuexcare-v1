import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, CheckCircle, Ban, Clock, Star, Download } from 'lucide-react';
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

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('mechanics')
      .update({ kyc_status: newStatus })
      .eq('id', id);
      
    if (!error) {
      setMechanics(mechanics.map(m => m.id === id ? { ...m, kyc_status: newStatus } : m));
    }
  };

  const handlePrint = async (m) => {
    // Need to fetch their KYC documents for the printout if they exist
    let docs = {};
    const { data: kycData } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('mechanic_id', m.id)
      .single();
    
    if (kycData) docs = kycData;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Expert Profile - ${m.name || 'Unknown'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            h1 { color: #2E1065; border-bottom: 2px solid #2E1065; padding-bottom: 10px; margin-bottom: 30px; }
            h2 { background-color: #f3f4f6; color: #374151; margin-top: 35px; margin-bottom: 0; padding: 10px 15px; font-size: 16px; border: 1px solid #ddd; border-bottom: none; border-radius: 6px 6px 0 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 0; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f9fafb; width: 35%; font-weight: bold; color: #555; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #FF6B00; }
            .badge { display: inline-block; padding: 4px 8px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="background-color: #0B1020; padding: 8px 16px; border-radius: 6px; display: inline-block; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <img src="${window.location.origin}/logo.png" alt="RescueX" style="height: 36px; object-fit: contain; display: block;" />
            </div>
            <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Expert Profile Record</h1>
            <span class="badge">Status: ${(m.kyc_status || 'unknown').toUpperCase()}</span>
          </div>
          
          <h2>Personal Information</h2>
          <table>
            <tr><th>Full Name</th><td>${m.name || 'N/A'}</td></tr>
            <tr><th>Phone Number</th><td>${m.phone || 'N/A'}</td></tr>
            <tr><th>Email Address</th><td>${m.email || 'N/A'}</td></tr>
            <tr><th>Date of Birth</th><td>${m.dob || 'N/A'}</td></tr>
          </table>

          <h2>Address Details</h2>
          <table>
            <tr><th>Full Address</th><td>${m.full_address || 'N/A'}</td></tr>
            <tr><th>PIN Code</th><td>${m.pin_code || 'N/A'}</td></tr>
          </table>

          <h2>Professional Expertise</h2>
          <table>
            <tr><th>Experience</th><td>${m.experience_years ? m.experience_years + ' Years' : 'N/A'}</td></tr>
            <tr><th>Supported Vehicles</th><td>${m.vehicles ? (Array.isArray(m.vehicles) ? m.vehicles.join(', ') : m.vehicles) : 'N/A'}</td></tr>
            <tr><th>Services Offered</th><td>${m.services ? (Array.isArray(m.services) ? m.services.join(', ') : m.services) : 'N/A'}</td></tr>
          </table>

          <h2>Bank Account Details</h2>
          <table>
            <tr><th>Account Name</th><td>${m.bank_account_name || 'N/A'}</td></tr>
            <tr><th>Bank Name</th><td>${m.bank_name || 'N/A'}</td></tr>
            <tr><th>Account Number</th><td>${m.bank_account_number || 'N/A'}</td></tr>
          </table>

          <h2>Emergency Contact</h2>
          <table>
            <tr><th>Contact Name</th><td>${m.emergency_contact_name || 'N/A'}</td></tr>
            <tr><th>Relationship</th><td>${m.emergency_contact_relation || 'N/A'}</td></tr>
            <tr><th>Phone Number</th><td>${m.emergency_contact_mobile || 'N/A'}</td></tr>
          </table>

          <h2>Document Links (Cloud Storage)</h2>
          <table>
            <tr><th>Aadhaar Card</th><td><a href="${docs.aadhaar_url || '#'}">${docs.aadhaar_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>PAN Card</th><td><a href="${docs.pan_url || '#'}">${docs.pan_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>Driving License</th><td><a href="${docs.license_url || '#'}">${docs.license_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>Mechanic Certificate</th><td><a href="${docs.rc_url || '#'}">${docs.rc_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
          </table>
          
          <div style="margin-top: 40px; padding: 20px; border: 1px solid #ddd; background-color: #f9fafb; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #333; font-size: 14px;">Official Declaration</h3>
            <p style="font-size: 12px; color: #555; text-align: justify; margin-bottom: 0;">
              This document serves as the official expert application profile generated by the RescueX Admin System. The details provided herein are reviewed in accordance with RescueX Care's internal verification policies. This document authorizes the individual to provide services on behalf of the platform if marked as 'Approved'. It contains highly sensitive personal information and is strictly for official use.
            </p>
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
              <strong style="font-size: 14px;">Expert Signature</strong>
              <div style="font-size: 12px; color: #555; margin-top: 5px;">Date: ____________</div>
            </div>
            
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #333; height: 40px; margin-bottom: 5px;"></div>
              <strong style="font-size: 14px;">Authorized Signature</strong>
              <div style="font-size: 12px; color: #555; margin-top: 5px;">CEO of RescueX Care</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
                        {m.kyc_status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(m.id, 'approved')} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleUpdateStatus(m.id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject">
                              <Ban size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => handlePrint(m)} className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors" title="Export PDF Profile">
                          <Download size={18} />
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
