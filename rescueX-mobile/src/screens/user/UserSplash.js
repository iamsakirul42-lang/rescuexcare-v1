import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { icon: 'account-check', label: 'Creating your account...', color: '#22C55E' },
  { icon: 'shield-check', label: 'Securing your data...', color: '#3B82F6' },
  { icon: 'map-marker-check', label: 'Setting up location...', color: '#F97316' },
  { icon: 'lightning-bolt', label: 'Preparing your dashboard...', color: '#8B5CF6' },
  { icon: 'check-decagram', label: 'All set! Welcome aboard!', color: '#22C55E' },
];

// Animated floating orb with trail effect
const FloatingOrb = ({ delay, startX, size, color, duration }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Vertical float
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Horizontal sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: duration * 0.6,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        bottom: height * 0.08,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: size,
        elevation: 8,
        opacity: anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 0.7, 0.7, 0],
        }),
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -height * 0.55],
            }),
          },
          {
            translateX: sway.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-25, 0, 25],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0.3, 1.3, 1.1, 0.2],
            }),
          },
        ],
      }}
    />
  );
};

// Spinning ring component
const SpinningRing = ({ size, color, duration, clockwise }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: clockwise ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: color + '40',
        transform: [{ rotate }],
        opacity: 0.4,
      }}
    />
  );
};

export default function UserSplash({ navigation, route }) {
  const isLogin = route?.params?.isLogin || false;

  const progress = useRef(new Animated.Value(0)).current;
  const stepAnims = STEPS.map(() => useRef(new Animated.Value(0)).current);
  const stepCheckAnims = STEPS.map(() => useRef(new Animated.Value(0)).current);
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo dramatic entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 30,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Shimmer on progress bar
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const totalDuration = isLogin ? 3000 : 9500;

    // Progress bar
    Animated.timing(progress, {
      toValue: 100,
      duration: totalDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    if (!isLogin) {
      // Staggered step animations for Signup (10s flow)
      const stepDelay = 9500 / STEPS.length;
      STEPS.forEach((_, i) => {
        setTimeout(() => {
          Animated.spring(stepAnims[i], {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }).start();

          if (i > 0) {
            Animated.spring(stepCheckAnims[i - 1], {
              toValue: 1,
              friction: 5,
              tension: 60,
              useNativeDriver: true,
            }).start();
          }
        }, i * stepDelay + 500);
      });

      setTimeout(() => {
        Animated.spring(stepCheckAnims[STEPS.length - 1], {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }).start();
      }, 9000);
    }

    // Navigate after duration
    const timer = setTimeout(() => {
      navigation.replace('UserMainTabs');
    }, isLogin ? 3000 : 10000);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, width],
  });

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-5deg'],
  });

  const orbs = [
    { delay: 0, startX: width * 0.05, size: 10, color: '#22C55E', duration: 3500 },
    { delay: 500, startX: width * 0.2, size: 14, color: '#F97316', duration: 4000 },
    { delay: 1000, startX: width * 0.35, size: 8, color: '#3B82F6', duration: 3200 },
    { delay: 300, startX: width * 0.5, size: 12, color: '#22C55E', duration: 3800 },
    { delay: 700, startX: width * 0.65, size: 16, color: '#8B5CF6', duration: 4200 },
    { delay: 200, startX: width * 0.8, size: 9, color: '#F97316', duration: 3600 },
    { delay: 900, startX: width * 0.9, size: 11, color: '#22C55E', duration: 3400 },
  ];

  return (
    <View style={styles.container}>
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}

      <View style={styles.content}>
        <Animated.View
          style={{
            transform: [{ scale: logoScale }, { rotate: logoRotation }],
            opacity: logoOpacity,
            marginBottom: isLogin ? 40 : 10,
          }}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </Animated.View>

        {isLogin ? (
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontFamily: 'Lufga-Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 8 }}>
              Welcome back!
            </Text>
            <Text style={{ fontFamily: 'Lufga-Medium', fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
              Getting your dashboard ready...
            </Text>
          </View>
        ) : (
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.stepRow,
                  {
                    opacity: stepAnims[i],
                    transform: [
                      {
                        translateX: stepAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0],
                        }),
                      },
                      {
                        scale: stepAnims[i].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.05, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.stepIconCircle, { backgroundColor: step.color + '20' }]}>
                  <MaterialCommunityIcons name={step.icon} size={18} color={step.color} />
                </View>
                <Text style={[styles.stepLabel, { color: step.color === '#22C55E' && i === STEPS.length - 1 ? '#22C55E' : '#4B5563' }]}>
                  {step.label}
                </Text>
                <Animated.View
                  style={{
                    marginLeft: 'auto',
                    opacity: stepCheckAnims[i],
                    transform: [
                      {
                        scale: stepCheckAnims[i].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.3, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <MaterialCommunityIcons name="check-circle" size={20} color={step.color} />
                </Animated.View>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
              <View style={styles.progressDot} />
            </Animated.View>
          </View>
        </View>
      </View>

      <Image
        source={require('../../../assets/images/kolkata-art-transparent.png')}
        style={styles.bgIllustration}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 30,
  },
  // Rings
  ringsContainer: {
    position: 'absolute',
    top: height * 0.12,
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2.5,
  },
  logo: {
    height: 180,
    width: width * 0.6,
  },
  // Steps
  stepsContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  stepIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepLabel: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 14,
    flex: 1,
  },
  // Progress
  progressContainer: {
    width: '100%',
    paddingHorizontal: 5,
  },
  progressTrack: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff5e2c',
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 7,
  },
  // Welcome
  welcomeText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 22,
    color: '#22C55E',
    textAlign: 'center',
  },
  // Background illustration
  bgIllustration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.18,
    opacity: 0.15,
    tintColor: '#22C55E',
    zIndex: 0,
  },
});

