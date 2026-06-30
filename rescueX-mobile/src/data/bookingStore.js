import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  
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

  const createBooking = (bookingData) => {
    // Generate both OTPs at creation time (MVP approach)
    const startCode = generateCode();
    let completionCode = generateCode();
    // Ensure completion code is different from start code
    while (completionCode === startCode) {
      completionCode = generateCode();
    }

    const newBooking = {
      id: 'BK' + Date.now(),
      ...bookingData,
      status: 'booking_created',
      createdAt: new Date().toISOString(),
      expert: null,
      startCode,
      completionCode,
      serviceStartTime: null,
      serviceEndTime: null,
      rating: null,
      review: '',
      paymentMethod: bookingData.paymentMethod || 'cash',
      paymentStatus: bookingData.paymentMethod === 'upi' ? 'paid' : 'pending',
    };
    setActiveBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId, status, extraData = {}) => {
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
  };

  const assignExpert = (bookingId, expertData) => {
    updateBookingStatus(bookingId, 'expert_assigned', { expert: expertData });
  };

  const startService = (bookingId) => {
    updateBookingStatus(bookingId, 'service_in_progress', {
      serviceStartTime: new Date().toISOString(),
    });
  };

  const completeWork = (bookingId) => {
    updateBookingStatus(bookingId, 'pending_completion_verification');
  };

  const completeBooking = (bookingId, paymentMethod) => {
    const endTime = new Date().toISOString();
    updateBookingStatus(bookingId, 'booking_completed', {
      serviceEndTime: endTime,
      paymentStatus: 'paid',
    });
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
