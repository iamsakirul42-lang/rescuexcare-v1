import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';
import { theme } from '../../theme';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function ExpertActiveJobScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params;
  const { getBookingById, startService, completeWork, completeBooking, updateBookingStatus } = useBooking();

  const booking = getBookingById(bookingId);

  const [startCodeInput, setStartCodeInput] = useState('');
  const [completionCodeInput, setCompletionCodeInput] = useState('');
  const [startCodeError, setStartCodeError] = useState('');
  const [completionCodeError, setCompletionCodeError] = useState('');

  // Service timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (booking?.status === 'service_in_progress' && booking?.serviceStartTime) {
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
  }, [booking?.status, booking?.serviceStartTime]);

  if (!booking) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.errorText}>Booking not found.</Text>
      </View>
    );
  }

  const handleVerifyStartCode = () => {
    if (startCodeInput === booking.startCode) {
      setStartCodeError('');
      startService(booking.id);
      Alert.alert('✅ Verification Successful', 'Service has been started. Timer is now running.');
    } else {
      setStartCodeError('Invalid code. Please ask the customer for the correct code.');
    }
  };

  const handleWorkCompleted = () => {
    Alert.alert(
      "Complete Service",
      "Are you sure the work has been completed?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Completed",
          onPress: () => {
            completeWork(booking.id);
          }
        }
      ]
    );
  };

  const handleVerifyCompletionCode = () => {
    if (completionCodeInput === booking.completionCode) {
      setCompletionCodeError('');
      if (booking.paymentMethod === 'cash') {
        Alert.alert(
          "💰 Cash Payment",
          "Has the customer paid the cash amount?",
          [
            { text: "Not Yet", style: "cancel" },
            {
              text: "Cash Received",
              onPress: () => {
                completeBooking(booking.id, 'cash');
                Alert.alert('✅ Booking Completed', 'Great work! The booking has been marked as completed.');
              }
            }
          ]
        );
      } else {
        // UPI - already paid
        completeBooking(booking.id, 'upi');
        Alert.alert('✅ Booking Completed', 'Payment was already received via UPI. Booking complete!');
      }
    } else {
      setCompletionCodeError('Invalid code. Please ask the customer for the correct completion code.');
    }
  };

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ExpertMainTabs' }],
    });
  };

  // ─── BOOKING COMPLETED VIEW ────────────────────────
  if (booking.status === 'booking_completed') {
    const duration = booking.serviceStartTime && booking.serviceEndTime
      ? formatDuration(Math.floor((new Date(booking.serviceEndTime).getTime() - new Date(booking.serviceStartTime).getTime()) / 1000))
      : null;

    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Complete</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.completedBanner}>
            <View style={styles.completedCircle}>
              <MaterialCommunityIcons name="check-decagram" size={56} color="#22C55E" />
            </View>
            <Text style={styles.completedTitle}>Service Completed Successfully</Text>
            {duration && <Text style={styles.durationText}>Duration: {duration}</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking ID</Text>
              <Text style={styles.infoValue}>{booking.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment</Text>
              <Text style={[styles.infoValue, { color: '#22C55E' }]}>
                {booking.paymentMethod === 'upi' ? 'UPI (Paid)' : 'Cash (Received)'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>₹{booking.totalAmount}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.returnButton} onPress={handleReturnHome}>
            <Text style={styles.returnButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── MAIN ACTIVE JOB VIEW ─────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Job Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={styles.infoValue}>{booking.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{booking.scheduledDate} {booking.scheduledTime ? `at ${booking.scheduledTime}` : ''}</Text>
          </View>
          {booking.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: 'right', marginLeft: 16 }]} numberOfLines={3}>
                {booking.address.fullAddress}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{booking.paymentMethod === 'upi' ? 'UPI (Paid)' : 'Cash'}</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Services</Text>
          {booking.services && booking.services.map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{svc.quantity}x {svc.name}</Text>
              <Text style={styles.servicePrice}>₹{svc.price * svc.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{booking.totalAmount}</Text>
          </View>
        </View>

        {/* ─── PHASE 1: Start Service (expert_assigned) ─── */}
        {booking.status === 'expert_assigned' && (
          <View style={styles.verifyCard}>
            <MaterialCommunityIcons name="shield-lock-outline" size={36} color={theme.colors.expertPrimary} />
            <Text style={styles.verifyTitle}>Start Service</Text>
            <Text style={styles.verifySubtitle}>
              Enter the 4-digit verification code shared by the customer to begin the service.
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter 4-digit code"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={4}
              value={startCodeInput}
              onChangeText={(text) => { setStartCodeInput(text); setStartCodeError(''); }}
            />
            {startCodeError ? <Text style={styles.errorMsg}>{startCodeError}</Text> : null}
            <TouchableOpacity
              style={[styles.verifyButton, startCodeInput.length !== 4 && { opacity: 0.5 }]}
              onPress={handleVerifyStartCode}
              disabled={startCodeInput.length !== 4}
            >
              <Text style={styles.verifyButtonText}>Verify & Start Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── PHASE 2: Service In Progress ─── */}
        {booking.status === 'service_in_progress' && (
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <MaterialCommunityIcons name="clock-fast" size={22} color="#3B82F6" />
              <Text style={styles.timerTitle}>Service In Progress</Text>
            </View>
            <Text style={styles.timerSubtitle}>Elapsed Time</Text>
            <Text style={styles.timerValue}>{formatDuration(elapsed)}</Text>

            <TouchableOpacity style={styles.workCompletedButton} onPress={handleWorkCompleted}>
              <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.workCompletedText}>Work Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── PHASE 3: Enter Completion Code ─── */}
        {booking.status === 'pending_completion_verification' && (
          <View style={[styles.verifyCard, { borderColor: '#22C55E' }]}>
            <MaterialCommunityIcons name="check-decagram" size={36} color="#22C55E" />
            <Text style={[styles.verifyTitle, { color: '#166534' }]}>Enter Completion Code</Text>
            <Text style={styles.verifySubtitle}>
              Ask the customer for the completion verification code to finalize the booking.
            </Text>
            <TextInput
              style={[styles.codeInput, { borderColor: '#22C55E' }]}
              placeholder="Enter 4-digit code"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={4}
              value={completionCodeInput}
              onChangeText={(text) => { setCompletionCodeInput(text); setCompletionCodeError(''); }}
            />
            {completionCodeError ? <Text style={styles.errorMsg}>{completionCodeError}</Text> : null}
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: '#22C55E' }, completionCodeInput.length !== 4 && { opacity: 0.5 }]}
              onPress={handleVerifyCompletionCode}
              disabled={completionCodeInput.length !== 4}
            >
              <Text style={styles.verifyButtonText}>Verify & Complete</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 24,
    backgroundColor: theme.colors.expertPrimary,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFF',
  },
  scrollContent: {
    padding: 20, paddingBottom: 100,
  },
  errorText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#6B7280',
    textAlign: 'center', marginTop: 40,
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardTitle: {
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
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
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

  // ── Verify Card ──
  verifyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    marginBottom: 16, borderWidth: 1.5, borderColor: theme.colors.expertPrimary,
    alignItems: 'center',
  },
  verifyTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 20, color: '#1A1A1A',
    marginTop: 12, marginBottom: 8,
  },
  verifySubtitle: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14,
    color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20,
  },
  codeInput: {
    width: '100%', borderWidth: 1.5, borderColor: theme.colors.expertPrimary,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    fontSize: 24, fontFamily: 'Lufga-Bold', textAlign: 'center',
    color: '#1A1A1A', letterSpacing: 8, backgroundColor: '#FAFAFF',
  },
  errorMsg: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13,
    color: '#EF4444', marginTop: 8,
  },
  verifyButton: {
    backgroundColor: theme.colors.expertPrimary,
    paddingVertical: 16, borderRadius: 14,
    width: '100%', alignItems: 'center', marginTop: 16,
  },
  verifyButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFF',
  },

  // ── Timer ──
  timerCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 24,
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
    fontFamily: 'Lufga-Bold', fontSize: 40, color: '#1E3A8A',
    letterSpacing: 2, marginBottom: 24,
  },
  workCompletedButton: {
    flexDirection: 'row', backgroundColor: '#22C55E',
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  workCompletedText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFF',
  },

  // ── Completed ──
  completedBanner: {
    alignItems: 'center', marginBottom: 24,
  },
  completedCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  completedTitle: {
    fontFamily: 'Lufga-Bold', fontSize: 22, color: '#166534', textAlign: 'center',
  },
  durationText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#3B82F6', marginTop: 8,
  },
  returnButton: {
    backgroundColor: theme.colors.expertPrimary,
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  returnButtonText: {
    fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFF',
  },
});
