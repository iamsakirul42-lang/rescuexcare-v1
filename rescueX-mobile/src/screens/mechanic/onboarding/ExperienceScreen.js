import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const YEARS = Array.from({ length: 20 }, (_, i) => `${i + 1} Year${i > 0 ? 's' : ''}`);

export default function ExperienceScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [data, setData] = useState(onboardingData.experience);
  const [showPicker, setShowPicker] = useState(false);

  const isValid = data.years.length > 0;

  const handleNext = () => {
    updateData('experience', data);
    navigation.navigate('Documents');
  };

  const renderYearItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setData({ ...data, years: item });
        setShowPicker(false);
      }}
    >
      <Text style={[styles.pickerItemText, data.years === item && styles.pickerItemSelectedText]}>
        {item}
      </Text>
      {data.years === item && <MaterialCommunityIcons name="check" size={20} color={theme.colors.expertPrimary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <OnboardingHeader 
          title="Experience" 
          subtitle="Tell us about your background."
          step={5} 
          totalSteps={9} 
          onBack={() => navigation.goBack()} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Years of Experience *</Text>
          <TouchableOpacity 
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <Text style={[styles.dropdownText, !data.years && styles.dropdownPlaceholder]}>
              {data.years || 'Select Years of Experience'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.label}>Current/Previous Workshop Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter workshop name"
            value={data.workshopName}
            onChangeText={(text) => setData({ ...data, workshopName: text })}
          />

          <Text style={styles.label}>Previous Work Details (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Tell us a bit about your work..."
            multiline
            value={data.previousWork}
            onChangeText={(text) => setData({ ...data, previousWork: text })}
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

      {/* Year Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Experience</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={YEARS}
              keyExtractor={(item) => item}
              renderItem={renderYearItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dropdownText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: theme.colors.textTertiary,
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  pickerItemText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  pickerItemSelectedText: {
    color: theme.colors.expertPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: 24,
  },
});
