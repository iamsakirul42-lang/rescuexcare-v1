import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';
import { supabase } from '../../lib/supabase';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function UserBookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking: initialBooking } = route.params;
  const { bookings, updateBookingStatus, getBookingById } = useBooking();

  // Get live booking data from store
  const booking = getBookingById(initialBooking.id) || initialBooking;

  // Service timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (booking.status === 'service_in_progress' && booking.serviceStartTime) {
      const updateTimer = () => {
        const start = new Date(booking.serviceStartTime).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [booking.status, booking.serviceStartTime]);

  // Fallback Polling (Bypasses Realtime RLS Replica Identity issue)
  useEffect(() => {
    let pollInterval;
    if (!['booking_completed', 'cancelled'].includes(booking.status)) {
      pollInterval = setInterval(async () => {
        try {
          const { data } = await supabase
            .from('bookings')
            .select('status, service_start_time, service_end_time, expert_id')
            .eq('id', booking.id)
            .neq('notes', Date.now().toString()) // Cache buster for React Native
            .single();
            
          if (data) {
            let expertData = null;
            
            // If the database has an expert assigned, but our local state doesn't have the full details yet
            if (data.expert_id && !booking.expert) {
              const { data: mechanic } = await supabase
                .from('mechanics')
                .select('*')
                .eq('id', data.expert_id)
                .single();
                
              if (mechanic) {
                expertData = {
                  name: mechanic.name,
                  phone: mechanic.phone,
                  vehicleTypes: mechanic.vehicle_types || [],
                  specialization: mechanic.services ? mechanic.services.join(', ') : 'General Service',
                  experience: (mechanic.experience_years || 0) + ' Years',
                  rating: mechanic.rating || 4.8
                };
              }
            }

            if (data.status !== booking.status || expertData) {
              updateBookingStatus(booking.id, data.status, {
                serviceStartTime: data.service_start_time,
                serviceEndTime: data.service_end_time,
                ...(expertData ? { expert: expertData } : {})
              });
            }
          }
        } catch (err) {
          console.log('Polling error:', err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [booking.status, booking.id]);

  // Calculate final duration for completed bookings
  const getFinalDuration = () => {
    if (booking.serviceStartTime && booking.serviceEndTime) {
      const start = new Date(booking.serviceStartTime).getTime();
      const end = new Date(booking.serviceEndTime).getTime();
      return formatDuration(Math.floor((end - start) / 1000));
    }
    return null;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'waiting_assignment': return 'Waiting for Assignment';
      case 'expert_assigned': return 'Expert Assigned';
      case 'service_in_progress': return 'Service In Progress';
      case 'pending_completion_verification': return 'Pending Verification';
      case 'booking_completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'booking_completed') return '#22C55E';
    if (status === 'cancelled') return '#EF4444';
    if (status === 'service_in_progress') return '#3B82F6';
    if (status === 'pending_completion_verification') return '#F59E0B';
    return '#ff5e2c';
  };

  const isCancelable = ['pending', 'waiting_assignment', 'expert_assigned'].includes(booking.status);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            updateBookingStatus(booking.id, 'cancelled');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleRateExpert = () => {
    navigation.navigate('Rating', { bookingId: booking.id });
  };

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserMainTabs' }],
    });
  };

  const handleViewHistory = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserMainTabs', params: { screen: 'History' } }],
    });
  };

  const TrackingTimeline = () => {
    const statusMap = {
      'pending': 1,
      'waiting_assignment': 2,
      'expert_assigned': 2, // Stays at step 2 until expert presses I Am Ready
      'expert_on_way': 3,
      'service_in_progress': 5,
      'pending_completion_verification': 6,
      'booking_completed': 7,
    };
    
    const isCancelled = booking.status === 'cancelled';
    
    let step = statusMap[booking.status] || 1;
    if (isCancelled) {
      if (booking.serviceStartTime) step = 5;
      else if (booking.expert) step = 2;
      else step = 2; 
    }

    const renderStep = (stepNumber, title, subtitle, isLast = false) => {
      const isActive = step >= stepNumber;
      const isCurrentCancelStep = isCancelled && step === stepNumber;
      
      const dotColor = isCurrentCancelStep ? '#EF4444' : (isActive ? '#22C55E' : '#F3F4F6');
      const lineColor = (isActive && !isCurrentCancelStep) ? '#22C55E' : '#E5E7EB';
      const iconColor = (isCurrentCancelStep || isActive) ? '#FFF' : '#D1D5DB';
      
      return (
        <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 24 }}>
          <View style={{ alignItems: 'center', marginRight: 16 }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14, 
              backgroundColor: dotColor,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <MaterialCommunityIcons name={isCurrentCancelStep ? "close" : "check"} size={16} color={iconColor} />
            </View>
            {!isLast && (
              <View style={{ width: 2, height: 40, backgroundColor: lineColor, marginTop: 4 }} />
            )}
          </View>
          <View style={{ flex: 1, paddingTop: 2 }}>
            <Text style={{ fontFamily: 'Lufga-Bold', fontSize: 16, color: (isActive || isCurrentCancelStep) ? '#1A1A1A' : '#9CA3AF' }}>
              {isCurrentCancelStep ? 'Booking Cancelled' : title}
            </Text>
            {(isActive || isCurrentCancelStep) && subtitle && (
              <Text style={{ fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {isCurrentCancelStep ? 'This booking was cancelled.' : subtitle}
              </Text>
            )}
          </View>
        </View>
      );
    };

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Tracker</Text>
        <View style={{ marginTop: 10 }}>
          {renderStep(1, 'Booking Confirmed', 'Booking has been successfully received.')}
          {renderStep(2, 'RescueX Team Reviewing', 'Your booking is being processed.')}
          {renderStep(3, 'Expert Is Coming', 'Your RescueX expert is on the way.')}
          {renderStep(4, 'Verify Start OTP', 'Share OTP with expert to begin service.')}
          {renderStep(5, 'Service In Progress', 'Service timer is active.')}
          {renderStep(6, 'Verify Completion OTP', 'Share OTP only when satisfied.')}
          {renderStep(7, 'Booking Completed', 'Service successfully finished.', true)}
        </View>
      </View>
    );
  };

  // ─── COMPLETED VIEW ────────────────────────────────
  if (booking.status === 'booking_completed') {
    const duration = getFinalDuration();
    return (
      <View style={styles.mainContainer}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.completedBanner}>
            <View style={styles.completedIconCircle}>
              <MaterialCommunityIcons name="check-decagram" size={56} color="#22C55E" />
            </View>
            <Text style={styles.completedTitle}>Service Completed Successfully</Text>
            <Text style={styles.completedSubtitle}>Thank you for choosing RescueX.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.verifiedRow}>
              <MaterialCommunityIcons name="shield-check" size={18} color="#22C55E" />
              <Text style={styles.verifiedText}>RescueX Verified</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking ID</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: 'right', marginLeft: 20 }]} numberOfLines={2}>{booking.id}</Text>
            </View>

            {duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service Duration</Text>
                <Text style={[styles.infoValue, { color: '#3B82F6' }]}>{duration}</Text>
              </View>
            )}

            {booking.expert && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expert</Text>
                <Text style={styles.infoValue}>{booking.expert.name}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{booking.type === 'instant' ? 'Booking Type' : 'Date'}</Text>
              <Text style={styles.infoValue}>{booking.type === 'instant' ? 'Instant Request' : booking.scheduledDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment</Text>
              <Text style={styles.infoValue}>{booking.paymentMethod === 'upi' ? 'UPI (Paid)' : 'Cash (Paid)'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{booking.type === 'instant' ? 'Problem Details' : 'Services'}</Text>
            {booking.type === 'instant' ? (
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>{booking.vehicleTitle} - {booking.problem}</Text>
                <Text style={styles.servicePrice}>TBD</Text>
              </View>
            ) : (
              booking.services && booking.services.map((svc, i) => (
                <View key={i} style={styles.serviceRow}>
                  <Text style={styles.serviceName}>{svc.quantity}x {svc.name}</Text>
                  <Text style={styles.servicePrice}>₹{svc.price * svc.quantity}</Text>
                </View>
              ))
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{booking.type === 'instant' ? 'TBD' : `₹${booking.totalAmount || 0}`}</Text>
            </View>
          </View>

          {(booking.rating === undefined || booking.rating === null) && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleRateExpert}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Rate Expert</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={handleReturnHome}>
            <Text style={styles.secondaryButtonText}>Return Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tertiaryButton} onPress={handleViewHistory}>
            <Text style={styles.tertiaryButtonText}>View History</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── MAIN ACTIVE BOOKING VIEW ──────────────────────
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Scheduled Booking Tracking Timeline */}
        {booking.type !== 'instant' && <TrackingTimeline />}

        {/* Booking Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Info</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={[styles.infoValue, { flex: 1, textAlign: 'right', marginLeft: 20 }]} numberOfLines={2}>{booking.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                {getStatusText(booking.status)}
              </Text>
            </View>
          </View>

          {/* Expert Details (visible after dispatch) */}
          {booking.expert && !['pending', 'waiting_assignment'].includes(booking.status) && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned Expert</Text>
                <Text style={styles.infoValue}>{booking.expert.name}</Text>
              </View>
              {booking.expert.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expert Contact</Text>
                  <Text style={styles.infoValue}>{booking.expert.phone}</Text>
                </View>
              )}
              {booking.expert.vehicleTypes && booking.expert.vehicleTypes.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expertise</Text>
                  <Text style={styles.infoValue}>{booking.expert.vehicleTypes.join(', ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </View>
              )}
            </>
          )}

          {/* Do not show vehicle details for scheduled bookings as per user request */}
          {booking.vehicleId && booking.type === 'instant' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle</Text>
              <Text style={styles.infoValue}>{booking.vehicleId?.charAt(0).toUpperCase() + booking.vehicleId?.slice(1)}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{booking.type === 'instant' ? 'Booking Type' : 'Scheduled Date'}</Text>
            <Text style={styles.infoValue}>{booking.type === 'instant' ? 'Instant Request' : booking.scheduledDate}</Text>
          </View>
          
          {booking.scheduledTime && booking.type !== 'instant' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scheduled Time</Text>
              <Text style={styles.infoValue}>{booking.scheduledTime}</Text>
            </View>
          )}

          {booking.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: 'right', marginLeft: 20 }]} numberOfLines={3}>
                {booking.address.fullAddress || booking.address}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{booking.paymentMethod === 'upi' ? 'UPI' : 'Cash'}</Text>
          </View>
        </View>

        {/* Services Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{booking.type === 'instant' ? 'Problem Details' : 'Services'}</Text>
          {booking.type === 'instant' ? (
            <View style={styles.serviceRow}>
              <Text style={styles.serviceName}>{booking.vehicleTitle} - {booking.problem}</Text>
              <Text style={styles.servicePrice}>TBD</Text>
            </View>
          ) : (
            booking.services && booking.services.map((svc, i) => (
              <View key={i} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{svc.quantity}x {svc.name}</Text>
                <Text style={styles.servicePrice}>₹{svc.price * svc.quantity}</Text>
              </View>
            ))
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{booking.type === 'instant' && !booking.totalAmount ? 'TBD' : `₹${booking.totalAmount || 0}`}</Text>
          </View>
        </View>

        {/* ─── SERVICE TIMER (shown during service_in_progress) ─── */}
        {booking.status === 'service_in_progress' && (
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <MaterialCommunityIcons name="clock-fast" size={22} color="#3B82F6" />
              <Text style={styles.timerTitle}>Service In Progress</Text>
            </View>
            <Text style={styles.timerSubtitle}>Elapsed Time</Text>
            <Text style={styles.timerValue}>{formatDuration(elapsed)}</Text>
          </View>
        )}

        {/* ─── START VERIFICATION CODE ─── */}
        {['waiting_assignment', 'expert_assigned', 'expert_on_way'].includes(booking.status) && booking.startCode && (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>Start Verification Code</Text>
            <View style={styles.otpDigitsRow}>
              {booking.startCode.split('').map((digit, i) => (
                <View key={i} style={styles.otpDigitBox}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#F59E0B" />
              <Text style={styles.warningText}>
                Do NOT share this verification code until the RescueX expert has arrived at your location and you are ready for the service to begin.
              </Text>
            </View>
          </View>
        )}

        {/* ─── COMPLETION VERIFICATION POPUP (shown during pending_completion_verification) ─── */}
        {booking.status === 'pending_completion_verification' && booking.completionCode && (
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <MaterialCommunityIcons name="check-circle" size={40} color="#22C55E" />
              <Text style={styles.completionTitle}>Service Completed</Text>
            </View>
            <Text style={styles.completionCodeLabel}>Completion Verification Code</Text>
            <View style={styles.otpDigitsRow}>
              {booking.completionCode.split('').map((digit, i) => (
                <View key={i} style={[styles.otpDigitBox, { backgroundColor: '#ECFDF5', borderColor: '#22C55E' }]}>
                  <Text style={[styles.otpDigit, { color: '#22C55E' }]}>{digit}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#F59E0B" />
              <Text style={styles.warningText}>
                Do NOT share this verification code until the work has been fully completed and you are satisfied with the service. Once shared, the booking will be permanently marked as completed.
              </Text>
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {isCancelable && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 20, color: '#1A1A1A',
  },
  content: {
    flex: 1, padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A', marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  infoLabel: {
    fontFamily: 'Lufga-Bold', fontSize: 14, color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'Lufga-Bold', fontSize: 14, color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Lufga-Bold', fontSize: 12, textTransform: 'capitalize',
  },
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  serviceName: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15,
    color: '#4B5563', flex: 1,
  },
  servicePrice: {
    fontFamily: 'Lufga-Bold', fontSize: 15, color: '#1A1A1A',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A',
  },
  totalValue: {
    fontFamily: 'Lufga-Bold', fontSize: 18, color: '#ff5e2c',
  },

  // ── OTP Card ──
  otpCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1.5, borderColor: '#ff5e2c',
    alignItems: 'center',
  },
  otpLabel: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A', marginBottom: 16,
  },
  otpDigitsRow: {
    flexDirection: 'row', justifyContent: 'center', marginBottom: 20,
  },
  otpDigitBox: {
    width: 52, height: 60, borderRadius: 12,
    backgroundColor: '#FFF7ED', borderWidth: 1.5, borderColor: '#ff5e2c',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 6,
  },
  otpDigit: {
    fontFamily: 'Lufga-Bold', fontSize: 28, color: '#ff5e2c',
  },
  warningBox: {
    flexDirection: 'row', backgroundColor: '#FEF3C7',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCD34D',
    alignItems: 'flex-start',
  },
  warningText: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13,
    color: '#92400E', flex: 1, marginLeft: 10, lineHeight: 20,
  },

  // ── Timer Card ──
  timerCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1.5, borderColor: '#3B82F6',
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  timerTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#3B82F6', marginLeft: 8,
  },
  timerSubtitle: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14,
    color: '#6B7280', marginBottom: 8,
  },
  timerValue: {
    fontFamily: 'Lufga-Bold', fontSize: 40, color: '#1E3A8A', letterSpacing: 2,
  },

  // ── Completion Card ──
  completionCard: {
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 24,
    marginBottom: 16, borderWidth: 1.5, borderColor: '#22C55E',
    alignItems: 'center',
  },
  completionHeader: {
    alignItems: 'center', marginBottom: 16,
  },
  completionTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 20, color: '#166534', marginTop: 8,
  },
  completionCodeLabel: {
    fontFamily: 'Lufga-Bold', fontSize: 14, color: '#6B7280', marginBottom: 16,
  },

  // ── Completed Banner ──
  completedBanner: {
    alignItems: 'center', marginBottom: 24,
  },
  completedIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  completedTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 22, color: '#166534', textAlign: 'center',
  },
  completedSubtitle: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15,
    color: '#6B7280', marginTop: 4,
  },
  verifiedRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  verifiedText: {
    fontFamily: 'Lufga-Bold', fontSize: 13, color: '#22C55E', marginLeft: 6,
  },

  // ── Buttons ──
  cancelButton: {
    flexDirection: 'row', backgroundColor: '#FEF2F2',
    paddingVertical: 16, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 10, borderWidth: 1, borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#EF4444',
  },
  primaryButton: {
    flexDirection: 'row', backgroundColor: '#ff5e2c',
    paddingVertical: 16, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6', paddingVertical: 16,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#4B5563',
  },
  tertiaryButton: {
    paddingVertical: 12, justifyContent: 'center', alignItems: 'center',
  },
  tertiaryButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 15, color: '#ff5e2c',
  },
});
