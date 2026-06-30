import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../theme';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import HeroBackground from '../components/HeroBackground';

const { width, height } = Dimensions.get('window');

const RoleCard = ({ title, subtitle, icon, iconBg, activeColor, activeBgColor, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const arrowColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', activeColor],
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.arrowContainer, { backgroundColor: activeBgColor }]}>
        <Animated.Text style={[styles.arrowText, { transform: [{ translateX }], color: arrowColor }]}>
          ➔
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

export default function RoleSelectionScreen({ navigation }) {
  return (
    <View style={styles.mainContainer}>
      {/* Hero Background */}
      <HeroBackground variant="orange" heightPercent={0.35} />

      {/* Background Illustration (Full width, bottom 35%) */}
      <Image
        source={require('../../assets/images/kolkata-art-transparent.png')}
        style={styles.bgIllustration}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />

      {/* ====== CONTENT ====== */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        </View>

        {/* Campaign Text (Centered perfectly between logo and cards) */}
        <View style={styles.campaignContainer}>
          <Text style={styles.brandingTitleLine1}>You're Never Alone</Text>
          <Text style={styles.brandingTitleLine2}>on the Road.</Text>
          <Text style={styles.brandingSubtitle}>Wherever you stop, we'll come to you.</Text>
        </View>

        {/* Cards Section */}
        <View style={styles.cardsSection}>

          <RoleCard
            title="I need help"
            subtitle="Book roadside assistance now"
            icon={
              <Image 
                source={require('../../assets/images/user-icon.png')} 
                style={styles.cardIconImage} 
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
            }
            iconBg={theme.colors.successLight}
            activeColor={theme.colors.success}
            activeBgColor={theme.colors.successLight}
            onPress={() => navigation.navigate('UserSignup')}
          />

          <RoleCard
            title="I am an Expert"
            subtitle="Partner with us and earn"
            icon={
              <Image 
                source={require('../../assets/images/expert-icon.png')} 
                style={styles.cardIconImage} 
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
            }
            iconBg={theme.colors.accentLight}
            activeColor={theme.colors.accent}
            activeBgColor={theme.colors.accentLight}
            onPress={() => navigation.navigate('ExpertSignup')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF6E5',
  },

  // ====== CONTENT ======
  content: {
    flex: 1,
    zIndex: 3,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.04,
    width: '100%',
  },
  logo: {
    width: width,
    height: 180,
    transform: [{ scale: 1.1 }],
    marginLeft: 0,
    marginBottom: -5, 
  },
  campaignContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -20, // pulls slightly up to perfectly center optically
  },
  brandingTitleLine1: {
    ...theme.typography.h2,
    fontFamily: 'Rockybilly',
    color: theme.colors.accent,
    textAlign: 'center',
    fontSize: 24,
    paddingVertical: 10,
    textShadowColor: 'rgba(249, 115, 22, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandingTitleLine2: {
    ...theme.typography.h2,
    fontFamily: 'Rockybilly',
    color: theme.colors.accent,
    textAlign: 'center',
    fontSize: 24,
    paddingVertical: 10,
    marginTop: -55,
    marginBottom: 0,
    textShadowColor: 'rgba(249, 115, 22, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandingSubtitle: {
    ...theme.typography.bodyBold,
    fontFamily: 'Rockybilly',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 10,
    marginTop: -78,
    letterSpacing: 0,
    marginBottom: 2,
    opacity: 0.9,
  },
  cardsSection: {
    paddingBottom: height * 0.28,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  cardIconImage: {
    width: 32,
    height: 32,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '900',
  },
  bgIllustration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.35,
    opacity: 0.45,
    tintColor: '#FF7A00',
    zIndex: 0,
    transform: [{ scale: 1.15 }],
  },
});

