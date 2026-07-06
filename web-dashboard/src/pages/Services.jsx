import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { categoriesMarketplace } from '../data/defaultServices';
import { Settings, Check, X, AlertTriangle, Database } from 'lucide-react';

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('car');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .order('display_order', { ascending: true })
      .order('service_name', { ascending: true });
      
    if (data) {
      setServices(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const handleInitialize = async () => {
    setInitializing(true);
    const toInsert = [];
    
    categoriesMarketplace.vehicles.forEach(vehicle => {
      vehicle.sections.forEach(section => {
        section.services.forEach(service => {
          let durationStr = service.duration || '30 mins';
          let mins = parseInt(durationStr);
          if (durationStr.includes('hr') || durationStr.includes('hrs')) {
            mins = mins * 60;
          } else if (isNaN(mins)) {
            mins = 30; // fallback
          }

          toInsert.push({
            service_id: service.id,
            service_name: service.name,
            category: section.title,
            vehicle_type: vehicle.id,
            base_price: service.price || 0,
            pricing_type: service.isQuote ? 'quote' : 'fixed',
            is_active: true,
            is_popular: false,
            estimated_duration_minutes: mins,
            display_order: toInsert.length
          });
        });
      });
    });

    try {
      const { error } = await supabase.from('service_pricing').upsert(toInsert, { onConflict: 'service_id' });
      if (error) throw error;
      alert("Database initialized successfully!");
      fetchServices();
    } catch (err) {
      console.error(err);
      alert(`Failed to initialize database: ${err.message || JSON.stringify(err)}`);
    }
    setInitializing(false);
  };

  const startEditing = (service) => {
    setEditingId(service.service_id);
    setEditForm({ ...service });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveService = async () => {
    try {
      const { error } = await supabase
        .from('service_pricing')
        .update({
          base_price: editForm.base_price,
          pricing_type: editForm.pricing_type,
          is_active: editForm.is_active,
          is_popular: editForm.is_popular,
          estimated_duration_minutes: editForm.estimated_duration_minutes,
          display_order: editForm.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('service_id', editForm.service_id);
        
      if (error) throw error;
      
      setServices(services.map(s => s.service_id === editForm.service_id ? editForm : s));
      setEditingId(null);
    } catch (err) {
      alert("Failed to save changes.");
      console.error(err);
    }
  };

  const handleToggleActive = async (service) => {
    const newStatus = !service.is_active;
    try {
      const { error } = await supabase
        .from('service_pricing')
        .update({ is_active: newStatus })
        .eq('service_id', service.service_id);
      if (error) throw error;
      setServices(services.map(s => s.service_id === service.service_id ? { ...s, is_active: newStatus } : s));
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading services...</div>;
  }

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Services & Pricing</h1>
        <div className="bg-sidebar rounded-xl border border-gray-800 p-10 text-center max-w-2xl mx-auto shadow-sm mt-10">
          <Database size={48} className="mx-auto text-primary mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-2">Database Not Initialized</h2>
          <p className="text-gray-400 mb-8">
            The service pricing database is currently empty. Initialize it now to load all default services from the mobile app's static data into Supabase so they can be managed.
          </p>
          <Button variant="primary" onClick={handleInitialize} disabled={initializing}>
            {initializing ? "Initializing..." : "Initialize Default Services"}
          </Button>
          <p className="text-xs text-yellow-500 mt-6 bg-yellow-500/10 p-3 rounded text-left border border-yellow-500/20">
            <AlertTriangle size={14} className="inline mr-2 -mt-0.5" />
            Before initializing, ensure you have executed the `setup_service_pricing.sql` script in your Supabase SQL Editor.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'car', label: 'Car Services' },
    { id: 'bike', label: 'Bike Services' },
    { id: 'auto', label: 'Auto / EV' },
    { id: 'truck', label: 'Truck / Heavy' },
  ];

  const currentServices = services.filter(s => s.vehicle_type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Settings className="text-primary" size={32} />
            Services & Pricing
          </h1>
          <p className="text-gray-400 text-sm">Manage base prices, service availability, and duration</p>
        </div>
        <Button variant="outline" onClick={handleInitialize} disabled={initializing}>Reset to Defaults</Button>
      </div>

      <div className="flex space-x-2 border-b border-gray-800 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Service Name</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Category</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Pricing Type</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Base Price</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Duration (mins)</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Order</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentServices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No services found for this vehicle type.</td>
                </tr>
              ) : (
                currentServices.map(service => {
                  const isEditing = editingId === service.service_id;
                  return (
                    <tr key={service.service_id} className={`transition-colors ${service.is_active ? 'hover:bg-gray-800/30' : 'bg-gray-900/50 opacity-60'}`}>
                      <td className="p-4 text-sm font-medium text-white">{service.service_name}
                        {service.is_popular && <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">POPULAR</span>}
                      </td>
                      <td className="p-4 text-xs text-gray-400">{service.category}</td>
                      
                      <td className="p-4">
                        {isEditing ? (
                          <select 
                            className="bg-[#111827] border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                            value={editForm.pricing_type}
                            onChange={(e) => setEditForm({...editForm, pricing_type: e.target.value})}
                          >
                            <option value="fixed">Fixed</option>
                            <option value="quote">Quote on Inspection</option>
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${service.pricing_type === 'quote' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {service.pricing_type === 'quote' ? 'On Inspection' : 'Fixed Price'}
                          </span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">₹</span>
                            <input 
                              type="number"
                              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 w-20 text-white focus:outline-none focus:border-primary"
                              value={editForm.base_price}
                              onChange={(e) => setEditForm({...editForm, base_price: Number(e.target.value)})}
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-green-400">₹{service.base_price}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="bg-[#111827] border border-gray-700 rounded px-2 py-1 w-16 text-white focus:outline-none focus:border-primary"
                            value={editForm.estimated_duration_minutes}
                            onChange={(e) => setEditForm({...editForm, estimated_duration_minutes: Number(e.target.value)})}
                          />
                        ) : (
                          <span className="text-sm text-gray-300">{service.estimated_duration_minutes}m</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="bg-[#111827] border border-gray-700 rounded px-2 py-1 w-12 text-white focus:outline-none focus:border-primary"
                            value={editForm.display_order}
                            onChange={(e) => setEditForm({...editForm, display_order: Number(e.target.value)})}
                          />
                        ) : (
                          <span className="text-sm text-gray-400">#{service.display_order}</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isEditing ? editForm.is_active : service.is_active} onChange={() => isEditing ? setEditForm({...editForm, is_active: !editForm.is_active}) : handleToggleActive(service)} />
                          <div className={`w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${isEditing ? (editForm.is_active ? 'peer-checked:bg-primary' : '') : (service.is_active ? 'peer-checked:bg-primary' : '')}`}></div>
                        </label>
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={cancelEditing} className="p-1.5 text-gray-400 hover:text-white bg-gray-500/10 hover:bg-gray-500/20 rounded transition-colors">
                              <X size={16} />
                            </button>
                            <button onClick={saveService} className="p-1.5 text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors">
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <Button variant="ghost" className="text-xs py-1 px-3 border border-gray-800" onClick={() => startEditing(service)}>Edit</Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
