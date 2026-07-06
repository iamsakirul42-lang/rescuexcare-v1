import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    holderName: '',
    bankName: '',
    accountNumber: '',
  });
  const channelRef = useRef(null);

  // Derived wallet calculations (no DB column needed)
  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.expert_amount) || 0), 0);

  // Only online/UPI earnings are withdrawable — expert already has cash in hand
  const onlineEarnings = earnings
    .filter(e => e.payment_method !== 'cash')
    .reduce((sum, e) => sum + (parseFloat(e.expert_amount) || 0), 0);

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'processing' || w.status === 'approved')
    .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const rescuexDue = earnings
    .filter(e => e.platform_due_status === 'unpaid')
    .reduce((sum, e) => sum + (parseFloat(e.platform_due) || 0), 0);

  // Available Balance = Online Earnings − Paid Withdrawals − Pending Withdrawals
  // Cash earnings are NOT withdrawable (expert already has that money)
  const availableBalance = onlineEarnings - totalWithdrawn - pendingWithdrawals;
  const maxWithdrawable = Math.max(0, availableBalance);

  const refreshWallet = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Fetch bank details from expert_profiles table
      const { data: expertProfile } = await supabase
        .from('expert_profiles')
        .select('bank_account_name, bank_name, bank_account_number')
        .eq('id', userId)
        .single();

      if (expertProfile) {
        setBankDetails({
          holderName: expertProfile.bank_account_name || '',
          bankName: expertProfile.bank_name || '',
          accountNumber: expertProfile.bank_account_number || '',
        });
      }

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('expert_earnings')
        .select('*')
        .eq('expert_id', userId)
        .order('created_at', { ascending: false });

      if (earningsData) setEarnings(earningsData);

      // Fetch withdrawal requests
      const { data: withdrawalData } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('expert_id', userId)
        .order('created_at', { ascending: false });

      if (withdrawalData) setWithdrawals(withdrawalData);
    } catch (err) {
      console.error('Error refreshing wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscription for a specific user
  const setupRealtimeChannel = useCallback((userId) => {
    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel('wallet-earnings-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'expert_earnings',
        filter: `expert_id=eq.${userId}`,
      }, () => {
        refreshWallet();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests',
        filter: `expert_id=eq.${userId}`,
      }, () => {
        refreshWallet();
      })
      .subscribe();

    channelRef.current = channel;
  }, [refreshWallet]);

  useEffect(() => {
    // 1. Check if already authenticated on mount
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        refreshWallet();
        setupRealtimeChannel(data.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes (handles reinstall + fresh login)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        refreshWallet();
        setupRealtimeChannel(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Clear all wallet state on logout
        setEarnings([]);
        setWithdrawals([]);
        setBankDetails({ holderName: '', bankName: '', accountNumber: '' });
        setLoading(false);

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refreshWallet, setupRealtimeChannel]);

  const requestWithdrawal = async (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return { success: false, message: 'Invalid amount.' };
    if (numAmount > maxWithdrawable) return { success: false, message: `Maximum withdrawable amount is ₹${maxWithdrawable.toFixed(2)}.` };

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return { success: false, message: 'Not authenticated.' };

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          expert_id: authData.user.id,
          amount: numAmount,
          status: 'processing',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately for snappy UI
      setWithdrawals(prev => [data, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Build a unified transaction history sorted by date
  const transactionHistory = [
    ...earnings.map(e => ({
      id: e.id,
      type: e.payment_method === 'cash' ? 'cash_due' : 'earning',
      title: e.service_name || 'Service Earning',
      subtitle: e.customer_name ? `Customer: ${e.customer_name}` : (e.booking_id || ''),
      amount: parseFloat(e.expert_amount) || 0,
      commission: parseFloat(e.commission_amount) || 0,
      serviceAmount: parseFloat(e.service_amount) || 0,
      platformDue: parseFloat(e.platform_due) || 0,
      platformDueStatus: e.platform_due_status,
      paymentMethod: e.payment_method,
      bookingId: e.booking_id,
      date: e.created_at,
    })),
    ...withdrawals.map(w => ({
      id: w.id,
      type: 'withdrawal',
      title: 'Withdrawal Request',
      subtitle: w.admin_note || '',
      amount: parseFloat(w.amount) || 0,
      status: w.status,
      date: w.created_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <WalletContext.Provider value={{
      loading,
      // Financials (all computed, no DB column)
      availableBalance,
      totalEarnings,
      totalWithdrawn,
      pendingWithdrawals,
      rescuexDue,
      maxWithdrawable,
      // Data
      bankDetails,
      earnings,
      withdrawals,
      transactionHistory,
      // Actions
      requestWithdrawal,
      refreshWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

