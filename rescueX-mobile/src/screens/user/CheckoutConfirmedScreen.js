import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function CheckoutConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const animationRef = useRef(null);

  useEffect(() => {
    // Re-play animation if needed
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserMainTabs' }],
    });
  };

  const handleTrackBooking = () => {
    // Navigate to History or active booking screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserMainTabs', params: { screen: 'History' } }],
    });
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        
        <View style={styles.animationContainer}>
          {/* A premium checkmark animation */}
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-decagram" size={80} color="#ff5e2c" />
          </View>
        </View>

        <Text style={styles.title}>Booking Confirmed</Text>
        <Text style={styles.subtitle}>Thank you for choosing RescueX.</Text>
        
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Our team is now finding the best expert for your scheduled service.
          </Text>
          <Text style={[styles.messageText, { marginTop: 16 }]}>
            You may safely close the application. We'll notify you as soon as your booking has been assigned.
          </Text>
        </View>

      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackBooking}>
          <Text style={styles.trackButtonText}>Track Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
          <Text style={styles.homeButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  animationContainer: { marginBottom: 32 },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#ff5e2c10',
    justifyContent: 'center', alignItems: 'center'
  },
  title: { fontFamily: 'Lufga-Bold', fontSize: 28, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 16, color: '#6B7280', marginBottom: 32, textAlign: 'center' },
  messageBox: {
    backgroundColor: '#F9FAFB', padding: 20, borderRadius: 16, width: '100%',
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  messageText: {
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#4B5563',
    textAlign: 'center', lineHeight: 22
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30
  },
  trackButton: { backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  trackButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' },
  homeButton: { backgroundColor: '#F3F4F6', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  homeButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#4B5563' }
});
