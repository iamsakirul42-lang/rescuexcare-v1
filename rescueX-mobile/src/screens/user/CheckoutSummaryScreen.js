import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';

export default function CheckoutSummaryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { address, date, time, notes } = route.params || {};
  const { cart, cartTotal, cartVehicleId } = useBooking();

  const handleNext = () => {
    navigation.navigate('CheckoutPaymentScreen', {
      address, date, time, notes
    });
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Cart is empty.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CategoriesScreen')} style={{marginTop: 20}}>
          <Text style={{color: '#ff5e2c'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Schedule Info */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color="#ff5e2c" />
            <Text style={styles.cardTitle}>Schedule Details</Text>
          </View>
          <View style={styles.detailsTable}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Date:</Text>
              <Text style={styles.detailsValue}>{date}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Time:</Text>
              <Text style={styles.detailsValue}>{time}</Text>
            </View>
          </View>
        </View>

        {/* Address Info */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#ff5e2c" />
            <Text style={styles.cardTitle}>Service Address</Text>
          </View>
          <View style={styles.detailsTable}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Type:</Text>
              <Text style={styles.detailsValue}>{address?.type || 'Other'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Location:</Text>
              <Text style={styles.detailsValue}>{address?.fullAddress}</Text>
            </View>
            {address?.landmark ? (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Landmark:</Text>
                <Text style={styles.detailsValue}>{address.landmark}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Services Info */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="wrench" size={20} color="#ff5e2c" />
            <Text style={styles.cardTitle}>Selected Services ({cartVehicleId?.toUpperCase()})</Text>
          </View>
          {cart.map((item, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceRowLeft}>
                <Text style={styles.serviceQty}>{item.quantity}x</Text>
                <Text style={styles.serviceName}>{item.service.name}</Text>
              </View>
              <Text style={styles.servicePrice}>₹{item.service.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Notes Info */}
        {notes ? (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="note-text" size={20} color="#ff5e2c" />
              <Text style={styles.cardTitle}>Additional Notes</Text>
            </View>
            <Text style={styles.cardText}>{notes}</Text>
          </View>
        ) : null}

        {/* Billing Info */}
        <View style={styles.billingSection}>
          <Text style={styles.billingTitle}>Billing Details</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Subtotal</Text>
            <Text style={styles.billingValue}>₹{cartTotal}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billingRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{cartTotal}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomTotalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>₹{cartTotal}</Text>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Select Payment</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" style={{marginLeft: 8}} />
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
  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A', marginLeft: 8 },
  cardText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#4B5563', lineHeight: 22 },
  subText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  detailsTable: { marginTop: 4 },
  detailsRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  detailsLabel: { width: 80, fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  detailsValue: { flex: 1, fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#4B5563', lineHeight: 20 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-start' },
  serviceRowLeft: { flexDirection: 'row', flex: 1, paddingRight: 12, alignItems: 'flex-start' },
  serviceQty: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#ff5e2c', marginRight: 8, marginTop: 1 },
  serviceName: { flex: 1, fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#4B5563', lineHeight: 22 },
  servicePrice: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#1A1A1A', marginTop: 1 },
  billingSection: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  billingTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A', marginBottom: 16 },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  billingLabel: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#4B5563' },
  billingValue: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A' },
  totalValue: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#ff5e2c' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 8
  },
  bottomTotalContainer: { flex: 1 },
  bottomTotalLabel: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280' },
  bottomTotalValue: { fontFamily: 'Lufga-Bold', fontSize: 22, color: '#1A1A1A' },
  nextButton: { flexDirection: 'row', backgroundColor: '#ff5e2c', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
