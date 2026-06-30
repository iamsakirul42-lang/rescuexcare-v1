import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WalletContext } from '../../data/WalletContext';

export default function ExpertWithdrawScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const { balance, withdrawFunds } = useContext(WalletContext);
  
  // Format balance with commas
  const formattedBalance = typeof balance === 'number' 
    ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '1,250.00';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available to Withdraw</Text>
            <Text style={styles.balanceAmount}>₹ {formattedBalance}</Text>
          </View>

          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <Text style={styles.sectionTitle}>Transfer To</Text>
          <View style={styles.bankCard}>
            <View style={styles.bankIconBg}>
              <MaterialCommunityIcons name="bank" size={24} color={theme.colors.expertPrimary} />
            </View>
            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>State Bank of India</Text>
              <Text style={styles.bankAccount}>•••• •••• 1234</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
          </View>

        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity 
            style={[styles.withdrawBtn, !amount && styles.withdrawBtnDisabled]} 
            disabled={!amount}
            onPress={() => {
              const success = withdrawFunds(amount);
              if (success) {
                navigation.navigate('ExpertWithdrawSuccess');
              } else {
                Alert.alert('Invalid Amount', 'Please enter a valid amount within your available balance.');
              }
            }}
          >
            <Text style={styles.withdrawBtnText}>Confirm Withdrawal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFF' },
  content: { padding: 24 },
  balanceInfo: { alignItems: 'center', marginBottom: 40 },
  balanceLabel: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  balanceAmount: { fontFamily: 'Lufga-Bold', fontSize: 32, color: theme.colors.textPrimary },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  currencySymbol: { fontFamily: 'Lufga-Bold', fontSize: 24, color: theme.colors.textPrimary, marginRight: 8 },
  amountInput: {
    flex: 1,
    height: 64,
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: theme.colors.expertPrimaryLight,
    padding: 16,
    borderRadius: 12,
  },
  bankIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.expertPrimaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankDetails: { flex: 1 },
  bankName: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 4 },
  bankAccount: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary },
  footer: { padding: 24 },
  withdrawBtn: {
    backgroundColor: theme.colors.expertPrimary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtnDisabled: { backgroundColor: theme.colors.border },
  withdrawBtnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
