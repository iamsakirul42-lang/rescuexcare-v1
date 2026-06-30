import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const RELATIONSHIPS = [
  "Brother",
  "Father",
  "Mother",
  "Sister",
  "Spouse"
];

export default function EmergencyContactScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [data, setData] = useState(onboardingData.emergency);
  const [showRelationPicker, setShowRelationPicker] = useState(false);

  const isValid = data.name.length > 2 && data.relationship.length > 2 && data.mobile.length === 10;

  const handleNext = () => {
    updateData('emergency', data);
    navigation.navigate('Review');
  };

  const renderRelationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setData({ ...data, relationship: item });
        setShowRelationPicker(false);
      }}
    >
      <Text style={[styles.pickerItemText, data.relationship === item && styles.pickerItemSelectedText]}>
        {item}
      </Text>
      {data.relationship === item && <MaterialCommunityIcons name="check" size={20} color={theme.colors.expertPrimary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <OnboardingHeader 
          title="Emergency Contact" 
          subtitle="Who should we contact in an emergency?"
          step={8} 
          totalSteps={9} 
          onBack={() => navigation.goBack()} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Contact Person Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={data.name}
            onChangeText={(text) => setData({ ...data, name: text })}
          />

          <Text style={styles.label}>Relationship *</Text>
          <TouchableOpacity 
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowRelationPicker(true)}
          >
            <Text style={[styles.dropdownText, !data.relationship && styles.dropdownPlaceholder]}>
              {data.relationship || 'Select Relationship'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={data.mobile}
            onChangeText={(text) => setData({ ...data, mobile: text })}
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btn, !isValid && styles.btnDisabled]} 
            disabled={!isValid}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>Review Application</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Relationship Picker Modal */}
      <Modal visible={showRelationPicker} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Relationship</Text>
              <TouchableOpacity onPress={() => setShowRelationPicker(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={RELATIONSHIPS}
              keyExtractor={(item) => item}
              renderItem={renderRelationItem}
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
    height: '40%', // shorter since there are only 5 items
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
