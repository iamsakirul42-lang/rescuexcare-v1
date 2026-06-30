import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';
import { categoriesMarketplace } from '../../data/categoriesMarketplace';

const ExpandableSection = ({ title, children, titleColor = '#1A1A1A', iconName, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {iconName && <MaterialCommunityIcons name={iconName} size={20} color={titleColor} style={{ marginRight: 8 }} />}
          <Text style={[styles.sectionTitle, { color: titleColor, marginBottom: 0 }]}>{title}</Text>
        </View>
        <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color="#6B7280" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { service, vehicleId } = route.params || {};
  const { cart, addToCart, clearCart, cartVehicleId } = useBooking();

  if (!service) return null;

  const handleAddToCart = () => {
    const exists = cart.find(item => item.service.id === service.id);
    if (exists) {
      Alert.alert("Already Added", `You already added "${service.name}" to your bag.`);
      return;
    }

    if (cart.length > 0 && cartVehicleId !== vehicleId) {
      const vLabel = categoriesMarketplace.vehicles.find(v => v.id === cartVehicleId)?.label || 'another vehicle';
      const nLabel = categoriesMarketplace.vehicles.find(v => v.id === vehicleId)?.label || 'this vehicle';
      Alert.alert(
        'Change Vehicle?',
        `Your current cart contains ${vLabel} services.\n\nSwitching to ${nLabel} will clear your cart.\nContinue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            style: 'destructive',
            onPress: () => {
              clearCart();
              addToCart(service, vehicleId);
              Alert.alert("Success", "Service added to your bag!");
            }
          }
        ]
      );
      return;
    }
    
    addToCart(service, vehicleId);
    Alert.alert("Success", "Service added to your bag!");
  };

  const handleBookNow = () => {
    if (cart.length > 0 && cartVehicleId !== vehicleId) {
      clearCart();
    }
    const exists = cart.find(item => item.service.id === service.id);
    if (!exists || cartVehicleId !== vehicleId) {
      addToCart(service, vehicleId);
    }
    navigation.navigate('CartScreen');
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={service.illustration} size={64} color="#ff5e2c" />
        </View>

        <Text style={styles.serviceName}>{service.name}</Text>
        
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={18} color="#F59E0B" />
          <Text style={styles.ratingText}>{service.rating}</Text>
          <Text style={styles.reviewsText}>({service.reviews} reviews)</Text>
        </View>

        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            {service.isQuote ? (
              <MaterialCommunityIcons name="chat-processing" size={20} color="#ff5e2c" />
            ) : (
              <MaterialCommunityIcons name="cash" size={20} color="#ff5e2c" />
            )}
            <Text style={styles.infoCardTitle}>{service.isQuote ? 'Pricing' : 'Price'}</Text>
            <Text style={[styles.infoCardValue, service.isQuote && { fontSize: 16 }]}>
              {service.isQuote ? 'Talk to Expert' : `${service.isStartingPrice ? 'Starts ₹' : '₹'}${service.price}`}
            </Text>
            {service.priceLabel && <Text style={styles.infoCardSub}>{service.priceLabel}</Text>}
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#ff5e2c" />
            <Text style={styles.infoCardTitle}>Duration</Text>
            <Text style={styles.infoCardValue}>{service.duration}</Text>
          </View>
        </View>

        <ExpandableSection title="What's Included" iconName="check-decagram" defaultExpanded={true}>
          {service.includes && service.includes.map((item, idx) => (
            <View key={`inc-${idx}`} style={styles.listItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#22C55E" />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </ExpandableSection>

        {service.notIncluded && service.notIncluded.length > 0 && (
          <ExpandableSection title="Not Included" iconName="close-octagon" titleColor="#EF4444">
            {service.notIncluded.map((item, idx) => (
              <View key={`exc-${idx}`} style={styles.listItem}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                <Text style={[styles.listText, { color: '#6B7280' }]}>{item}</Text>
              </View>
            ))}
          </ExpandableSection>
        )}

        <ExpandableSection title="Important Information" iconName="information" titleColor="#3B82F6">
          {service.importantNote && (
            <View style={styles.importantNoteBox}>
              <Text style={styles.importantNoteText}>{service.importantNote}</Text>
            </View>
          )}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>Transparent Pricing</Text>
            <Text style={styles.disclaimerText}>
              {vehicleId === 'truck'
                ? "Heavy commercial vehicle repairs vary based on the vehicle model, load capacity, fault severity, spare parts required, and service location. Final pricing will be shared by the RescueX expert after inspection. No additional work or charges will be applied without your approval."
                : "The displayed price covers service and labour only. If additional spare parts, consumables, tyres, tubes, batteries, engine oil, or other components are required, the RescueX expert will explain the issue and provide the exact cost before proceeding. No additional work or charges will be applied without the customer's approval."}
            </Text>
          </View>
        </ExpandableSection>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addCartButton} onPress={handleAddToCart}>
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: '#ff5e2c', borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  
  iconWrapper: {
    width: 100, height: 100, borderRadius: 24, backgroundColor: '#ff5e2c15',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginBottom: 20
  },
  serviceName: { fontFamily: 'Lufga-Bold', fontSize: 26, color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  ratingText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A', marginLeft: 4 },
  reviewsText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#6B7280', marginLeft: 6 },
  
  infoCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  infoCard: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16,
    marginHorizontal: 6, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6'
  },
  infoCardTitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  infoCardValue: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A', textAlign: 'center' },
  infoCardSub: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 12, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
  
  sectionContainer: { marginBottom: 16, backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A' },
  sectionContent: { paddingHorizontal: 20, paddingBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  listText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#1F2937', flex: 1, marginLeft: 12, lineHeight: 22 },
  
  importantNoteBox: { backgroundColor: '#3B82F615', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#3B82F630' },
  importantNoteText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#1E3A8A', lineHeight: 22 },
  
  disclaimerContainer: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16 },
  disclaimerTitle: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#374151', marginBottom: 6 },
  disclaimerText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', lineHeight: 20 },
  
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    flexDirection: 'row', padding: 20, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 8
  },
  addCartButton: {
    flex: 1, backgroundColor: '#ff5e2c15', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#ff5e2c30'
  },
  addCartText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#ff5e2c' },
  bookNowButton: {
    flex: 1, backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center',
  },
  bookNowText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
