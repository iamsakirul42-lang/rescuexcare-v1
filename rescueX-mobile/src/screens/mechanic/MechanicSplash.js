import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { theme } from '../../theme';
import HeroBackground from '../../components/HeroBackground';

export default function MechanicSplash({ navigation }) {
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      // When animation finishes, go straight to the expert dashboard
      navigation.replace('ExpertMainTabs');
    });
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {/* Orange Hero Background for Expert */}
      <HeroBackground variant="orange" heightPercent={0.35} />

      <View style={styles.content}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>MECHANIC PARTNER</Text>
        </View>
        
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.loaderFill, { width }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    height: 350,
    width: '100%',
  },
  badge: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accentLight,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.pill,
  },
  badgeText: {
    ...theme.typography.small,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  loaderContainer: {
    width: 140,
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginTop: 40,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
  }
});
