import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { theme } from '../../theme';

export default function ExpertWithdrawSuccessScreen({ navigation }) {
  const handleDone = () => {
    // Navigate back to the wallet tab explicitly
    navigation.navigate('ExpertMainTabs', { screen: 'Wallet' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../../assets/lottie/Verified.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>
        <Text style={styles.title}>Withdrawal Request Submitted</Text>
        <Text style={styles.subtitle}>
          Your withdrawal request has been received. The funds will reflect in your registered bank account within 2-3 business days.
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleDone}>
          <Text style={styles.btnText}>Back to Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.expertPrimary,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lottieContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  btn: {
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.expertPrimary,
  },
});
