import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expert_onboarding_data';

export const ExpertOnboardingContext = createContext();

export const ExpertOnboardingProvider = ({ children }) => {
  const defaultData = {
    personal: { fullName: '', mobile: '', email: '', dob: '' },
    address: { city: 'Kolkata', fullAddress: '', landmark: '', pinCode: '' },
    vehicles: [],
    services: [],
    experience: { years: '', workshopName: '', previousWork: '' },
    documents: { aadhaar: null, pan: null, dl: null, certificate: null },
    bank: { holderName: '', bankName: '', accountNumber: '', ifsc: '', upiId: '' },
    emergency: { name: '', relationship: '', mobile: '' },
  };

  const [onboardingData, setOnboardingData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOnboardingData({ ...defaultData, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.log('Error loading onboarding progress', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (stepKey, data) => {
    const newData = { ...onboardingData, [stepKey]: data };
    setOnboardingData(newData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.log('Error saving onboarding progress', e);
    }
  };

  const clearProgress = async () => {
    setOnboardingData(defaultData);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.log('Error clearing onboarding progress', e);
    }
  };

  return (
    <ExpertOnboardingContext.Provider
      value={{
        onboardingData,
        updateData,
        clearProgress,
        isLoading,
      }}
    >
      {children}
    </ExpertOnboardingContext.Provider>
  );
};
