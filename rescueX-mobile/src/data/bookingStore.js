import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { onPricingUpdated } from './categoriesMarketplace';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [pricingTick, setPricingTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onPricingUpdated(() => {
      setPricingTick(prev => prev + 1);
      // Forcing cart to technically "update" so React detects state change for purely nested objects
      setCart(prevCart => [...prevCart]);
    });
    return unsubscribe;
  }, []);
  
  // Realtime Booking Updates
  useEffect(() => {
    let subscription = null;

    const fetchInitialBookings = async (userId) => {
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .or(`user_id.eq.${userId},expert_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching initial bookings:', bookingsError);
          return;
        }

        if (bookingsData) {
          // Extract unique expert IDs and user IDs
          const expertIds = [...new Set(bookingsData.map(b => b.expert_id).filter(Boolean))];
          const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
          
          let mechanicsMap = {};
          if (expertIds.length > 0) {
            const { data: mechanicsData } = await supabase
              .from('mechanics')
              .select('*')
              .in('id', expertIds);
              
            if (mechanicsData) {
              mechanicsData.forEach(m => {
                mechanicsMap[m.id] = m;
              });
            }
          }

          let usersMap = {};
          if (userIds.length > 0) {
            const { data: usersData } = await supabase
              .from('profiles')
              .select('*')
              .in('id', userIds);
              
            if (usersData) {
              usersData.forEach(u => {
                usersMap[u.id] = u;
              });
            }
          }

          const formatted = bookingsData.map(b => {
            const mechanic = mechanicsMap[b.expert_id];
            const user = usersMap[b.user_id];
            return {
              id: b.id,
              type: b.booking_type,
              vehicleType: b.vehicle_type,
              problem: b.notes,
              address: b.location_address,
              scheduledDate: b.scheduled_date,
              scheduledTime: b.scheduled_time,
              totalAmount: b.total_amount,
              paymentMethod: b.payment_method,
              paymentStatus: b.payment_status,
              status: b.status,
              createdAt: b.created_at,
              startCode: b.start_otp,
              completionCode: b.completion_otp,
              serviceStartTime: b.service_start_time,
              serviceEndTime: b.service_end_time,
              rating: b.rating,
              review: b.review,
              expert_id: b.expert_id,
              customer: user ? {
                name: user.full_name,
                phone: user.mobile
              } : null,
              expert: mechanic ? {
                name: mechanic.name,
                phone: mechanic.phone,
                specialization: mechanic.services ? mechanic.services.join(', ') : 'General Service',
                experience: (mechanic.experience_years || 0) + ' Years',
                rating: mechanic.rating || 4.8
              } : null,
              services: b.service_details ? b.service_details.map(s => ({
                name: s.service_name,
                price: s.unit_price,
                quantity: s.quantity || 1
              })) : []
            };
          });
          setBookings(formatted);
        }
      } catch (e) {
        console.error('Error fetching initial bookings:', e);
      }
    };

    const startRealtime = (userId) => {
      if (subscription) {
        return; // Already subscribed
      }
      
      fetchInitialBookings(userId);
      
      subscription = supabase
        .channel('public:bookings_user_' + userId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async (payload) => {
          if (payload.eventType === 'DELETE') {
             setBookings(prev => prev.filter(b => b.id !== payload.old.id));
             return;
          }
          const updatedBooking = payload.new;
          
          if (updatedBooking.user_id !== userId && updatedBooking.expert_id !== userId) {
            return;
          }

          let expertData = null;
          if (updatedBooking.expert_id) {
            const { data: mechanic } = await supabase
              .from('mechanics')
              .select('*')
              .eq('id', updatedBooking.expert_id)
              .single();
              
            if (mechanic) {
              expertData = {
                name: mechanic.name,
                phone: mechanic.phone,
                specialization: mechanic.services ? mechanic.services.join(', ') : 'General Service',
                experience: (mechanic.experience_years || 0) + ' Years',
                rating: mechanic.rating || 4.8
              };
            }
          }

          let userData = null;
          if (updatedBooking.user_id) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', updatedBooking.user_id)
              .single();
              
            if (userProfile) {
              userData = {
                name: userProfile.full_name,
                phone: userProfile.mobile
              };
            }
          }

          const formattedBooking = {
            id: updatedBooking.id,
            type: updatedBooking.booking_type,
            vehicleType: updatedBooking.vehicle_type,
            problem: updatedBooking.notes,
            address: updatedBooking.location_address,
            scheduledDate: updatedBooking.scheduled_date,
            scheduledTime: updatedBooking.scheduled_time,
            totalAmount: updatedBooking.total_amount,
            paymentMethod: updatedBooking.payment_method,
            paymentStatus: updatedBooking.payment_status,
            status: updatedBooking.status,
            createdAt: updatedBooking.created_at,
            startCode: updatedBooking.start_otp,
            completionCode: updatedBooking.completion_otp,
            serviceStartTime: updatedBooking.service_start_time,
            serviceEndTime: updatedBooking.service_end_time,
            rating: updatedBooking.rating,
            review: updatedBooking.review,
            expert_id: updatedBooking.expert_id,
            customer: userData,
            expert: expertData,
            services: updatedBooking.service_details ? updatedBooking.service_details.map(s => ({
              name: s.service_name,
              price: s.unit_price,
              quantity: s.quantity || 1
            })) : []
          };

          setBookings(prev => {
            const exists = prev.some(b => b.id === updatedBooking.id);
            if (!exists) {
              return [formattedBooking, ...prev];
            }
            return prev.map(b => (b.id === updatedBooking.id ? formattedBooking : b));
          });

          setActiveBooking(prev => {
            if (prev && prev.id === updatedBooking.id) {
              return formattedBooking;
            }
            return prev;
          });
        })
        .subscribe();
    };

    // 1. Check current user immediately
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        startRealtime(data.user.id);
      }
    });

    // 2. Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (subscription) {
          supabase.removeChannel(subscription);
          subscription = null;
        }
        setBookings([]);
        setActiveBooking(null);
      } else if (session?.user?.id) {
        startRealtime(session.user.id);
      }
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Cart State
  const [cart, setCart] = useState([]);
  
  const addToCart = (service, vehicleId) => {
    setCart(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        return prev.map(item => item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { service, vehicleId, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCart(prev => prev.map(item => item.service.id === serviceId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartVehicleId = cart.length > 0 ? cart[0].vehicleId : null;
  const cartTotal = cart.reduce((total, item) => total + (item.service.price * item.quantity), 0);

  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const createBooking = async (bookingData) => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    const startCode = generateCode();
    let completionCode = generateCode();
    while (completionCode === startCode) {
      completionCode = generateCode();
    }

    let finalNotes = bookingData.problem || bookingData.notes || 'General Service';
    let serviceDetailsList = null;

    if (bookingData.services && bookingData.services.length > 0) {
      finalNotes = bookingData.services.map(s => s.title || s.name || 'Service').join(', ');
      if (bookingData.notes) {
        finalNotes += ` (Note: ${bookingData.notes})`;
      }
      
      // Create price-locked snapshot
      serviceDetailsList = bookingData.services.map(svc => ({
        service_name: svc.name || svc.title,
        unit_price: svc.price,
        total_amount: svc.price * (svc.quantity || 1),
        pricing_type: svc.isQuote ? 'quote' : 'fixed',
        quantity: svc.quantity || 1
      }));
    }

    let finalVehicleType = bookingData.vehicleType || bookingData.vehicleTitle || null;
    if (!finalVehicleType && bookingData.vehicleId) {
      if (['car', 'bike', 'truck', 'auto'].includes(bookingData.vehicleId)) {
        finalVehicleType = bookingData.vehicleId.charAt(0).toUpperCase() + bookingData.vehicleId.slice(1);
      } else {
        const { data: vData } = await supabase.from('vehicles').select('*').eq('id', bookingData.vehicleId).single();
        if (vData) {
          finalVehicleType = `${vData.make || ''} ${vData.model || ''}`.trim();
          if (!finalVehicleType) finalVehicleType = vData.type || 'Vehicle';
        }
      }
    }

    // AUTO-CANCEL previous active bookings for this user to ensure only 1 active at a time
    if (userId) {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .in('status', ['pending', 'waiting_assignment', 'expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification']);
    }

    const bookingPayload = {
      booking_number: 'BK' + Date.now().toString().slice(-6),
      user_id: userId,
      status: 'pending',
      booking_type: bookingData.type === 'instant' ? 'instant' : 'scheduled',
      vehicle_type: finalVehicleType,
      notes: finalNotes,
      location_address: bookingData.address || 'Unknown Location',
      scheduled_date: bookingData.scheduledDate || null,
      scheduled_time: bookingData.scheduledTime || null,
      total_amount: bookingData.totalAmount || 0,
      payment_method: bookingData.paymentMethod || 'cash',
      payment_status: bookingData.paymentMethod === 'upi' ? 'paid' : 'pending',
      start_otp: startCode,
      completion_otp: completionCode,
      service_details: serviceDetailsList
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking in Supabase:', error);
      // Fallback to local booking if supabase fails
    }

    const newBooking = {
      id: data?.id || 'BK' + Date.now(),
      ...bookingData,
      status: 'pending',
      createdAt: data?.created_at || new Date().toISOString(),
      expert: null,
      startCode,
      completionCode,
      serviceStartTime: null,
      serviceEndTime: null,
      rating: null,
      review: '',
      paymentMethod: bookingPayload.payment_method,
      paymentStatus: bookingPayload.payment_status,
    };
    
    setActiveBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId, status, extraData = {}) => {
    // 1. Optimistic Local Update
    const updater = (booking) => {
      if (booking.id === bookingId) {
        return { ...booking, status, ...extraData };
      }
      return booking;
    };

    setBookings((prev) => prev.map(updater));
    setActiveBooking((prev) => {
      if (prev && prev.id === bookingId) {
        return { ...prev, status, ...extraData };
      }
      return prev;
    });

    // 2. Sync with Supabase
    try {
      const dbPayload = { status };
      if (extraData.serviceStartTime) dbPayload.service_start_time = extraData.serviceStartTime;
      if (extraData.serviceEndTime) dbPayload.service_end_time = extraData.serviceEndTime;
      if (extraData.paymentStatus) dbPayload.payment_status = extraData.paymentStatus;
      if (extraData.totalAmount) dbPayload.total_amount = extraData.totalAmount;
      
      supabase
        .from('bookings')
        .update(dbPayload)
        .eq('id', bookingId)
        .then(({ error }) => {
          if (error) console.error('Error updating booking status in Supabase:', error);
        });
    } catch (e) {
      console.error('Exception updating booking status:', e);
    }
  };

  const assignExpert = async (bookingId, expertData) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        // Auto-cancel any other active jobs this expert was previously assigned to
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('expert_id', authData.user.id)
          .neq('id', bookingId)
          .in('status', ['expert_assigned', 'expert_on_way', 'in_progress', 'service_in_progress', 'pending_completion_verification']);
      }
    } catch (e) {
      console.log('Error auto-cancelling old expert jobs:', e);
    }
    
    updateBookingStatus(bookingId, 'expert_assigned', { expert: expertData });
  };

  const startService = (bookingId) => {
    updateBookingStatus(bookingId, 'service_in_progress', {
      serviceStartTime: new Date().toISOString(),
    });
  };

  const completeWork = (bookingId, finalAmount) => {
    const extraData = { serviceEndTime: new Date().toISOString() };
    if (finalAmount) extraData.totalAmount = finalAmount;
    updateBookingStatus(bookingId, 'pending_completion_verification', extraData);
  };

  const completeBooking = async (bookingId, paymentMethod) => {
    // Use DB-valid payment_status values
    const paymentStatus = paymentMethod === 'cash' ? 'cash_collected' : 'paid';
    updateBookingStatus(bookingId, 'booking_completed', {
      paymentStatus,
    });

    // Create expert_earnings record in Supabase
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        console.error('completeBooking: Booking not found locally for earnings creation:', bookingId);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const expertId = booking.expert_id || authData?.user?.id;
      if (!expertId) {
        console.error('completeBooking: No expert ID found for earnings creation');
        return;
      }

      const COMMISSION_RATE = 0.13;
      const serviceAmount = parseFloat(booking.totalAmount) || 0;
      const commissionAmount = Math.round(serviceAmount * COMMISSION_RATE * 100) / 100;
      const expertAmount = Math.round((serviceAmount - commissionAmount) * 100) / 100;

      const isCash = paymentMethod === 'cash';
      const serviceName = booking.services && booking.services.length > 0
        ? booking.services.map(s => s.name).join(', ')
        : (booking.problem || 'General Service');
      const customerName = booking.customer?.name || '';

      const earningPayload = {
        expert_id: expertId,
        booking_id: bookingId,
        service_name: serviceName,
        customer_name: customerName,
        service_amount: serviceAmount,
        commission_rate: COMMISSION_RATE,
        commission_amount: commissionAmount,
        expert_amount: expertAmount,
        payment_method: isCash ? 'cash' : 'online',
        payment_status: 'paid',
        platform_due: isCash ? commissionAmount : 0,
        platform_due_status: isCash ? 'unpaid' : 'not_applicable',
      };

      const { error } = await supabase
        .from('expert_earnings')
        .insert(earningPayload);

      if (error) {
        console.error('Error creating expert earning:', error);
      }
    } catch (e) {
      console.error('Exception creating expert earning:', e);
    }
  };

  const getBookingsByStatus = (statusFilter) => {
    if (statusFilter === 'active') {
      return bookings.filter((b) =>
        !['booking_completed', 'cancelled'].includes(b.status)
      );
    }
    if (statusFilter === 'completed') {
      return bookings.filter((b) => b.status === 'booking_completed');
    }
    if (statusFilter === 'cancelled') {
      return bookings.filter((b) => b.status === 'cancelled');
    }
    return bookings;
  };

  const getBookingById = (bookingId) => {
    return bookings.find(b => b.id === bookingId) || null;
  };

  const submitRating = async (bookingId, rating, review) => {
    // 1. Local update
    setBookings((prev) => prev.map(b => b.id === bookingId ? { ...b, rating, review } : b));
    setActiveBooking((prev) => {
      if (prev && prev.id === bookingId) {
        return { ...prev, rating, review };
      }
      return prev;
    });

    // 2. DB update
    try {
      const { error: bookingUpdateError } = await supabase.from('bookings').update({ rating, review }).eq('id', bookingId);
      
      if (bookingUpdateError) {
        console.error('Error saving rating to bookings:', bookingUpdateError);
        Alert.alert('Error', 'Failed to save rating. Check console.');
      }
      
      // 3. Recalculate Expert Average Rating
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && booking.expert_id) {
        const { data: expertBookings, error: fetchError } = await supabase
          .from('bookings')
          .select('rating')
          .eq('expert_id', booking.expert_id)
          .not('rating', 'is', null);
          
        if (fetchError) {
           console.error('Error fetching expert ratings:', fetchError);
        }
          
        if (expertBookings && expertBookings.length > 0) {
          const sum = expertBookings.reduce((acc, curr) => acc + Number(curr.rating), 0);
          const avg = sum / expertBookings.length;
          const { error: mechanicUpdateError } = await supabase.from('mechanics').update({ rating: avg.toFixed(1) }).eq('id', booking.expert_id);
          
          if (mechanicUpdateError) {
             console.error('Error updating mechanic rating:', mechanicUpdateError);
          }
        }
      }
    } catch(e) {
      console.error('Exception saving rating:', e);
      Alert.alert('Error', 'Failed to save rating due to exception.');
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        activeBooking,
        setActiveBooking,
        createBooking,
        updateBookingStatus,
        assignExpert,
        startService,
        completeWork,
        completeBooking,
        generateCode,
        getBookingsByStatus,
        getBookingById,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartVehicleId,
        cartTotal,
        pricingTick,
        submitRating,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
