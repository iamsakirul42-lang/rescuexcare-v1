import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function LiveNotificationsWidget() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen to multiple tables to generate live notifications
    const reqSub = supabase.channel('notif-req')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        addNotification(`New booking #${payload.new.id.slice(0, 6)} received`, 'alert');
      }).subscribe();
      
    const kycSub = supabase.channel('notif-kyc')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kyc_verifications' }, (payload) => {
        if (payload.new.status === 'approved') {
          addNotification('An expert KYC was approved', 'success');
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(reqSub);
      supabase.removeChannel(kycSub);
    };
  }, []);

  const addNotification = (text, type) => {
    setNotifications(prev => {
      const newNotif = { id: Date.now(), text, time: 'Just now', type };
      return [newNotif, ...prev].slice(0, 6);
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle size={16} className="text-orange-500" />;
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Clock size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1326]">
        <div className="flex items-center gap-2">
          <Bell className="text-gray-400" size={18} />
          <h3 className="text-lg font-semibold text-white">Live Activity Logs</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {notifications.map(notif => (
          <div key={notif.id} className="flex items-start gap-3 pb-3 border-b border-gray-800/50 last:border-0 last:pb-0">
            <div className="mt-0.5">{getIcon(notif.type)}</div>
            <div>
              <p className="text-sm text-gray-300 leading-snug">{notif.text}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
