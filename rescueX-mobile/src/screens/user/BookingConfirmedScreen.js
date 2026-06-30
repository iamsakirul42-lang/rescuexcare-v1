import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { useBooking } from '../../data/bookingStore';

const { width, height } = Dimensions.get('window');

const ConfirmedIconSVG = () => (
  <Svg width="100" height="100" viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="36.5" fill="#efffd1" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M81.491,93.597 c-6.788-2.976-12.893-5.872-20.303-6.696" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M92.385,57.639 c-8.372-3.234-17.203-8.416-20.831-16.472c-3.235-7.184-10.851-4.351-10.373,2.417c0.453,6.398,4.335,8.074,3.22,15.867 c-0.692,4.833,1.881,11.647,9.074,13.105" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M63.715,53.198 c0,0-13.099-0.715-18.743,5.484c-5.596,6.147-1.915,15.079,10.244,13.762c9.186-0.995,8.116-9.878,1.097-10.289 c-2.995-0.175-3.874,0.052-5.633,0.506" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M46.256,71.087 c-1.463,1.722-2.115,7.46,4.042,9.078c3.142,0.825,6.9,0.606,9.523-0.78c3.809-2.013,4.043-7.11,0.322-8.807" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M49.165,79.894 c-2.411,1.561-2.218,7.386,2.466,8.744c3.042,0.883,5.756,0.495,8.052-0.786c3.33-1.857,3.544-6.899,0.345-8.454" />
    <Path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M45.269,70.456	C43.874,70.65,42.448,70.75,41,70.75c-16.983,0-30.75-13.767-30.75-30.75S24.017,9.25,41,9.25S71.75,23.017,71.75,40	c0,0.532-0.014,1.061-0.04,1.586" />
    <Polyline fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="25.25,42.25 38.75,52.75 56.75,28.75" />
  </Svg>
);

// Floating orb
const FloatingOrb = ({ delay, startX, size, color, duration }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
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
        bottom: height * 0.1,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: size,
        elevation: 6,
        opacity: anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 0.6, 0.6, 0],
        }),
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -height * 0.5],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 1.2, 0.3],
            }),
          },
        ],
      }}
    />
  );
};

export default function BookingConfirmedScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { activeBooking } = useBooking();

  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const waitingFade = useRef(new Animated.Value(0)).current;
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check icon bounces in
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Title fades in
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(titleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Subtitle fades in
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(subtitleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Waiting text fades in
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(waitingFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Dots animation
    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    });

    // Shimmer
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Navigate to status screen after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('BookingStatus', { bookingId });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const orbs = [
    { delay: 0, startX: width * 0.1, size: 10, color: '#22C55E', duration: 3500 },
    { delay: 400, startX: width * 0.3, size: 14, color: '#F97316', duration: 4000 },
    { delay: 800, startX: width * 0.55, size: 8, color: '#3B82F6', duration: 3200 },
    { delay: 200, startX: width * 0.75, size: 12, color: '#22C55E', duration: 3800 },
    { delay: 600, startX: width * 0.9, size: 9, color: '#8B5CF6', duration: 3600 },
  ];

  return (
    <View style={styles.container}>

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}

      <View style={styles.content}>
        {/* Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkCircle,
            {
              transform: [{ scale: checkScale }],
              opacity: checkOpacity,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            },
          ]}
        >
          <ConfirmedIconSVG />
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: titleFade }]}>
          Booking Confirmed
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
          Please wait...
        </Animated.Text>

        {/* Waiting message */}
        <Animated.View style={[styles.waitingCard, { opacity: waitingFade }]}>
          <Animated.View
            style={[styles.shimmerOverlay, { transform: [{ translateX: shimmerTranslate }] }]}
          />
          <MaterialCommunityIcons name="account-search" size={28} color="#F97316" />
          <Text style={styles.waitingText}>
            RescueX Team is assigning an expert.
          </Text>
          <View style={styles.dotsRow}>
            {dotAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: anim,
                    transform: [{ scale: Animated.add(0.5, Animated.multiply(anim, 0.5)) }],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Booking ID */}
        <Animated.Text style={[styles.bookingId, { opacity: waitingFade }]}>
          Booking ID: {bookingId}
        </Animated.Text>
      </View>

      {/* Bottom illustration */}
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
  // Checkmark
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  checkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text
  title: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
  },
  // Waiting Card
  waitingCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    gap: 12,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  waitingText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },
  bookingId: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 20,
  },
  // Background
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

