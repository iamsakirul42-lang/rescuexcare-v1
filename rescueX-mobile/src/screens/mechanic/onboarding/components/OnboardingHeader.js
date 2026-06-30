import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../theme';

export default function OnboardingHeader({ title, subtitle, step, totalSteps, onBack }) {
  const insets = useSafeAreaInsets();
  
  // Start the animation from the previous step's width
  const previousStep = Math.max(step - 1, 0);
  const animatedWidth = useRef(new Animated.Value((previousStep / totalSteps) * 100)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: (step / totalSteps) * 100,
      duration: 600,
      useNativeDriver: false, // width doesn't support native driver
    }).start();
  }, [step]);

  return (
    <LinearGradient 
      colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: Math.max(insets.top, 24) + 16 }]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressFill, { width: animatedWidth.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%']
        }) }]}>
          <View style={styles.progressDot} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  stepText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 30,
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});
