import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export default function BookingCompletedScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHome = () => {
    navigation.replace('UserMainTabs');
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Animated.View 
            style={[
              styles.iconContainer, 
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LottieView
              source={require('../../../assets/animations/business-target.json')}
              autoPlay
              loop={false}
              style={{ width: 180, height: 180 }}
            />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
            <Text style={styles.title}>Service Completed Successfully</Text>
            <Text style={styles.subtitle}>Thank you for choosing RescueX.</Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', paddingBottom: 40 }}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleHome}>
            <MaterialCommunityIcons name="home" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
});

