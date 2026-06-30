import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CheckoutNotesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { address, date, time } = route.params || {};

  const [notes, setNotes] = useState('');

  const handleNext = () => {
    navigation.navigate('CheckoutSummaryScreen', { 
      address, 
      date,
      time,
      notes
    });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Additional Notes</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Any instructions for the expert?</Text>
        <Text style={styles.subtitle}>Optional. Maximum 300 characters.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Please call before arriving. Parking available inside."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={300}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{notes.length}/300</Text>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleNext}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Review Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: '#ff5e2c', borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 22, color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#6B7280', marginBottom: 24 },
  inputContainer: { position: 'relative' },
  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16,
    padding: 16, paddingBottom: 40, fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 16, color: '#1A1A1A',
    minHeight: 150
  },
  charCount: {
    position: 'absolute', bottom: 12, right: 16,
    fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#9CA3AF'
  },
  skipButton: { marginTop: 24, alignItems: 'center', padding: 12 },
  skipButtonText: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#6B7280' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  nextButton: { backgroundColor: '#1A1A1A', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
