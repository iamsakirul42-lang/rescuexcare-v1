import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

export default function CheckoutDateScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  const address = route.params?.address;

  // Get today's date formatted as YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    // Account for timezone offset to avoid previous day issue
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const handleNext = () => {
    // Parse YYYY-MM-DD back to a local date
    const [year, month, day] = selectedDate.split('-');
    const d = new Date(year, month - 1, day);
    const fullDate = d.toDateString(); // e.g. "Mon Jun 30 2026"

    navigation.navigate('CheckoutTimeScreen', { 
      address, 
      date: fullDate 
    });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>When should the expert arrive?</Text>
        <Text style={styles.subtitle}>Select a future date for your service.</Text>

        <View style={styles.calendarContainer}>
          <Calendar
            minDate={getTodayString()}
            onDayPress={day => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#ff5e2c' }
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#ff5e2c',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#ff5e2c',
              dayTextColor: '#1A1A1A',
              textDisabledColor: '#D1D5DB',
              arrowColor: '#ff5e2c',
              monthTextColor: '#1A1A1A',
              textDayFontFamily: 'Lufga-Bold',
              textMonthFontFamily: 'Lufga-Bold',
              textDayHeaderFontFamily: 'Lufga-Bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: '#ff5e2c', borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFFFFF' },
  content: { padding: 20, flex: 1 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 22, color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#6B7280', marginBottom: 24 },
  calendarContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  nextButton: { backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
