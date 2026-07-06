import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WalletContext } from '../../data/WalletContext';

const formatINR = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ExpertWithdrawScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { availableBalance, maxWithdrawable, rescuexDue, bankDetails, requestWithdrawal } = useContext(WalletContext);

  const maskedAccount = bankDetails.accountNumber
    ? '•••• •••• ' + bankDetails.accountNumber.slice(-4)
    : '—';

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= maxWithdrawable;

  const handleWithdraw = async () => {
    if (!isValid) return;
    setSubmitting(true);
    const result = await requestWithdrawal(amount);
    setSubmitting(false);

    if (result.success) {
      navigation.navigate('ExpertWithdrawSuccess');
    } else {
      Alert.alert('Withdrawal Failed', result.message);
    }
  };

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
          {/* Balance Info */}
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatINR(availableBalance)}</Text>
            {rescuexDue > 0 && (
              <View style={styles.dueInfo}>
                <MaterialCommunityIcons name="alert-circle" size={14} color="#F97316" />
                <Text style={styles.dueText}>
                  RescueX Due: {formatINR(rescuexDue)} — Max Withdrawable: {formatINR(maxWithdrawable)}
                </Text>
              </View>
            )}
          </View>

          {/* Amount Input */}
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
          {numAmount > maxWithdrawable && numAmount > 0 && (
            <Text style={styles.errorText}>
              Amount exceeds maximum withdrawable ({formatINR(maxWithdrawable)})
            </Text>
          )}

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {[500, 1000, 2000, 5000].map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.quickBtn, q > maxWithdrawable && styles.quickBtnDisabled]}
                disabled={q > maxWithdrawable}
                onPress={() => setAmount(q.toString())}
              >
                <Text style={[styles.quickBtnText, q > maxWithdrawable && styles.quickBtnTextDisabled]}>₹{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transfer To */}
          <Text style={styles.sectionTitle}>Transfer To</Text>
          <View style={styles.bankCard}>
            <View style={styles.bankIconBg}>
              <MaterialCommunityIcons name="bank" size={24} color={theme.colors.expertPrimary} />
            </View>
            <View style={styles.bankDetails}>
              <Text style={styles.bankHolderName}>{bankDetails.holderName || 'Not set'}</Text>
              <Text style={styles.bankName}>{bankDetails.bankName || '—'}</Text>
              <Text style={styles.bankAccount}>{maskedAccount}</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={styles.infoNoteText}>
              Withdrawal requests are reviewed by the admin. Funds will be transferred to your bank account within 2-3 business days after approval.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity
            style={[styles.withdrawBtn, (!isValid || submitting) && styles.withdrawBtnDisabled]}
            disabled={!isValid || submitting}
            onPress={handleWithdraw}
          >
            <Text style={styles.withdrawBtnText}>
              {submitting ? 'Submitting...' : 'Confirm Withdrawal'}
            </Text>
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

  // Balance
  balanceInfo: { alignItems: 'center', marginBottom: 32 },
  balanceLabel: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  balanceAmount: { fontFamily: 'Lufga-Bold', fontSize: 32, color: theme.colors.textPrimary },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  dueText: { fontFamily: 'Lufga-Bold', fontSize: 11, color: '#F97316', flex: 1 },

  // Input
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  currencySymbol: { fontFamily: 'Lufga-Bold', fontSize: 24, color: theme.colors.textPrimary, marginRight: 8 },
  amountInput: {
    flex: 1,
    height: 64,
    fontFamily: 'Lufga-Bold',
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  errorText: { fontFamily: 'Lufga-Bold', fontSize: 12, color: '#EF4444', marginBottom: 12 },

  // Quick Amounts
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    marginTop: 8,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.expertPrimaryLight,
    alignItems: 'center',
  },
  quickBtnDisabled: { backgroundColor: theme.colors.background, opacity: 0.5 },
  quickBtnText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.expertPrimary },
  quickBtnTextDisabled: { color: theme.colors.textTertiary },

  // Bank Card
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: theme.colors.expertPrimaryLight,
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  bankIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.expertPrimaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankDetails: { flex: 1 },
  bankHolderName: { fontFamily: 'Lufga-Bold', fontSize: 15, color: theme.colors.textPrimary, marginBottom: 2 },
  bankName: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
  bankAccount: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textTertiary },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  infoNoteText: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.textTertiary, flex: 1, lineHeight: 18 },

  // Footer
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
