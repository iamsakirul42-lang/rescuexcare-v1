import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WalletContext } from '../../data/WalletContext';

const formatINR = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${mins} ${ampm}`;
};

const SummaryCard = ({ icon, label, value, color, bgColor }) => (
  <View style={[styles.summaryCard, { borderLeftColor: color }]}>
    <View style={[styles.summaryIconBg, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <View style={styles.summaryTextContainer}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const StatusBadge = ({ status }) => {
  const config = {
    processing: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', text: 'Processing' },
    approved: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', text: 'Approved' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', text: 'Rejected' },
    paid: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', text: 'Paid' },
    unpaid: { bg: 'rgba(249, 115, 22, 0.15)', color: '#F97316', text: 'Unpaid' },
  };
  const c = config[status] || config.processing;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.text}</Text>
    </View>
  );
};

const TransactionItem = ({ item }) => {
  const isEarning = item.type === 'earning';
  const isCashDue = item.type === 'cash_due';
  const isWithdrawal = item.type === 'withdrawal';

  const iconName = isEarning ? 'cash-plus' : isCashDue ? 'alert-circle-outline' : 'bank-transfer-out';
  const iconColor = isEarning ? '#22C55E' : isCashDue ? '#F97316' : '#3B82F6';
  const iconBg = isEarning ? 'rgba(34, 197, 94, 0.12)' : isCashDue ? 'rgba(249, 115, 22, 0.12)' : 'rgba(59, 130, 246, 0.12)';

  return (
    <View style={styles.txCard}>
      <View style={[styles.txIconBg, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.txDetails}>
        <Text style={styles.txTitle}>{item.title}</Text>
        {item.bookingId && (
          <Text style={styles.txSubtitle}>#{item.bookingId}</Text>
        )}
        {item.subtitle ? <Text style={styles.txSubtitle}>{item.subtitle}</Text> : null}
        <Text style={styles.txDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.txAmountContainer}>
        {isEarning && (
          <>
            <Text style={[styles.txAmount, { color: '#22C55E' }]}>+{formatINR(item.amount)}</Text>
            <Text style={styles.txCommission}>Commission: {formatINR(item.commission)}</Text>
          </>
        )}
        {isCashDue && (
          <>
            <Text style={[styles.txAmount, { color: '#22C55E' }]}>+{formatINR(item.amount)}</Text>
            <View style={styles.txDueRow}>
              <Text style={styles.txDueLabel}>Due: {formatINR(item.platformDue)}</Text>
              <StatusBadge status={item.platformDueStatus} />
            </View>
          </>
        )}
        {isWithdrawal && (
          <>
            <Text style={[styles.txAmount, { color: '#3B82F6' }]}>−{formatINR(item.amount)}</Text>
            <StatusBadge status={item.status} />
          </>
        )}
      </View>
    </View>
  );
};

export default function ExpertWalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    loading,
    availableBalance,
    totalEarnings,
    totalWithdrawn,
    pendingWithdrawals,
    rescuexDue,
    bankDetails,
    transactionHistory,
    refreshWallet,
  } = useContext(WalletContext);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

  const maskedAccount = bankDetails.accountNumber
    ? '•••• •••• ' + bankDetails.accountNumber.slice(-4)
    : '—';

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.expertPrimary} />
        <Text style={styles.loadingText}>Loading Wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <Text style={styles.headerTitle}>Wallet</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.expertPrimary} />}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={[theme.colors.expertPrimary, '#4C1D95']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatINR(availableBalance)}</Text>
          {rescuexDue > 0 && (
            <View style={styles.dueWarning}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#FFC107" />
              <Text style={styles.dueWarningText}>
                RescueX Due: {formatINR(rescuexDue)} (deducted from withdrawable)
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => navigation.navigate('ExpertWithdraw')}
          >
            <MaterialCommunityIcons name="bank-transfer-out" size={20} color="#FFF" />
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Financial Summary */}
        <View style={styles.summaryGrid}>
          <SummaryCard icon="trending-up" label="Total Earnings" value={formatINR(totalEarnings)} color="#22C55E" bgColor="rgba(34, 197, 94, 0.1)" />
          <SummaryCard icon="bank-check" label="Total Withdrawn" value={formatINR(totalWithdrawn)} color="#3B82F6" bgColor="rgba(59, 130, 246, 0.1)" />
          <SummaryCard icon="clock-outline" label="Pending" value={formatINR(pendingWithdrawals)} color="#F59E0B" bgColor="rgba(245, 158, 11, 0.1)" />
          <SummaryCard icon="alert-octagon" label="RescueX Due" value={formatINR(rescuexDue)} color="#F97316" bgColor="rgba(249, 115, 22, 0.1)" />
        </View>

        {/* Bank Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank Account</Text>
        </View>
        <View style={styles.bankCard}>
          <View style={styles.bankIconBg}>
            <MaterialCommunityIcons name="bank" size={24} color={theme.colors.expertPrimary} />
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.bankHolderName}>{bankDetails.holderName || 'Not set'}</Text>
            <Text style={styles.bankName}>{bankDetails.bankName || '—'}</Text>
            <Text style={styles.bankAccount}>{maskedAccount}</Text>
          </View>
          <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textTertiary} />
        </View>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Text style={styles.sectionCount}>{transactionHistory.length} records</Text>
        </View>

        {transactionHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Complete jobs to see your earnings here.</Text>
          </View>
        ) : (
          transactionHistory.map(item => (
            <TransactionItem key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textSecondary, marginTop: 16 },
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
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },

  // Balance Card
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: { fontFamily: 'Lufga-Bold', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontFamily: 'Lufga-Bold', fontSize: 36, color: '#FFF', marginBottom: 16 },
  dueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  dueWarningText: { fontFamily: 'Lufga-Bold', fontSize: 12, color: '#FFC107', flex: 1 },
  withdrawBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  withdrawText: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#FFF' },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryTextContainer: { flex: 1 },
  summaryLabel: { fontFamily: 'Lufga-Bold', fontSize: 11, color: theme.colors.textTertiary, marginBottom: 2 },
  summaryValue: { fontFamily: 'Lufga-Bold', fontSize: 15 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 18, color: theme.colors.textPrimary },
  sectionCount: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.textTertiary },

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
  bankInfo: { flex: 1 },
  bankHolderName: { fontFamily: 'Lufga-Bold', fontSize: 15, color: theme.colors.textPrimary, marginBottom: 2 },
  bankName: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
  bankAccount: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textTertiary },

  // Transaction Items
  txCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  txIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  txDetails: { flex: 1, marginRight: 8 },
  txTitle: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textPrimary, marginBottom: 2 },
  txSubtitle: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.textSecondary, marginBottom: 1 },
  txDate: { fontFamily: 'Lufga-Bold', fontSize: 11, color: theme.colors.textTertiary, marginTop: 4 },
  txAmountContainer: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  txAmount: { fontFamily: 'Lufga-Bold', fontSize: 15, marginBottom: 4 },
  txCommission: { fontFamily: 'Lufga-Bold', fontSize: 10, color: theme.colors.textTertiary },
  txDueRow: { alignItems: 'flex-end', gap: 4 },
  txDueLabel: { fontFamily: 'Lufga-Bold', fontSize: 10, color: '#F97316' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontFamily: 'Lufga-Bold', fontSize: 10, textTransform: 'uppercase' },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textSecondary, marginTop: 16 },
  emptySubText: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textTertiary, marginTop: 4 },
});
