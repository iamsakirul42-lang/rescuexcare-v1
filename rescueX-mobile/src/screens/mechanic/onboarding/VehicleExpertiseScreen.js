import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';

const VEHICLES = [
  { id: 'bike', label: '2-Wheeler (Bike/Scooter)', icon: 'motorbike' },
  { id: 'auto', label: '3-Wheeler (Auto)', icon: 'rickshaw' },
  { id: 'car', label: '4-Wheeler (Car)', icon: 'car' },
  { id: 'truck', label: 'Heavy Vehicles (Truck/Bus)', icon: 'truck' },
];

export default function VehicleExpertiseScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [selected, setSelected] = useState(onboardingData.vehicles || []);

  const toggleSelection = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const isValid = selected.length > 0;

  const handleNext = () => {
    updateData('vehicles', selected);
    navigation.navigate('Services');
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader 
        title="Vehicle Expertise" 
        subtitle="What types of vehicles can you repair?"
        step={3} 
        totalSteps={9} 
        onBack={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        {VEHICLES.map((v) => {
          const isSelected = selected.includes(v.id);
          return (
            <TouchableOpacity 
              key={v.id} 
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.7}
              onPress={() => toggleSelection(v.id)}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <MaterialCommunityIcons name={v.icon} size={28} color={isSelected ? '#FFF' : theme.colors.textSecondary} />
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{v.label}</Text>
              {isSelected && (
                <View style={styles.check}>
                  <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    marginBottom: 16,
  },
  cardSelected: {
    borderColor: theme.colors.expertPrimary,
    backgroundColor: theme.colors.expertPrimaryLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: theme.colors.expertPrimary,
  },
  label: { flex: 1, fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary },
  labelSelected: { color: theme.colors.expertPrimary },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.expertPrimary, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  btn: { backgroundColor: theme.colors.expertPrimary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: theme.colors.border },
  btnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
