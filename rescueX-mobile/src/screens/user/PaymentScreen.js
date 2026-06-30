import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBooking } from '../../data/bookingStore';

const { width } = Dimensions.get('window');

export default function PaymentScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { bookings } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);

  const isCash = booking?.paymentMethod === 'cash';

  const handleProceed = () => {
    navigation.replace('Rating', { bookingId });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerSubtitle}>Complete your transaction</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.glassCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={isCash ? 'cash' : 'cellphone'} size={40} color="#22C55E" />
          </View>
          
          <Text style={styles.methodTitle}>
            Payment Method: {isCash ? 'Cash' : 'UPI'}
          </Text>
          
          <Text style={styles.methodDesc}>
            {isCash 
              ? 'Please pay the expert directly via cash.' 
              : 'Proceed to pay via your preferred UPI app.'}
          </Text>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.primaryButton, isCash ? { backgroundColor: '#22C55E' } : { backgroundColor: '#3B82F6' }]} 
            onPress={handleProceed}
          >
            <Text style={styles.primaryButtonText}>
              {isCash ? 'Cash Collected ✓' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 10,
    paddingTop: 40,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  methodTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  methodDesc: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
});

