import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';

const SERVICES = [
  'Flat Tyre / Puncture', 'Battery Jumpstart', 'Battery Replacement',
  'Fuel Delivery', 'Engine Diagnostics', 'Brake Repair',
  'Clutch Repair', 'AC Repair', 'Electrical Issues',
  'Towing Support', 'General Service', 'Lockout Assistance'
];

export default function ServicesScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [selected, setSelected] = useState(onboardingData.services || []);

  const toggleSelection = (item) => {
    if (selected.includes(item)) setSelected(selected.filter(i => i !== item));
    else setSelected([...selected, item]);
  };

  const isValid = selected.length > 0;

  const handleNext = () => {
    updateData('services', selected);
    navigation.navigate('Experience');
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader 
        title="Services Provided" 
        subtitle="Select the services you can provide."
        step={4} 
        totalSteps={9} 
        onBack={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.chipGrid}>
          {SERVICES.map((service) => {
            const isSelected = selected.includes(service);
            return (
              <TouchableOpacity
                key={service}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleSelection(service)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {service}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { padding: 24 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    backgroundColor: '#FFF',
  },
  chipSelected: {
    borderColor: theme.colors.expertPrimary,
    backgroundColor: theme.colors.expertPrimary,
  },
  chipText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFF',
  },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  btn: { backgroundColor: theme.colors.expertPrimary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: theme.colors.border },
  btnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
