import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Map, AlertTriangle, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LiveActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial live activities
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setActivities(data);
      }
      setLoading(false);
    };

    fetchActivities();

    // 2. Subscribe to new activities (Realtime)
    const channel = supabase
      .channel('public:activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload) => {
          setActivities((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Live Activity</h1>
          <p className="text-gray-400 text-sm">Real-time updates of platform events</p>
        </div>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <AlertTriangle size={48} className="mb-4 opacity-50" />
            <p>No live activities yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-gray-800/50 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 ${getIconColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">{activity.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Button variant="outline" className="scale-90">View</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'booking_created': return <Map size={18} />;
    case 'user_registered': return <User size={18} />;
    case 'booking_completed': return <CheckCircle size={18} />;
    case 'alert': return <AlertTriangle size={18} />;
    default: return <Clock size={18} />;
  }
}

function getIconColor(type) {
  switch (type) {
    case 'booking_created': return 'text-blue-500';
    case 'user_registered': return 'text-primary';
    case 'booking_completed': return 'text-green-500';
    case 'alert': return 'text-red-500';
    default: return 'text-gray-400';
  }
}
