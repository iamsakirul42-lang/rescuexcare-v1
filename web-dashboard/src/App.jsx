import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveActivity } from './pages/LiveActivity';
import { DispatchCenter } from './pages/DispatchCenter';
import { Users } from './pages/Users';
import { Mechanics } from './pages/Mechanics';
import { KYC } from './pages/KYC';
import { Settings } from './pages/Settings';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Services } from './pages/Services';
import { Notifications } from './pages/Notifications';
import { Reviews } from './pages/Reviews';
import { Analytics } from './pages/Analytics';
import { AccountDeletions } from './pages/AccountDeletions';

// Placeholder Pages

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="live-activity" element={<LiveActivity />} />
              <Route path="dispatch" element={<DispatchCenter />} />
              <Route path="users" element={<Users />} />
              <Route path="mechanics" element={<Mechanics />} />
              <Route path="kyc" element={<KYC />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="services" element={<Services />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="account-deletions" element={<AccountDeletions />} />
              <Route path="settings" element={<Settings />} />
              {/* Other routes will go here */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
