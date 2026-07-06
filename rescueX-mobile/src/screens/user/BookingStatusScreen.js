import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { supabase } from '../../lib/supabase';
import { useBooking } from '../../data/bookingStore';

const { width } = Dimensions.get('window');

// Status list for logical ordering
const STATUS_FLOW = [
  'waiting_assignment',
  'expert_assigned',
  'expert_on_way',
  'expert_arrived',
  'start_verification',
  'service_started',
  'complete_verification',
  'service_completed'
];



// Radar Animation for Finding Expert Screen
const RadarAnimation = React.memo(() => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeouts = [];

    const startPulse = (anim, delay) => {
      const timeoutId = setTimeout(() => {
        anim.setValue(0);
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ).start();
      }, delay);
      timeouts.push(timeoutId);
    };

    startPulse(pulse1, 0);
    startPulse(pulse2, 1000);
    startPulse(pulse3, 2000);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const createRingStyle = (anim) => ({
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3D2B3', // Beige/orange tint from reference
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.3, 0],
    }),
    transform: [{
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 4], // Scales up to 400px
      })
    }],
  });

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={createRingStyle(pulse1)} />
      <Animated.View style={createRingStyle(pulse2)} />
      <Animated.View style={createRingStyle(pulse3)} />
      {/* Center Dot */}
      <View style={{
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
        justifyContent: 'center', alignItems: 'center', zIndex: 10
      }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFF' }} />
      </View>
      {/* Shadow below dot */}
      <View style={{ width: 24, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)', position: 'absolute', bottom: -20, zIndex: 9 }} />
    </View>
  );
});

const TypewriterText = React.memo(({ text, style, delay = 0, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let timeout;
    
    const startTyping = () => {
      timeout = setInterval(() => {
        setDisplayedText((prev) => {
          if (prev.length < text.length) {
            return text.substring(0, prev.length + 1);
          } else {
            clearInterval(timeout);
            return prev;
          }
        });
      }, speed);
    };

    if (delay > 0) {
      setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => clearInterval(timeout);
  }, [text, delay, speed]);

  return <Text style={style}>{displayedText}</Text>;
});

export default function BookingStatusScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { bookings, updateBookingStatus, generateCode } = useBooking();
  
  const booking = bookings.find(b => b.id === bookingId);
  const status = booking?.status || 'waiting_assignment';

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [timer, setTimer] = useState(0);

  // New states for Instant Booking Timeout
  const [instantSearchTimer, setInstantSearchTimer] = useState(120);
  const [showSorryScreen, setShowSorryScreen] = useState(false);
  const [sorryTimer, setSorryTimer] = useState(120);

  // Fallback Polling (Bypasses Realtime RLS Replica Identity issue)
  useEffect(() => {
    let pollInterval;
    if (status === 'waiting_assignment' || status === 'pending') {
      pollInterval = setInterval(async () => {
        try {
          const { data } = await supabase
            .from('bookings')
            .select('status, expert_id')
            .eq('id', bookingId)
            .neq('notes', Date.now().toString()) // Cache buster for React Native (using text column)
            .single();
            
          if (data && data.status === 'cancelled') {
            clearInterval(pollInterval);
            updateBookingStatus(bookingId, 'cancelled');
          } else if (data && data.status === 'expert_assigned') {
            clearInterval(pollInterval);
            
            let expertData = null;
            if (data.expert_id) {
              const { data: mechanic } = await supabase
                .from('mechanics')
                .select('*')
                .eq('id', data.expert_id)
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
            updateBookingStatus(bookingId, data.status, expertData ? { expert: expertData } : {});
          }
        } catch (err) {
          console.log('Polling error:', err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [status, bookingId]);

  // Timer for Instant Booking Timeout
  useEffect(() => {
    let interval;
    if ((status === 'waiting_assignment' || status === 'pending') && booking?.type === 'instant' && !showSorryScreen) {
      interval = setInterval(() => {
        setInstantSearchTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowSorryScreen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, booking?.type, showSorryScreen]);

  // Timer for Sorry Screen Redirect
  useEffect(() => {
    let interval;
    if (showSorryScreen) {
      interval = setInterval(() => {
        setSorryTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigation.replace('UserMainTabs', { screen: 'History' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSorryScreen]);
  
  // Timer for service_in_progress
  useEffect(() => {
    let interval;
    if (status === 'service_in_progress' || status === 'pending_completion_verification') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Automatic redirect to Booking Details on completion
  useEffect(() => {
    if (status === 'booking_completed') {
      // Delay slightly for smooth transition
      setTimeout(() => {
        navigation.replace('UserBookingDetailsScreen', { booking });
      }, 500);
    }
  }, [status, booking?.id]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  // --- Manual Actions (For demoing the verification codes) ---
  
  const handleMeetExpert = () => {
    const code = generateCode();
    animateTransition(() => updateBookingStatus(bookingId, 'start_verification', { startCode: code }));
  };

  const handleStartService = () => {
    animateTransition(() => updateBookingStatus(bookingId, 'service_started'));
  };

  const handleCompleteService = () => {
    const code = generateCode();
    animateTransition(() => updateBookingStatus(bookingId, 'complete_verification', { completionCode: code }));
  };

  const handleConfirmCompletion = () => {
    animateTransition(() => {
      updateBookingStatus(bookingId, 'service_completed');
      navigation.replace('Rating', { bookingId });
    });
  };

  const handleCall = () => {
    if (booking?.expert?.phone) {
      Linking.openURL(`tel:${booking.expert.phone}`);
    }
  };

  // --- Render Status Content ---
  const renderContent = () => {
    switch (status) {
      case 'in_progress':
      case 'start_verification':
        const codeToDisplay = booking?.startCode || '4928'; // Fallback code if not generated

        return (
          <View style={{ flex: 1, alignItems: 'center', width: '100%', paddingBottom: 40 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <LottieView
                source={require('../../../assets/animations/man-waiving-hand.json')}
                autoPlay
                loop
                style={{ width: 250, height: 250 }}
              />
            </View>

            {/* Middle: OTP Sharing Screen */}
            <View style={{ width: '100%', alignItems: 'center', marginVertical: 20 }}>
              <Text style={styles.statusTitle}>Start Verification</Text>
              <Text style={styles.statusSubtitle}>Please share this code with the expert to begin the service.</Text>
              <View style={[styles.codeContainer, { marginVertical: 12, width: '100%', alignItems: 'center' }]}>
                <Text style={styles.codeText}>{codeToDisplay}</Text>
              </View>
            </View>
            
            {/* Bottom: Expert Waiting & Button */}
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={[styles.statusTitle, { textAlign: 'center' }]}>Your expert is waiting at your location.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleStartService}>
                <Text style={styles.primaryButtonText}>Verify & Start Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'service_in_progress':
        return (
          <View style={{ flex: 1, alignItems: 'center', width: '100%', paddingBottom: 40 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <LottieView
                source={require('../../../assets/animations/Electrical Electrician Working.json')}
                autoPlay
                loop
                style={{ width: 250, height: 250 }}
              />
            </View>
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={[styles.codeContainer, { width: '100%', alignItems: 'center', backgroundColor: 'transparent', marginVertical: 0, paddingVertical: 20 }]}>
                <Text style={styles.statusTitle}>Service Started</Text>
                <Text style={[styles.timerText, { marginVertical: 0, fontSize: 32 }]}>{formatTime(timer)}</Text>
                <Text style={[styles.statusSubtitle, { marginBottom: 12, fontSize: 13 }]}>The expert is fixing your vehicle.</Text>
              </View>
            </View>
          </View>
        );

      case 'pending_completion_verification':
        const completionCode = booking?.completionCode || '8392'; // fallback code
        return (
          <View style={{ flex: 1, alignItems: 'center', width: '100%', paddingBottom: 40 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <LottieView
                source={require('../../../assets/animations/Electrical Electrician Working.json')}
                autoPlay
                loop
                style={{ width: 250, height: 250 }}
              />
            </View>
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={[styles.codeContainer, { width: '100%', alignItems: 'center', backgroundColor: 'transparent', marginVertical: 0, paddingVertical: 20 }]}>
                
                {booking.type === 'instant' && booking.totalAmount > 0 && (
                  <>
                    <Text style={[styles.statusTitle, { fontSize: 18, color: '#F97316' }]}>Final Service Amount</Text>
                    <Text style={[styles.timerText, { marginVertical: 4, fontSize: 32, color: '#1A1A1A' }]}>₹{booking.totalAmount}</Text>
                    <View style={{ width: '80%', height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 12 }} />
                  </>
                )}

                <Text style={[styles.statusTitle, { fontSize: 18 }]}>Complete Verification</Text>
                <Text style={[styles.statusSubtitle, { marginTop: 4, marginBottom: 8, fontSize: 13 }]}>Share this code with the expert.</Text>
                <View style={{ marginVertical: 4 }}>
                  <Text style={[styles.codeText, { fontSize: 32 }]}>{completionCode}</Text>
                </View>
                
                {/* Mock button is hidden in real usage, handled by Expert */}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!booking) return null;

  if (status === 'cancelled') {
    return (
      <View style={styles.findingContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <MaterialCommunityIcons name="close-circle-outline" size={80} color="#ff5e2c" style={{ marginBottom: 20 }} />
          
          <Text style={[styles.findingTitle, { textAlign: 'center', fontSize: 24 }]}>
            Request Cancelled
          </Text>
          
          <Text style={[styles.findingSubtitle, { textAlign: 'center', fontSize: 16, marginTop: 8, lineHeight: 24, minHeight: 75 }]}>
            Your request update cancelled.
          </Text>
          
          <TouchableOpacity style={[styles.primaryButton, { marginTop: 20, paddingHorizontal: 40, width: '100%' }]} onPress={() => navigation.replace('UserMainTabs', { screen: 'History' })}>
            <Text style={styles.primaryButtonText}>Go to History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Custom Full Screen Layout for Finding Expert
  if (status === 'waiting_assignment' || status === 'pending') {
    if (showSorryScreen) {
      return (
        <View style={styles.findingContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={80} color="#ff5e2c" style={{ marginBottom: 20 }} />
            
            <Text style={[styles.findingTitle, { textAlign: 'center', fontSize: 24 }]}>
              We are sorry!
            </Text>
            
            <Text style={[styles.findingSubtitle, { textAlign: 'center', fontSize: 16, marginTop: 8, lineHeight: 24, minHeight: 75 }]}>
              All our experts are currently busy. Kindly wait, we will find the best expert for you shortly.
            </Text>
            
            <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center', minHeight: 24 }}>
              <TypewriterText 
                text="Redirecting in " 
                style={{ fontFamily: 'Lufga-Bold', fontSize: 15, color: '#9CA3AF' }} 
                delay={500}
                speed={25}
              />
              {sorryTimer <= 119 && (
                <Text style={{ fontFamily: 'Lufga-Bold', fontSize: 15, color: '#ff5e2c' }}>
                  {formatTime(sorryTimer)}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.findingContainer}>
        <View style={styles.radarContainer}>
          <RadarAnimation />
        </View>

        <View style={styles.bottomSheet}>
          <Text style={styles.findingTitle}>Finding nearby expert...</Text>
          <Text style={styles.findingSubtitle}>This may take a few moments</Text>
          
          {booking?.type === 'instant' && (
            <View style={{ backgroundColor: '#ff5e2c15', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Lufga-Bold', fontSize: 20, color: '#ff5e2c' }}>
                {formatTime(instantSearchTimer)}
              </Text>
            </View>
          )}

          {booking?.type !== 'instant' && <View style={styles.findingDivider} />}
          
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  // Custom Full Screen Layout for Map & Expert Details
  if (status === 'expert_assigned' || status === 'expert_on_way') {
    return (
      <View style={styles.findingContainer}>
        {/* Delivery Animation Area */}
        <View style={styles.mapArea}>
          <LottieView
            source={require('../../../assets/animations/delivery-boy.json')}
            autoPlay
            loop
            style={{ width: width, height: width, resizeMode: 'cover' }}
          />
          {status === 'expert_on_way' && (
            <View style={{ position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: 20 }}>
              <Text style={[styles.statusSubtitle, { marginTop: 20, textAlign: 'center' }]}>
                Your expert is navigating to your location. Keep your phone handy.
              </Text>
            </View>
          )}
        </View>

        {/* Expert Details Bottom Sheet */}
        <View style={styles.bottomSheetMap}>
          <View style={styles.expertHeader}>
            <View style={styles.expertAvatar}>
              <MaterialCommunityIcons name="account-wrench" size={40} color="#22C55E" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.expertName}>{booking?.expert?.name}</Text>
              <Text style={styles.expertRole}>{booking?.expert?.specialization} • {booking?.expert?.experience}</Text>
            </View>
          </View>
          
          <View style={[styles.etaContainer, { width: '100%' }]}>
            <Text style={styles.etaLabel}>{status === 'expert_assigned' ? 'Expert Dispatched' : 'Estimated Arrival'}</Text>
            <Text style={styles.etaValue}>45–60 Minutes</Text>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <MaterialCommunityIcons name="phone" size={24} color="#FFF" />
            <Text style={styles.callButtonText}>Call Expert</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <Text style={styles.headerSubtitle}>ID: {booking.id}</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderContent()}
      </Animated.View>
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
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    padding: 24,
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
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Expert Info
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  expertAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertName: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
  },
  expertRole: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  etaContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  etaLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  etaValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 24,
    color: '#F97316',
  },
  callButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  callButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
  // Animated Route
  routeContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  routeLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  routePoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  animatedCar: {
    position: 'absolute',
    left: 20,
    bottom: 25,
  },
  // Verification Code
  codeContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    marginVertical: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  codeText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 40,
    color: '#1A1A1A',
    letterSpacing: 8,
  },
  // Timer
  timerText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 48,
    color: '#3B82F6',
    marginVertical: 20,
  },
  // Mock Button
  mockButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  mockButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: '#6B7280',
  },
  // Finding Expert Screen
  findingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Offset for bottom sheet
  },
  mapArea: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetMap: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheet: {
    backgroundColor: 'transparent',
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  findingTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  findingSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  findingDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#374151',
  }
});

