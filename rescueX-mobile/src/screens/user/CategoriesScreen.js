import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { categoriesMarketplace } from '../../data/categoriesMarketplace';
import { useBooking } from '../../data/bookingStore';

const VEHICLE_ICONS = {
  car: 'car-side',
  bike: 'motorbike',
  auto: 'taxi',
  truck: 'truck',
};

const VEHICLE_COLORS = {
  car: '#3B82F6',
  bike: '#22C55E',
  auto: '#F97316',
  truck: '#8B5CF6',
};

const SEARCH_PLACEHOLDERS = [
  "Search 'Puncture Repair'...",
  "Search 'Battery Jump Start'...",
  "Search 'Engine Oil Change'...",
  "Search 'Tow Truck'...",
  "Search 'Periodic Service'...",
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeVehicleId, setActiveVehicleId] = useState('car');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEvMode, setIsEvMode] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (searchQuery.length > 0) return;

    let timer;
    const fullText = SEARCH_PLACEHOLDERS[placeholderIndex];

    if (charIndex < fullText.length) {
      timer = setTimeout(() => {
        setCurrentPlaceholder(fullText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 70);
    } else {
      timer = setTimeout(() => {
        setCharIndex(0);
        setCurrentPlaceholder('');
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [charIndex, placeholderIndex, searchQuery]);

  const activeVehicle = categoriesMarketplace.vehicles.find(v => v.id === activeVehicleId) || categoriesMarketplace.vehicles[0];
  
  const isSearching = searchQuery.trim().length > 0;
  const lowerQuery = searchQuery.toLowerCase();
  
  const VEHICLE_ORDER = ['bike', 'car', 'auto', 'truck'];
  
  const searchResults = isSearching 
    ? VEHICLE_ORDER.map(vid => {
        const vData = categoriesMarketplace.vehicles.find(v => v.id === vid);
        if (!vData) return null;
        
        const matchingServices = [];
        vData.sections.forEach(sec => {
          if (vid === 'auto') {
            const matchesMode = isEvMode ? sec.id.includes('_ev_') : sec.id.includes('_cng_');
            if (!matchesMode) return;
          }
          sec.services.forEach(svc => {
            if (
              svc.name.toLowerCase().includes(lowerQuery) || 
              (svc.includes && svc.includes.some(inc => inc.toLowerCase().includes(lowerQuery))) ||
              sec.title.toLowerCase().includes(lowerQuery)
            ) {
              matchingServices.push(svc);
            }
          });
        });
        return { vehicle: vData, services: matchingServices };
      }).filter(res => res && res.services.length > 0)
    : [];

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartVehicleId, cartTotal } = useBooking();

  const handleAddService = (service, vehicleId) => {
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
            }
          }
        ]
      );
      return;
    }
    addToCart(service, vehicleId);
  };

  const renderServiceCard = (service, vehicleId = activeVehicleId) => {
    const primaryColor = VEHICLE_COLORS[vehicleId] || '#ff5e2c';
    const cartItem = cart.find(item => item.service.id === service.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <TouchableOpacity 
        key={service.id} 
        style={styles.serviceCard}
        onPress={() => navigation.navigate('ServiceDetailsScreen', { service, vehicleId: activeVehicleId })}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <MaterialCommunityIcons name={service.illustration} size={28} color={primaryColor} />
          </View>
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{service.rating}</Text>
              <Text style={styles.reviewsText}>({service.reviews})</Text>
            </View>
          </View>
        </View>

        <View style={styles.serviceDetailsRow}>
          <View style={styles.detailItem}>
            {service.isQuote ? (
              <MaterialCommunityIcons name="chat-processing" size={16} color="#6B7280" />
            ) : (
              <MaterialCommunityIcons name="cash" size={16} color="#6B7280" />
            )}
            <Text style={styles.detailText}>
              {service.isQuote ? 'Talk to Expert' : `${service.isStartingPrice ? 'Starting from ' : ''}₹${service.price}`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{service.duration}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Categories</Text>
            <Text style={styles.headerSubtitle}>Keep your vehicle in perfect condition.</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={() => navigation.navigate('CartScreen')}
          >
            <LottieView
              source={require('../../../assets/animations/shopping-bag.json')}
              autoPlay
              loop
              style={{ width: 45, height: 45, tintColor: '#FFFFFF' }}
              colorFilters={[{ keypath: '**', color: '#FFFFFF' }]}
            />
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={currentPlaceholder || "Search services..."}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Vehicle Selector */}
        {!isSearching && (
          <>
            <Text style={styles.sectionHeading}>Select Your Vehicle</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.vehicleScroll}
              contentContainerStyle={styles.vehicleScrollContent}
            >
              {categoriesMarketplace.vehicles.map(vehicle => {
                const isActive = vehicle.id === activeVehicleId;
                const vColor = VEHICLE_COLORS[vehicle.id];
                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleCard, 
                      isActive && { borderColor: vColor, backgroundColor: vColor + '10' }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setActiveVehicleId(vehicle.id)}
                  >
                    {vehicle.id === 'auto' ? (
                      <LottieView
                        source={require('../../../assets/animations/auto_icon.json')}
                        autoPlay
                        loop
                        style={{ width: 55, height: 55, marginBottom: 15 }}
                      />
                    ) : vehicle.id === 'bike' ? (
                      <LottieView
                        source={require('../../../assets/animations/bike_icon.json')}
                        autoPlay
                        loop
                        style={{ width: 250, height: 250, position: 'absolute', top: -80, left: -40 }}
                      />
                    ) : vehicle.id === 'car' ? (
                      <LottieView
                        source={require('../../../assets/animations/car_icon.json')}
                        autoPlay
                        loop
                        style={{ width: 70, height: 70, marginBottom: 15 }}
                      />
                    ) : vehicle.id === 'truck' ? (
                      <LottieView
                        source={require('../../../assets/animations/truck_icon.json')}
                        autoPlay
                        loop
                        style={{ width: 130, height: 130, position: 'absolute', top: -25 }}
                      />
                    ) : (
                      <MaterialCommunityIcons 
                        name={VEHICLE_ICONS[vehicle.id]} 
                        size={36} 
                        color={isActive ? vColor : '#6B7280'}
                        style={{ marginBottom: 15 }} 
                      />
                    )}
                    <Text style={[
                      styles.vehicleLabel, 
                      isActive && { color: vColor }, 
                      { position: 'absolute', bottom: 4 }
                    ]}>
                      {vehicle.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Service Sections */}
        {isSearching ? (
          searchResults.length > 0 ? (
            searchResults.map(result => (
              <View key={result.vehicle.id} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{result.vehicle.label} Services</Text>
                {result.services.map(service => renderServiceCard(service, result.vehicle.id))}
              </View>
            ))
          ) : (
            <View style={styles.emptySearchContainer}>
              <Feather name="search" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Text style={styles.emptySearchTitle}>No results found</Text>
              <Text style={styles.emptySearchText}>We couldn't find any services matching "{searchQuery}"</Text>
            </View>
          )
        ) : (
          <View>
            {activeVehicleId === 'auto' && (
              <View style={styles.autoToggleContainer}>
                <Text style={styles.autoToggleText}>
                  {isEvMode ? 'For EV' : 'For CNG'}
                </Text>
                <Switch 
                  value={isEvMode} 
                  onValueChange={setIsEvMode} 
                  trackColor={{ false: '#3B82F6', true: '#22C55E' }}
                  thumbColor={'#FFFFFF'}
                />
              </View>
            )}
            {activeVehicle.sections
              .filter(section => {
                if (activeVehicleId === 'auto') {
                  return isEvMode ? section.id.includes('_ev_') : section.id.includes('_cng_');
                }
                return true;
              })
              .map((section) => (
                <View key={section.id} style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.services.map(service => renderServiceCard(service, activeVehicleId))}
                </View>
              ))}
          </View>
        )}

        {/* Common Note */}
        {(!isSearching || searchResults.length > 0) && (
          <View style={styles.commonNoteContainer}>
            <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
            <Text style={styles.commonNoteText}>
              Prices shown are starting prices. The final amount may vary depending on your vehicle model, service requirements, and any spare parts needed. Spare parts are charged separately only after customer approval.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
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
    backgroundColor: '#ff5e2c',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ff5e2c',
  },
  badgeText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  sectionHeading: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  vehicleScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  vehicleScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  vehicleCard: {
    width: 100,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vehicleLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  autoToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  autoToggleText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceName: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  reviewsText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
  },
  emptySearchContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySearchText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  commonNoteContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
  },
  commonNoteText: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 10,
    lineHeight: 18,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemsText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 13,
    color: '#9CA3AF',
  },
  cartTotalText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 2,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  viewCartText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginRight: 4,
  }
});
