import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';

export default function CheckoutPaymentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { address, date, time, notes } = route.params || {};
  const { cart, cartTotal, cartVehicleId, createBooking, clearCart } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);

    // Simulate network delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Create booking in global store
    const newBooking = await createBooking({
      services: cart.map(item => ({ ...item.service, quantity: item.quantity })),
      vehicleId: cartVehicleId,
      totalAmount: cartTotal,
      scheduledDate: date,
      scheduledTime: time,
      address,
      notes,
      paymentMethod,
      bookingType: 'scheduled'
    });

    // 2. Clear Cart
    clearCart();

    setIsProcessing(false);
    
    // 3. Navigate to confirmation screen
    navigation.navigate('CheckoutConfirmedScreen');
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => !isProcessing && navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <TouchableOpacity 
          style={[styles.paymentCard, paymentMethod === 'upi' && styles.paymentCardSelected]}
          onPress={() => setPaymentMethod('upi')}
          disabled={isProcessing}
        >
          <View style={styles.paymentCardHeader}>
            <View style={styles.paymentIconContainer}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color={paymentMethod === 'upi' ? '#ff5e2c' : '#6B7280'} />
            </View>
            <View style={styles.paymentTextContainer}>
              <Text style={[styles.paymentTitle, paymentMethod === 'upi' && { color: '#ff5e2c' }]}>UPI (Google Pay, PhonePe)</Text>
              <Text style={styles.paymentSubtitle}>Pay now to confirm your booking</Text>
            </View>
            <MaterialCommunityIcons 
              name={paymentMethod === 'upi' ? 'radiobox-marked' : 'radiobox-blank'} 
              size={24} 
              color={paymentMethod === 'upi' ? '#ff5e2c' : '#D1D5DB'} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentCard, paymentMethod === 'cash' && styles.paymentCardSelected]}
          onPress={() => setPaymentMethod('cash')}
          disabled={isProcessing}
        >
          <View style={styles.paymentCardHeader}>
            <View style={styles.paymentIconContainer}>
              <MaterialCommunityIcons name="cash" size={24} color={paymentMethod === 'cash' ? '#ff5e2c' : '#6B7280'} />
            </View>
            <View style={styles.paymentTextContainer}>
              <Text style={[styles.paymentTitle, paymentMethod === 'cash' && { color: '#ff5e2c' }]}>Pay with Cash</Text>
              <Text style={styles.paymentSubtitle}>Pay the expert after service completion</Text>
            </View>
            <MaterialCommunityIcons 
              name={paymentMethod === 'cash' ? 'radiobox-marked' : 'radiobox-blank'} 
              size={24} 
              color={paymentMethod === 'cash' ? '#ff5e2c' : '#D1D5DB'} 
            />
          </View>
        </TouchableOpacity>
        
        <View style={styles.secureNote}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
          <Text style={styles.secureNoteText}>100% Secure Payments</Text>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && { opacity: 0.7 }]} 
          onPress={handlePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              {paymentMethod === 'upi' ? `Pay ₹${cartTotal}` : 'Place Booking'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: '#ff5e2c', borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A', marginBottom: 16 },
  paymentCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F3F4F6'
  },
  paymentCardSelected: { borderColor: '#ff5e2c', backgroundColor: '#ff5e2c05' },
  paymentCardHeader: { flexDirection: 'row', alignItems: 'center' },
  paymentIconContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  paymentTextContainer: { flex: 1 },
  paymentTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A' },
  paymentSubtitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', marginTop: 2 },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secureNoteText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#10B981', marginLeft: 6 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  payButton: { backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  payButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
