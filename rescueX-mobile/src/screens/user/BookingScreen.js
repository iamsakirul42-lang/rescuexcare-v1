import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBooking } from '../../data/bookingStore';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

// Vehicle config
const VEHICLE_CONFIG = {
  auto: { title: 'Auto', image: require('../../../assets/images/Auto.png'), color: '#F97316' },
  bike: { title: 'Bike', image: require('../../../assets/images/Bike.png'), color: '#22C55E' },
  car: { title: 'Car', image: require('../../../assets/images/Car.png'), color: '#3B82F6' },
  truck: { title: 'Truck', image: require('../../../assets/images/Truck.png'), color: '#8B5CF6' },
};

// Problems list
const PROBLEMS = [
  { id: 'flat_tyre', label: 'Flat Tyre', icon: 'tire' },
  { id: 'battery_dead', label: 'Battery Dead', icon: 'battery-alert' },
  { id: 'fuel_empty', label: 'Fuel Empty', icon: 'fuel' },
  { id: 'engine_failure', label: 'Engine Failure', icon: 'engine-off' },
  { id: 'tow_service', label: 'Tow Service', icon: 'tow-truck' },
  { id: 'accident', label: 'Accident', icon: 'car-emergency' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal-circle' },
];

// Step Progress Bar
const StepIndicator = ({ currentStep, totalSteps, accentColor }) => (
  <View style={styles.stepIndicatorContainer}>
    {Array.from({ length: totalSteps }, (_, i) => (
      <View key={i} style={styles.stepDotRow}>
        <View
          style={[
            styles.stepDot,
            {
              backgroundColor: i <= currentStep ? accentColor : 'rgba(0,0,0,0.08)',
              width: i === currentStep ? 28 : 10,
            },
          ]}
        />
      </View>
    ))}
  </View>
);

// Problem Card
const ProblemCard = ({ problem, isSelected, onPress, accentColor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '48%', marginBottom: 12 }}>
      <TouchableOpacity
        style={[
          styles.problemCard,
          isSelected && { borderColor: accentColor, backgroundColor: accentColor + '12' },
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={[styles.problemIconBox, isSelected && { backgroundColor: accentColor + '20' }]}>
          <MaterialCommunityIcons
            name={problem.icon}
            size={24}
            color={isSelected ? accentColor : '#6B7280'}
          />
        </View>
        <Text style={[styles.problemLabel, isSelected && { color: accentColor }]}>
          {problem.label}
        </Text>
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
            <MaterialCommunityIcons name="check" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


export default function BookingScreen({ navigation, route }) {
  const { vehicleType, location } = route.params;
  const config = VEHICLE_CONFIG[vehicleType] || VEHICLE_CONFIG.car;
  const { createBooking } = useBooking();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        const stored = await AsyncStorage.getItem(`user_addresses_${userId}`);
        if (stored) {
          setSavedAddresses(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const animateStep = (nextStep) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  const canProceed = () => {
    if (step === 0) return selectedProblem !== null;
    if (step === 1) return address.trim().length > 5;
    if (step === 2) return true; // optional
    if (step === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      animateStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBookNow = async () => {
    const problemObj = PROBLEMS.find((p) => p.id === selectedProblem);
    const booking = await createBooking({
      type: 'instant',
      vehicleType,
      vehicleTitle: config.title,
      problem: problemObj?.label || 'Other',
      problemId: selectedProblem,
      address,
      details,
      paymentMethod: 'cash', // Hardcoded for instant help, will be selectable in categories
    });

    // Save new address if it's not in savedAddresses
    const isSaved = savedAddresses.some(a => a.fullAddress === address.trim());
    if (!isSaved && address.trim().length > 0) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (userId) {
          const finalAddress = {
            id: Date.now().toString(),
            type: 'Other',
            fullAddress: address.trim(),
            landmark: ''
          };
          const updatedAddresses = [...savedAddresses, finalAddress];
          await AsyncStorage.setItem(`user_addresses_${userId}`, JSON.stringify(updatedAddresses));
        }
      } catch (error) {
        console.error('Error saving new address:', error);
      }
    }

    navigation.replace('BookingConfirmed', { bookingId: booking.id });
  };

  const stepTitles = ['Select Problem', 'Service Location', 'Additional Details', 'Booking Summary'];

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.sectionTitle}>What's the problem?</Text>
            <View style={styles.problemGrid}>
              {PROBLEMS.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  isSelected={selectedProblem === problem.id}
                  onPress={() => setSelectedProblem(problem.id)}
                  accentColor={config.color}
                />
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View>
            {/* Premium Location Card */}
            <View style={styles.glassCard}>
              {/* Animation and Title */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <LottieView
                  source={require('../../../assets/animations/delivery-man-calling-customer.json')}
                  autoPlay
                  loop
                  style={{ width: 200, height: 200, marginBottom: 12 }}
                />
                <Text style={[styles.glassCardTitle, { textAlign: 'center', fontSize: 24 }]}>Service Address</Text>
                <Text style={[styles.glassCardSubtitle, { textAlign: 'center', marginBottom: 16 }]}>Where should the expert come?</Text>
              </View>

              {/* Address Input */}
              <View style={[styles.floatingInputContainer, address.length > 0 && { borderColor: config.color + '60' }]}>
                <Text style={[styles.floatingLabel, address.length > 0 && { color: config.color }]}>
                  Complete Address
                </Text>
                <TextInput
                  style={styles.floatingInput}
                  placeholder="22 Park Street, Kolkata - 700016"
                  placeholderTextColor="#C4C4C4"
                  multiline
                  numberOfLines={3}
                  value={address}
                  onChangeText={setAddress}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.helperText}>
                    <MaterialCommunityIcons name="information-outline" size={12} color="#9CA3AF" /> Enter full address with landmark
                  </Text>
                  <Text style={[styles.charCount, address.length > 5 && { color: config.color }]}>
                    {address.length}/200
                  </Text>
                </View>
              </View>
            </View>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Or choose a saved address</Text>
                {savedAddresses.map((addr) => (
                  <TouchableOpacity 
                    key={addr.id} 
                    style={[
                      styles.problemCard, 
                      { 
                        minHeight: 70, 
                        flexDirection: 'row', 
                        justifyContent: 'flex-start', 
                        padding: 16, 
                        marginBottom: 10, 
                        borderColor: address === addr.fullAddress ? config.color : 'rgba(0,0,0,0.08)',
                        backgroundColor: address === addr.fullAddress ? config.color + '10' : 'rgba(255,255,255,0.5)'
                      }
                    ]}
                    onPress={() => setAddress(addr.fullAddress)}
                  >
                    <View style={[styles.problemIconBox, { 
                      marginBottom: 0, 
                      marginRight: 12, 
                      width: 40, 
                      height: 40, 
                      backgroundColor: address === addr.fullAddress ? config.color + '20' : 'rgba(0,0,0,0.04)' 
                    }]}>
                      <MaterialCommunityIcons 
                        name={addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'office-building' : 'map-marker'} 
                        size={20} 
                        color={address === addr.fullAddress ? config.color : '#6B7280'} 
                      />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontFamily: 'Lufga-Bold', fontSize: 14, color: '#1A1A1A' }}>{addr.type || 'Other'}</Text>
                      <Text style={{ fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>{addr.fullAddress}</Text>
                    </View>
                    {address === addr.fullAddress && (
                      <MaterialCommunityIcons name="check-circle" size={20} color={config.color} style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Tips */}
            <View style={[styles.tipsCard, { marginTop: savedAddresses.length > 0 ? 12 : 0 }]}>
              <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#F97316" />
              <Text style={styles.tipsText}>Include building name, floor, and nearby landmark for faster service</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            {/* Premium Details Card */}
            <View style={styles.glassCard}>
              <View style={styles.glassCardHeader}>
                <View style={[styles.glassIconCircle, { backgroundColor: 'transparent' }]}>
                  <MaterialCommunityIcons name="file-document-edit-outline" size={28} color={config.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.glassCardTitle}>Additional Details</Text>
                  <Text style={styles.glassCardSubtitle}>Help us understand your situation better</Text>
                </View>
              </View>

              <View style={[styles.floatingInputContainer, details.length > 0 && { borderColor: config.color + '60' }]}>
                <Text style={[styles.floatingLabel, details.length > 0 && { color: config.color }]}>
                  Describe the issue (Optional)
                </Text>
                <TextInput
                  style={styles.floatingInput}
                  placeholder="My car suddenly stopped and won't start..."
                  placeholderTextColor="#C4C4C4"
                  multiline
                  numberOfLines={3}
                  value={details}
                  onChangeText={setDetails}
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.helperText}>
                    <MaterialCommunityIcons name="information-outline" size={12} color="#9CA3AF" /> Optional but helps the expert prepare
                  </Text>
                  <Text style={[styles.charCount, details.length > 0 && { color: config.color }]}>
                    {details.length}/300
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 3:
        const problemObj = PROBLEMS.find((p) => p.id === selectedProblem);
        return (
          <View>
            <Text style={styles.sectionTitle}>Booking Summary</Text>

            {/* Vehicle */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <MaterialCommunityIcons name="car" size={20} color={config.color} />
                  <Text style={styles.summaryLabel}>Vehicle</Text>
                </View>
                <Text style={styles.summaryValue}>{config.title}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={config.color} />
                  <Text style={styles.summaryLabel}>Problem</Text>
                </View>
                <Text style={styles.summaryValue}>{problemObj?.label}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={config.color} />
                  <Text style={styles.summaryLabel}>Address</Text>
                </View>
                <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                  {address}
                </Text>
              </View>

              {details ? (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelRow}>
                      <MaterialCommunityIcons name="text" size={20} color={config.color} />
                      <Text style={styles.summaryLabel}>Details</Text>
                    </View>
                    <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                      {details}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.mainContainer}>

      {/* Header */}
      <LinearGradient
        colors={['#ff5e2c', '#e84f21', '#c73e16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBar, { paddingTop: Math.max(insets.top, 20) + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
          <Text style={styles.headerStep}>Step {step + 1} of 4</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} totalSteps={4} accentColor={config.color} />

      {/* Vehicle Banner */}
      <View style={[styles.vehicleBanner, { borderColor: config.color + '30' }]}>
        <Image
          source={config.image}
          style={styles.vehicleImage}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
        <Text style={[styles.vehicleBannerTitle, { color: config.color }]}>{config.title} Rescue</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            }}
          >
            {renderStep()}
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: canProceed() ? config.color : '#D1D5DB' },
            ]}
            onPress={handleNext}
            activeOpacity={canProceed() ? 0.8 : 1}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {step === 2 ? (details.trim() ? 'Continue' : 'Skip') : 'Continue'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: config.color }]}
            onPress={handleBookNow}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Book Now</Text>
            <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#ff5e2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerStep: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 10,
  },
  stepDotRow: {
    alignItems: 'center',
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  vehicleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    zIndex: 10,
  },
  vehicleImage: {
    width: 60,
    height: 45,
  },
  vehicleBannerTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 18,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    zIndex: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  problemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  problemCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  problemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  glassCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  glassIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCardTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  glassCardSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#6B7280',
  },
  floatingInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  floatingLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  floatingInput: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 80,
    padding: 0,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    paddingTop: 12,
  },
  helperText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
  charCount: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 10,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  tipsText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#F97316',
    flex: 1,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#1A1A1A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 8,
  },
  paymentText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#6B7280',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    zIndex: 10,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
