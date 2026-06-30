import React, { createContext, useState } from 'react';

export const ExpertContext = createContext();

export const ExpertProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <ExpertContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </ExpertContext.Provider>
  );
};
