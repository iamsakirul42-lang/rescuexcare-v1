import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * HeroBackground - Premium gradient hero header component
 * @param {string} variant - 'orange' (default/expert), 'green' (user)
 * @param {number} heightPercent - How much of the screen the hero covers (default 0.35)
 */
export default function HeroBackground({ variant = 'orange', heightPercent = 0.35 }) {
  const colors = variant === 'green'
    ? {
        gradient: ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#DCFCE7', '#FFF6E5'],
        fadeMid: 'rgba(255,246,229,0.4)',
      }
    : {
        gradient: ['#FF6A00', '#FF8C33', '#FFB366', '#FFD6A3', '#FFF0D6', '#FFF6E5'],
        fadeMid: 'rgba(255,246,229,0.4)',
      };

  const heroHeight = height * (heightPercent + 0.07); // Extra bleed for smooth fade

  return (
    <>
      {/* Layer 1: Main vertical gradient */}
      <LinearGradient
        colors={colors.gradient}
        locations={[0, 0.15, 0.30, 0.50, 0.72, 1.0]}
        style={[styles.heroGradient, { height: heroHeight }]}
      />

      {/* Layer 2: Bottom fade mask for extra smooth blend */}
      <LinearGradient
        colors={['transparent', colors.fadeMid, '#FFF6E5']}
        locations={[0, 0.5, 1.0]}
        style={[styles.bottomFadeMask, { top: height * (heightPercent - 0.07) }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  bottomFadeMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.14,
    zIndex: 2,
  },
});
