import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { DocumentViewer } from '../components/ui/DocumentViewer';

export function KYC() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Document Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState({ title: '', url: '' });
  
  // Action Loading State
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    setLoading(true);
    // Fetch pending KYC requests with all mechanic details for PDF generation
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        mechanics ( * )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching KYC:", error);
    } else {
      setKycRequests(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id, mechanicId) => {
    setProcessingId(id);
    try {
      await supabase.from('kyc_verifications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);
      await supabase.from('mechanics').update({ kyc_status: 'approved' }).eq('id', mechanicId);
      setKycRequests(kycRequests.filter(req => req.id !== id));
    } catch (err) {
      console.error("Approval failed", err);
    }
    setProcessingId(null);
  };

  const handleReject = async (id, mechanicId) => {
    setProcessingId(id);
    try {
      await supabase.from('kyc_verifications').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', id);
      await supabase.from('mechanics').update({ kyc_status: 'rejected' }).eq('id', mechanicId);
      setKycRequests(kycRequests.filter(req => req.id !== id));
    } catch (err) {
      console.error("Rejection failed", err);
    }
    setProcessingId(null);
  };

  const handlePrint = (req) => {
    const m = req.mechanics || {};
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Expert Application - ${m.name || 'Unknown'}</title>
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
            <h1>Expert Application Profile</h1>
            <span class="badge">Status: ${req.status.toUpperCase()}</span>
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
            <tr><th>Aadhaar Card</th><td><a href="${req.aadhaar_url || '#'}">${req.aadhaar_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>PAN Card</th><td><a href="${req.pan_url || '#'}">${req.pan_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>Driving License</th><td><a href="${req.license_url || '#'}">${req.license_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
            <tr><th>Mechanic Certificate</th><td><a href="${req.rc_url || '#'}">${req.rc_url ? 'View Document' : 'Not Uploaded'}</a></td></tr>
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

  const openDocument = (title, url) => {
    setActiveDocument({ title, url });
    setViewerOpen(true);
  };

  const DocumentCard = ({ title, url }) => (
    <div 
      onClick={() => openDocument(title, url)}
      className="bg-[#0B1020] border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
    >
      <FileText size={24} className="text-gray-500 group-hover:text-primary transition-colors" />
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors text-center">{title}</span>
      {!url && <span className="text-[10px] text-red-400">Missing</span>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">KYC Verification</h1>
        <p className="text-gray-400 text-sm">Review and approve mechanic documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-gray-400 p-12 flex flex-col items-center justify-center bg-sidebar rounded-xl border border-gray-800">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading KYC requests...
          </div>
        ) : kycRequests.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-16 bg-sidebar rounded-xl border border-gray-800 text-gray-500 shadow-sm">
            <CheckCircle size={56} className="mb-4 text-green-500/30" />
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p>There are no pending KYC requests at the moment.</p>
          </div>
        ) : (
          kycRequests.map(req => (
            <div key={req.id} className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
              
              {/* Header */}
              <div className="p-5 border-b border-gray-800 bg-[#0d1326] flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <div className="flex items-center gap-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg shadow-inner">
                    {req.mechanics?.name?.substring(0,2).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{req.mechanics?.name || 'Unknown Mechanic'}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      {req.mechanics?.phone || 'No Phone'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end z-10">
                  <div className="flex items-center gap-1 text-xs font-bold bg-yellow-500/10 text-yellow-500 px-2.5 py-1.5 rounded-md border border-yellow-500/20">
                    <Clock size={12} /> Pending
                  </div>
                  <button 
                    onClick={() => handlePrint(req)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-md border border-gray-700 transition-colors"
                    title="Export Application to PDF"
                  >
                    <Download size={12} /> Export PDF
                  </button>
                </div>
              </div>
              
              {/* Documents Grid */}
              <div className="p-5 flex-1 bg-gradient-to-b from-[#0d1326]/50 to-transparent">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Submitted Documents</h4>
                <div className="grid grid-cols-2 gap-3">
                  <DocumentCard title="Aadhaar Card" url={req.aadhaar_url} />
                  <DocumentCard title="PAN Card" url={req.pan_url} />
                  <DocumentCard title="Driving License" url={req.license_url} />
                  <DocumentCard title="Vehicle RC" url={req.rc_url} />
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  Submitted: {new Date(req.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-800 flex gap-3 bg-[#0B1020]">
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  onClick={() => handleReject(req.id, req.mechanic_id)}
                  disabled={processingId === req.id}
                >
                  Reject
                </Button>
                <Button 
                  variant="success" 
                  className="flex-1" 
                  onClick={() => handleApprove(req.id, req.mechanic_id)}
                  disabled={processingId === req.id}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DocumentViewer 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        title={activeDocument.title} 
        documentUrl={activeDocument.url} 
      />
    </div>
  );
}
