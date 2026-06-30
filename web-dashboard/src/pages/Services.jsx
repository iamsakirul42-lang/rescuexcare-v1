import React, { useState } from 'react';
import { Button } from '../components/ui/Button';

const initialServices = [
  { id: 1, name: 'Flat Tire', icon: '🛞', active: true, prices: { bike: 149, car: 249, auto: 199, truck: 499 } },
  { id: 2, name: 'Engine Issue', icon: '⚙️', active: true, prices: { bike: 299, car: 499, auto: 399, truck: 799 } },
  { id: 3, name: 'Battery Dead', icon: '🔋', active: true, prices: { bike: 149, car: 199, auto: 179, truck: 349 } },
  { id: 4, name: 'Towing', icon: '🚛', active: true, prices: { bike: 399, car: 699, auto: 599, truck: 1499 } },
  { id: 5, name: 'Out of Fuel', icon: '⛽', active: true, prices: { bike: 99, car: 149, auto: 129, truck: 249 } },
  { id: 6, name: 'Key Lockout', icon: '🔑', active: true, prices: { bike: 199, car: 349, auto: 299, truck: 499 } },
];

export function Services() {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const toggleActive = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const startEditing = (service) => {
    setEditingId(service.id);
    setEditForm({ ...service.prices });
  };

  const savePricing = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, prices: editForm } : s));
    setEditingId(null);
    // Here you would also sync the updated prices to Supabase:
    // await supabase.from('services').update({ prices: editForm }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Services & Pricing</h1>
          <p className="text-gray-400 text-sm">Manage available services and their base prices</p>
        </div>
        <Button variant="primary">+ Add Service</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className={`bg-sidebar rounded-xl border transition-colors ${service.active ? 'border-gray-800' : 'border-gray-800 opacity-60'}`}>
            <div className="p-4 border-b border-gray-800 bg-[#0d1326] flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <h3 className="font-semibold text-white">{service.name}</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={service.active} onChange={() => toggleActive(service.id)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="p-4 space-y-3">
              {['bike', 'car', 'auto', 'truck'].map(type => (
                <div key={type} className="flex justify-between items-center text-sm border-b border-gray-800/50 border-dashed pb-2">
                  <span className="text-gray-400 capitalize">{type}</span>
                  {editingId === service.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">₹</span>
                      <input 
                        type="number"
                        className="bg-[#111827] border border-gray-700 rounded px-2 py-1 w-20 text-white text-right focus:outline-none focus:border-primary"
                        value={editForm[type]}
                        onChange={(e) => setEditForm({...editForm, [type]: Number(e.target.value)})}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-white">₹{service.prices[type]}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#0B1020] border-t border-gray-800 rounded-b-xl flex justify-end">
              {editingId === service.id ? (
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-xs py-1.5" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button variant="primary" className="text-xs py-1.5" onClick={() => savePricing(service.id)}>Save</Button>
                </div>
              ) : (
                <Button variant="ghost" className="text-xs py-1.5" onClick={() => startEditing(service)}>Edit Pricing</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
