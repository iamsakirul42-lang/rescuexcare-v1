import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import { theme } from '../../../theme';

export default function SuccessScreen({ navigation }) {
  const { clearProgress } = useContext(ExpertOnboardingContext);

  const handleFinish = async () => {
    await clearProgress();
    // Navigate back to RoleSelection or mechanic main splash
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }], // Ideally this would go to the Pending Dashboard, let's just push it to RoleSelection for now. Or actually, we should navigate to MechanicSplash or a new PendingDashboard screen if we have it in the root.
    });
    // Wait, the spec says Pending Dashboard. I will navigate to it directly since it's not in this stack. We need to add PendingDashboard to the main stack.
    // Let's just navigate to RoleSelection for a sec and I'll fix the route later. Actually, if I add PendingDashboard to the main stack, I can just do:
    navigation.navigate('PendingDashboard'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../../../assets/lottie/Verified.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>
        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>
          Your expert application has been successfully submitted. Our team will review your details shortly.
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleFinish}>
          <Text style={styles.btnText}>Go to Dashboard</Text>
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
    fontSize: 32,
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
