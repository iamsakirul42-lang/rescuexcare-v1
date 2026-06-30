import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function DeleteAccountWarningScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningIconContainer}>
          <MaterialCommunityIcons name="alert" size={60} color="#EF4444" />
        </View>

        <Text style={styles.title}>Delete Your RescueX Account</Text>
        
        <View style={styles.card}>
          <Text style={styles.description}>
            Deleting your account will permanently remove your profile, booking history, saved addresses and account information. This action cannot be undone.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('DeleteAccountReason')}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 24,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  description: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
