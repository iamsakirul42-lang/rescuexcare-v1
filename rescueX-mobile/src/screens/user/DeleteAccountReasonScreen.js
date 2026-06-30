import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const REASONS = [
  "I no longer use RescueX.",
  "I found another service.",
  "I have privacy concerns.",
  "The app is difficult to use.",
  "Service was unavailable in my area.",
  "I experienced technical problems.",
  "Poor customer experience.",
  "Other"
];

export default function DeleteAccountReasonScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');

  const handleContinue = () => {
    if (!selectedReason) return;
    
    // Pass selected reason to next screen
    navigation.navigate('DeleteAccountConfirm', {
      reason: selectedReason,
      customReason: selectedReason === 'Other' ? customReason : null
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Reason</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.promptText}>Please tell us why you are leaving.</Text>
          
          <View style={styles.reasonsContainer}>
            {REASONS.map((reason, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.reasonItem, selectedReason === reason && styles.reasonItemSelected]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, selectedReason === reason && styles.radioSelected]}>
                  {selectedReason === reason && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedReason === 'Other' && (
            <View style={styles.customReasonContainer}>
              <Text style={styles.customReasonLabel}>Tell us more (Optional)</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholder="Share your experience with us..."
                placeholderTextColor="#9CA3AF"
                value={customReason}
                onChangeText={setCustomReason}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{customReason.length}/300</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedReason && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedReason}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  promptText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 20,
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  reasonItemSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  reasonText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#4B5563',
  },
  reasonTextSelected: {
    color: '#EF4444',
  },
  customReasonContainer: {
    marginTop: 8,
  },
  customReasonLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  textInput: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  charCount: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  continueText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
