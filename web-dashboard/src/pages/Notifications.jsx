import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bell } from 'lucide-react';

export function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const history = [
    { id: 1, title: 'Summer Special Discount!', target: 'All Users', date: 'Jun 26, 2026', delivered: 12340 },
    { id: 2, title: 'New Service Areas Added', target: 'All Mechanics', date: 'Jun 25, 2026', delivered: 845 },
    { id: 3, title: 'Platform Maintenance Notice', target: 'All Users + Mechanics', date: 'Jun 20, 2026', delivered: 13185 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-gray-400 text-sm">Send push notifications and alerts to your users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Compose Notification
          </h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Send To</label>
              <select className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors">
                <option>All Users</option>
                <option>All Mechanics</option>
                <option>Specific Segment</option>
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

            <Button type="submit" fullWidth>Send Notification Now</Button>
          </form>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Sent History</h2>
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="bg-[#0B1020] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.target} • {item.date}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                    {item.delivered.toLocaleString()} delivered
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
