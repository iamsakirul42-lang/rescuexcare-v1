import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');

const BenefitCard = ({ iconName, text }) => (
  <View style={styles.benefitCard}>
    <View style={styles.benefitIcon}>
      <MaterialCommunityIcons name={iconName} size={18} color="#FFF" />
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentSafeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.lottieHeaderContainer}>
            <LottieView
              source={require('../../../../assets/lottie/wallet.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
          </View>
          
          <Text style={styles.title}>Become an Expert With Us</Text>
          <Text style={styles.subtitle}>Help vehicle owners across Kolkata and earn on your own schedule.</Text>

          <View style={styles.benefitsGrid}>
            <BenefitCard iconName="clock-outline" text="Flexible Working Hours" />
            <BenefitCard iconName="cash" text="Daily withdraw" />
            <BenefitCard iconName="account-group" text="More Customers" />
            <BenefitCard iconName="calendar-check" text="Simple Booking Management" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalInfo')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  contentSafeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 30,
  },
  lottieHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginBottom: 24,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: (width - 48 - 12) / 2, // 2 columns with 12px gap
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.expertPrimaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.expertPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  benefitText: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.expertPrimary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
    marginRight: 8,
  },
});
