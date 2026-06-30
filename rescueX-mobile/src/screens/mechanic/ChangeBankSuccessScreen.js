import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

export default function ChangeBankSuccessScreen({ navigation }) {
  const handleDone = () => {
    // Navigate back to the Profile tab
    navigation.navigate('ExpertMainTabs', { screen: 'Profile' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check" size={60} color="#FFF" />
          </View>
        </View>

        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>
          Thank you for reaching with us, we will update as soon as possible.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleDone}>
          <Text style={styles.btnText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success || '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.success || '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  btn: {
    backgroundColor: theme.colors.expertPrimary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFF',
  },
});
