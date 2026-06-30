import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WalletContext } from '../../data/WalletContext';

export default function ExpertWalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { balance, transactions } = useContext(WalletContext);
  
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
        <Text style={styles.headerTitle}>Earnings</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[theme.colors.expertPrimary, '#4C1D95']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹ {formattedBalance}</Text>
          <TouchableOpacity 
            style={styles.withdrawBtn} 
            onPress={() => navigation.navigate('ExpertWithdraw')}
          >
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={[styles.txIconBg, { backgroundColor: tx.type === 'withdrawal' ? theme.colors.errorLight : theme.colors.successLight }]}>
              <MaterialCommunityIcons 
                name={tx.type === 'withdrawal' ? 'bank-transfer-out' : 'cash-plus'} 
                size={24} 
                color={tx.type === 'withdrawal' ? theme.colors.error : theme.colors.success} 
              />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <View style={styles.txAmountContainer}>
              <Text style={[styles.txAmount, { color: tx.type === 'withdrawal' ? theme.colors.error : theme.colors.success }]}>
                {tx.amount}
              </Text>
              <Text style={styles.txStatus}>{tx.status}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
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
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: { fontFamily: 'Lufga-Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  balanceAmount: { fontFamily: 'Lufga-Bold', fontSize: 36, color: '#FFF', marginBottom: 24 },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: '#FFF' },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 18, color: theme.colors.textPrimary, marginBottom: 16 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 12,
  },
  txIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txDetails: { flex: 1 },
  txTitle: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textPrimary, marginBottom: 4 },
  txDate: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.textSecondary },
  txAmountContainer: { alignItems: 'flex-end' },
  txAmount: { fontFamily: 'Lufga-Bold', fontSize: 16, marginBottom: 4 },
  txStatus: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.textTertiary },
});
