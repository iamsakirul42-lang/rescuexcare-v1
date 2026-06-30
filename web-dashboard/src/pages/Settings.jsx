import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Settings() {
  const [platformName, setPlatformName] = useState('rescueX');
  const [supportEmail, setSupportEmail] = useState('support@rescuex.in');
  const [supportPhone, setSupportPhone] = useState('+91 1800 RESCUEX');
  
  const [commissions, setCommissions] = useState({
    platform: 15,
    bike: 12,
    car: 15,
    truck: 18
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Platform Settings</h1>
        <p className="text-gray-400 text-sm">Manage global configuration and admin access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-3">General Settings</h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <Input label="Platform Name" value={platformName} onChange={e => setPlatformName(e.target.value)} />
            <Input label="Support Email" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            <Input label="Support Phone" type="tel" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} />
            <div className="pt-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-3">Commission Settings (%)</h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Platform Default" type="number" value={commissions.platform} onChange={e => setCommissions({...commissions, platform: e.target.value})} />
              <Input label="Bike Service" type="number" value={commissions.bike} onChange={e => setCommissions({...commissions, bike: e.target.value})} />
              <Input label="Car Service" type="number" value={commissions.car} onChange={e => setCommissions({...commissions, car: e.target.value})} />
              <Input label="Truck Service" type="number" value={commissions.truck} onChange={e => setCommissions({...commissions, truck: e.target.value})} />
            </div>
            <div className="pt-2">
              <Button type="submit">Update Commission</Button>
            </div>
          </form>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-3">Platform Control</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Maintenance Mode</h4>
                <p className="text-sm text-gray-400">Disable customer access temporarily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Downtime Message</label>
              <textarea 
                className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                rows="3"
                placeholder="We'll be back shortly..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-3">Admin Accounts</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-[#0B1020] rounded-lg border border-gray-800">
              <span className="text-sm text-gray-300">admin@rescuex.in</span>
              <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">Super Admin</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0B1020] rounded-lg border border-gray-800">
              <span className="text-sm text-gray-300">support@rescuex.in</span>
              <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">Support</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0B1020] rounded-lg border border-gray-800">
              <span className="text-sm text-gray-300">finance@rescuex.in</span>
              <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">Finance</span>
            </div>
          </div>
          <Button variant="outline" fullWidth>+ Add New Admin</Button>
        </div>
      </div>
    </div>
  );
}
