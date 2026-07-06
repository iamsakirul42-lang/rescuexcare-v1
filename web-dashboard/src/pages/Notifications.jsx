import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all_users');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetExpertId, setTargetExpertId] = useState('');
  const [type, setType] = useState('General Announcement');
  const [bookingId, setBookingId] = useState('');
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter title and message');
      return;
    }

    setLoading(true);

    const payload = {
      title,
      message,
      target_audience: targetAudience,
      type,
      is_read: false,
    };

    if (targetAudience === 'individual_user' && targetUserId.trim()) {
      payload.target_user_id = targetUserId.trim();
    }
    if (targetAudience === 'individual_expert' && targetExpertId.trim()) {
      payload.target_expert_id = targetExpertId.trim();
    }
    if (bookingId.trim()) {
      payload.booking_id = bookingId.trim();
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setHistory([data[0], ...history]);
      }
      
      setTitle('');
      setMessage('');
      setTargetUserId('');
      setTargetExpertId('');
      setBookingId('');
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Notifications Center</h1>
          <p className="text-gray-400 text-sm">Send in-app notifications to users and experts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Compose Notification
          </h2>
          <form className="space-y-4" onSubmit={handleSendNotification}>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Target Audience</label>
              <select 
                className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              >
                <option value="all_users">All Users</option>
                <option value="all_experts">All Experts</option>
                <option value="individual_user">Individual User</option>
                <option value="individual_expert">Individual Expert</option>
              </select>
            </div>

            {targetAudience === 'individual_user' && (
              <Input label="User ID" placeholder="Enter User UUID..." value={targetUserId} onChange={e => setTargetUserId(e.target.value)} />
            )}
            
            {targetAudience === 'individual_expert' && (
              <Input label="Expert ID" placeholder="Enter Expert UUID..." value={targetExpertId} onChange={e => setTargetExpertId(e.target.value)} />
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Notification Category</label>
              <select 
                className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="General Announcement">General Announcement</option>
                <option value="Booking Update">Booking Update</option>
                <option value="Wallet / Payment">Wallet / Payment</option>
                <option value="KYC">KYC</option>
                <option value="Emergency Alert">Emergency Alert</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Promotional">Promotional</option>
              </select>
            </div>
            
            <Input label="Title" placeholder="Notification title..." value={title} onChange={e => setTitle(e.target.value)} />
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Message</label>
              <textarea 
                className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                rows="4"
                placeholder="Write your notification message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>

            <Input label="Booking ID (Optional)" placeholder="Link to a specific booking..." value={bookingId} onChange={e => setBookingId(e.target.value)} />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification Now'}
            </Button>
          </form>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm overflow-hidden flex flex-col max-h-[800px]">
          <h2 className="text-xl font-semibold mb-6">Sent History</h2>
          <div className="space-y-4 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications sent yet.</p>
            ) : (
              history.map(item => (
                <div key={item.id} className="bg-[#0B1020] p-4 rounded-xl border border-gray-800 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full">{item.type}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{item.message}</p>
                    <p className="text-xs text-gray-500">
                      Target: {item.target_audience.replace('_', ' ')}
                      {item.target_user_id && ` (${item.target_user_id.substring(0,8)}...)`}
                      {item.target_expert_id && ` (${item.target_expert_id.substring(0,8)}...)`}
                      {' • '}
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
