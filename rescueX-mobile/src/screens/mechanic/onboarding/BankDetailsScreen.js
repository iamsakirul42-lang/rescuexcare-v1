import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const BANKS = [
  "Airtel Payments Bank", "AU Small Finance Bank", "Axis Bank", "Bandhan Bank", 
  "Bank of Baroda", "Bank of India", "Bank of Maharashtra", "Canara Bank", 
  "Capital Small Finance Bank", "Central Bank of India", "City Union Bank", 
  "CSB Bank (Catholic Syrian Bank)", "DBS Bank India", "DCB Bank", "Dhanlaxmi Bank", 
  "Equitas Small Finance Bank", "ESAF Small Finance Bank", "Federal Bank", 
  "Fincare Small Finance Bank", "HDFC Bank", "ICICI Bank", "IDBI Bank", 
  "IDFC FIRST Bank", "India Post Payments Bank", "Indian Bank", "Indian Overseas Bank", 
  "IndusInd Bank", "Jana Small Finance Bank", "Jammu & Kashmir Bank", "Jio Payments Bank",
  "Karnataka Bank", "Karur Vysya Bank", "Kotak Mahindra Bank", "Nainital Bank", 
  "NSDL Payments Bank", "Paytm Payments Bank", "Punjab & Sind Bank", "Punjab National Bank (PNB)", 
  "RBL Bank", "Saraswat Bank", "Shivalik Small Finance Bank", "South Indian Bank", 
  "Standard Chartered Bank India", "State Bank of India (SBI)", "Suryoday Small Finance Bank", 
  "Tamilnad Mercantile Bank", "UCO Bank", "Ujjivan Small Finance Bank", "Union Bank of India", 
  "Utkarsh Small Finance Bank", "YES Bank"
].sort(); // Sorting them alphabetically makes it easier for users

export default function BankDetailsScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [data, setData] = useState(onboardingData.bank);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const isValid = data.holderName.length > 2 && data.bankName.length > 2 && data.accountNumber.length > 5 && data.ifsc.length === 11;

  const handleNext = () => {
    updateData('bank', data);
    navigation.navigate('EmergencyContact');
  };

  const renderBankItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setData({ ...data, bankName: item });
        setShowBankPicker(false);
      }}
    >
      <Text style={[styles.pickerItemText, data.bankName === item && styles.pickerItemSelectedText]}>
        {item}
      </Text>
      {data.bankName === item && <MaterialCommunityIcons name="check" size={20} color={theme.colors.expertPrimary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <OnboardingHeader 
          title="Bank Details" 
          subtitle="Where should we send your earnings?"
          step={7} 
          totalSteps={9} 
          onBack={() => navigation.goBack()} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Account Holder Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="As per bank records"
            value={data.holderName}
            onChangeText={(text) => setData({ ...data, holderName: text })}
          />

          <Text style={styles.label}>Bank Name *</Text>
          <TouchableOpacity 
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowBankPicker(true)}
          >
            <Text style={[styles.dropdownText, !data.bankName && styles.dropdownPlaceholder]}>
              {data.bankName || 'Select Bank Name'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.label}>Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            keyboardType="number-pad"
            value={data.accountNumber}
            onChangeText={(text) => setData({ ...data, accountNumber: text })}
          />

          <Text style={styles.label}>IFSC Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="11-character IFSC code"
            autoCapitalize="characters"
            maxLength={11}
            value={data.ifsc}
            onChangeText={(text) => setData({ ...data, ifsc: text })}
          />

          <Text style={styles.label}>UPI ID (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. name@okhdfc"
            autoCapitalize="none"
            value={data.upiId}
            onChangeText={(text) => setData({ ...data, upiId: text })}
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

      {/* Bank Picker Modal */}
      <Modal visible={showBankPicker} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BANKS}
              keyExtractor={(item) => item}
              renderItem={renderBankItem}
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
    height: '70%',
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
