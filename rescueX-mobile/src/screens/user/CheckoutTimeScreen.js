import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const TIME_SLOTS = {
  Morning: [
    { id: 't1', time: '09:00 AM', available: true },
    { id: 't2', time: '10:00 AM', available: false },
    { id: 't3', time: '11:00 AM', available: true },
  ],
  Afternoon: [
    { id: 't4', time: '12:00 PM', available: true },
    { id: 't5', time: '01:00 PM', available: true },
    { id: 't6', time: '02:00 PM', available: false },
    { id: 't7', time: '03:00 PM', available: true },
  ],
  Evening: [
    { id: 't8', time: '04:00 PM', available: true },
    { id: 't9', time: '05:00 PM', available: true },
    { id: 't10', time: '06:00 PM', available: true },
  ]
};

export default function CheckoutTimeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { address, date } = route.params || {};

  const [selectedTimeId, setSelectedTimeId] = useState(null);

  const handleNext = () => {
    if (!selectedTimeId) {
      alert('Please select a time slot.');
      return;
    }
    
    let selectedTimeStr = '';
    Object.values(TIME_SLOTS).forEach(slots => {
      const found = slots.find(s => s.id === selectedTimeId);
      if (found) selectedTimeStr = found.time;
    });

    navigation.navigate('CheckoutNotesScreen', { 
      address, 
      date,
      time: selectedTimeStr
    });
  };

  const renderSlotGroup = (title, slots) => (
    <View style={styles.slotGroup}>
      <Text style={styles.slotGroupTitle}>{title}</Text>
      <View style={styles.slotsGrid}>
        {slots.map(slot => {
          const isSelected = selectedTimeId === slot.id;
          return (
            <TouchableOpacity
              key={slot.id}
              disabled={!slot.available}
              style={[
                styles.slotCard,
                isSelected && styles.slotCardSelected,
                !slot.available && styles.slotCardDisabled
              ]}
              onPress={() => setSelectedTimeId(slot.id)}
            >
              <Text style={[
                styles.slotTimeText,
                isSelected && { color: '#ff5e2c' },
                !slot.available && { color: '#D1D5DB' }
              ]}>{slot.time}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>What time works for you?</Text>
        <Text style={styles.subtitle}>On {date}</Text>

        {renderSlotGroup('Morning', TIME_SLOTS.Morning)}
        {renderSlotGroup('Afternoon', TIME_SLOTS.Afternoon)}
        {renderSlotGroup('Evening', TIME_SLOTS.Evening)}

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.nextButton, !selectedTimeId && { opacity: 0.5 }]} 
          onPress={handleNext}
          disabled={!selectedTimeId}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  subtitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 16, color: '#ff5e2c', marginBottom: 24 },
  slotGroup: { marginBottom: 24 },
  slotGroupTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#4B5563', marginBottom: 12 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotCard: {
    width: '31%', paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center'
  },
  slotCardSelected: { borderColor: '#ff5e2c', backgroundColor: '#ff5e2c05' },
  slotCardDisabled: { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6' },
  slotTimeText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: '#1A1A1A' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  nextButton: { backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
