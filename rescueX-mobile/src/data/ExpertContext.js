import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ExpertContext = createContext();

export const ExpertProvider = ({ children }) => {
  const [isOnline, setIsOnlineState] = useState(false);

  // Fetch initial status when the provider mounts
  useEffect(() => {
    const fetchStatus = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase
          .from('mechanics')
          .select('is_online')
          .eq('id', authData.user.id)
          .single();
        
        if (data && data.is_online !== null) {
          setIsOnlineState(data.is_online);
        }
      }
    };
    fetchStatus();
  }, []);

  // Custom setter that syncs with database
  const setIsOnline = async (newStatus) => {
    // Update local state instantly for snappy UI
    setIsOnlineState(newStatus);
    
    // Sync to database
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase
        .from('mechanics')
        .update({ is_online: newStatus })
        .eq('id', authData.user.id);
    }
  };

  return (
    <ExpertContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </ExpertContext.Provider>
  );
};
