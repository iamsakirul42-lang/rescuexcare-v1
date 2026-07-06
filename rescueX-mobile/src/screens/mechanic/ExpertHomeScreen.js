import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertContext } from '../../data/ExpertContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { useBooking } from '../../data/bookingStore';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const TypewriterText = ({ text, style, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let typingInterval;
    let pauseTimeout;

    const startTyping = () => {
      let i = 0;
      setDisplayedText('');
      
      typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          // Wait 60 seconds, then restart the typing animation
          pauseTimeout = setTimeout(() => {
            startTyping();
          }, 60000);
        }
      }, speed);
    };

    if (text) {
      startTyping();
    }

    return () => {
      clearInterval(typingInterval);
      clearTimeout(pauseTimeout);
    };
  }, [text, speed]);

  return <Text style={style}>{displayedText}</Text>;
};

export default function ExpertHomeScreen() {
  const { isOnline } = useContext(ExpertContext);
  const { bookings } = useBooking();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [mechanicName, setMechanicName] = useState('');
  const [greeting, setGreeting] = useState(getGreeting());
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  const activeJob = bookings?.find(b => ['expert_assigned', 'service_in_progress', 'pending_completion_verification'].includes(b.status));

  useEffect(() => {
    if (isOnline && activeJob) {
      navigation.navigate('ExpertActiveJobScreen', { bookingId: activeJob.id });
    }
  }, [activeJob?.id, isOnline]);

  useEffect(() => {
    let timeout;
    if (isOnline) {
      Animated.loop(
        Animated.timing(pulse1, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ).start();

      timeout = setTimeout(() => {
        Animated.loop(
          Animated.timing(pulse2, {
            toValue: 1,
            duration: 2500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        ).start();
      }, 1250);
    } else {
      pulse1.setValue(0);
      pulse2.setValue(0);
      pulse1.stopAnimation();
      pulse2.stopAnimation();
    }
    return () => clearTimeout(timeout);
  }, [isOnline]);

  const createPulseStyle = (anim) => ({
    transform: [{
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 2.5]
      })
    }],
    opacity: anim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0.8, 0.2, 0]
    })
  });

  useEffect(() => {
    const fetchName = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase
          .from('mechanics')
          .select('name')
          .eq('id', authData.user.id)
          .single();
        if (data?.name) {
          // Get first name only if there are spaces
          const firstName = data.name.split(' ')[0];
          setMechanicName(firstName);
        }
      }
    };
    fetchName();

    // Update greeting every minute just in case they leave the app open
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fullGreetingText = `${greeting}${mechanicName ? `, ${mechanicName}` : ''}`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <View style={styles.headerTextContainer}>
          <View style={{ height: 32, justifyContent: 'center' }}>
            {/* Using a fixed height container to prevent layout shifting during typewriter animation */}
            <TypewriterText text={fullGreetingText} style={styles.greeting} />
          </View>
          <Text style={styles.statusText}>{isOnline ? 'You are online' : 'You are offline'}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isOnline && (
            <>
              <Animated.View style={[styles.pulseCircle, createPulseStyle(pulse1)]} />
              <Animated.View style={[styles.pulseCircle, createPulseStyle(pulse2)]} />
            </>
          )}
          <MaterialCommunityIcons 
            name={isOnline ? "map-marker" : "sleep"} 
            size={80} 
            color={isOnline ? "#FFD700" : theme.colors.border} 
            style={styles.centerIcon}
          />
        </View>
        <View style={styles.textContainer}>
          {isOnline ? (
            activeJob ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.message, { color: '#22C55E' }]}>You have an active assigned job!</Text>
                <TouchableOpacity 
                  style={{ backgroundColor: theme.colors.expertPrimary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 }}
                  onPress={() => navigation.navigate('ExpertActiveJobScreen', { bookingId: activeJob.id })}
                >
                  <Text style={{ fontFamily: 'Lufga-Bold', color: '#FFF', fontSize: 16 }}>View Active Job</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TypewriterText 
                text={`Waiting for service requests.......\n\nআপনার জন্য নতুন সেবা অনুরোধ খোঁজা হচ্ছে...\n\nকাছাকাছি কোনো গ্রাহক সেবা বুক করলেই আমরা আপনাকে সঙ্গে সঙ্গে জানিয়ে দেব। অনলাইনে থাকুন, নিরাপদে কাজ করুন এবং প্রতিদিন আরও বেশি আয় করুন।`} 
                style={styles.message} 
                speed={50}
              />
            )
          ) : (
            <Text style={styles.message}>Go online to start receiving jobs.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    alignItems: 'center',
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
  headerTextContainer: {
    alignItems: 'center',
  },
  greeting: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF', textAlign: 'center' },
  statusText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    minHeight: 120, // Prevents layout shifting when text spans multiple lines
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  centerIcon: {
    zIndex: 2,
    marginTop: -10, // Adjust optical center of map-marker
  },
  message: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
