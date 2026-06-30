import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';

export default function PersonalInfoScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [data, setData] = useState(onboardingData.personal);

  const isValid = data.fullName.length > 2 && data.mobile.length === 10 && data.email.includes('@') && data.dob.length > 5;

  const handleNext = () => {
    updateData('personal', data);
    navigation.navigate('Address');
  };

  const handleDobChange = (text) => {
    // Allow deleting characters naturally
    if (data.dob.length > text.length) {
      setData({ ...data, dob: text });
      return;
    }

    const cleaned = text.replace(/\D/g, '');
    let day = cleaned.substring(0, 2);
    let month = cleaned.substring(2, 4);
    let year = cleaned.substring(4, 8);

    if (day.length === 2) {
      if (parseInt(day) > 31) day = '31';
      if (parseInt(day) < 1) day = '01'; // Prevent 00
    }
    if (month.length === 2) {
      if (parseInt(month) > 12) month = '12';
      if (parseInt(month) < 1) month = '01'; // Prevent 00
    }
    if (year.length === 4) {
      if (parseInt(year) > 2026) year = '2026';
      if (parseInt(year) < 1990) year = '1990';
    }

    let formatted = day;
    if (cleaned.length >= 2 && text.endsWith('-')) {
      formatted += '-'; // Handle explicit typing of '-'
    }
    if (cleaned.length > 2) {
      formatted = day + '-' + month;
    }
    if (cleaned.length > 4) {
      formatted = day + '-' + month + '-' + year;
    }

    setData({ ...data, dob: formatted });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <OnboardingHeader 
          title="Personal Information" 
          subtitle="Tell us about yourself to get started."
          step={1} 
          totalSteps={9} 
          onBack={() => navigation.goBack()} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={data.fullName}
            onChangeText={(text) => setData({ ...data, fullName: text })}
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={data.mobile}
            onChangeText={(text) => setData({ ...data, mobile: text })}
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={data.email}
            onChangeText={(text) => setData({ ...data, email: text })}
          />

          <Text style={styles.label}>Date of Birth *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD-MM-YYYY"
            keyboardType="number-pad"
            maxLength={10}
            value={data.dob}
            onChangeText={handleDobChange}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btn, !isValid && styles.btnDisabled]} 
            disabled={!isValid}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  keyboardView: { flex: 1 },
  content: { padding: 24 },
  label: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  btn: {
    backgroundColor: theme.colors.expertPrimary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: theme.colors.border },
  btnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
