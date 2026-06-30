const fs = require('fs');
const path = require('path');

const homeContent = `import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExpertHomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <View>
          <Text style={styles.greeting}>Hello, Expert</Text>
          <Text style={styles.statusText}>{isOnline ? 'You are online' : 'You are offline'}</Text>
        </View>
        <View style={styles.toggleContainer}>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: theme.colors.border, true: theme.colors.successLight }}
            thumbColor={isOnline ? theme.colors.success : '#f4f3f4'}
          />
        </View>
      </LinearGradient>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={isOnline ? "map-marker-radius" : "sleep"} 
          size={100} 
          color={isOnline ? theme.colors.expertPrimary : theme.colors.border} 
        />
        <Text style={styles.message}>
          {isOnline ? "Waiting for service requests in your area..." : "Go online to start receiving jobs."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  greeting: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  statusText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  toggleContainer: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
`;

const jobsContent = `import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExpertJobsScreen() {
  const insets = useSafeAreaInsets();
  const dummyJobs = [
    { id: '1', title: 'Flat Tyre / Puncture', date: 'Today, 10:30 AM', status: 'Completed', earnings: '₹350' },
    { id: '2', title: 'Battery Jumpstart', date: 'Yesterday, 02:15 PM', status: 'Completed', earnings: '₹500' },
  ];

  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobEarnings}>{item.earnings}</Text>
      </View>
      <View style={styles.jobFooter}>
        <Text style={styles.jobDate}>{item.date}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <Text style={styles.headerTitle}>My Jobs</Text>
      </LinearGradient>
      <FlatList
        data={dummyJobs}
        renderItem={renderJob}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>No jobs completed yet.</Text>
          </View>
        }
      />
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
  list: { padding: 24 },
  jobCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary },
  jobEarnings: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.success },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDate: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textTertiary },
  statusBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { fontFamily: 'Lufga-Bold', fontSize: 12, color: theme.colors.success },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textTertiary, marginTop: 16 },
});
`;

const walletContent = `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExpertWalletScreen() {
  const insets = useSafeAreaInsets();
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
      <View style={styles.content}>
        <LinearGradient
          colors={[theme.colors.expertPrimary, '#4C1D95']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹ 1,250.00</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recent transactions.</Text>
        </View>
      </View>
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
  content: { paddingHorizontal: 24, paddingTop: 32 },
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
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textTertiary },
});
`;

const profileContent = `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MenuItem = ({ icon, title, isDanger, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, isDanger && { backgroundColor: theme.colors.errorLight }]}>
      <MaterialCommunityIcons name={icon} size={22} color={isDanger ? theme.colors.error : theme.colors.expertPrimary} />
    </View>
    <Text style={[styles.menuText, isDanger && { color: theme.colors.error }]}>{title}</Text>
    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
  </TouchableOpacity>
);

export default function ExpertProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <Text style={styles.headerTitle}>My Profile</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EX</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>John Mechanic</Text>
            <Text style={styles.phone}>+91 98765 43210</Text>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FFF" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem icon="account-edit-outline" title="Personal Details" />
        <MenuItem icon="file-document-outline" title="My Documents" />
        <MenuItem icon="bank-outline" title="Bank Details" />
        
        <Text style={styles.sectionTitle}>Settings</Text>
        <MenuItem icon="bell-outline" title="Notifications" />
        <MenuItem icon="headset" title="Help & Support" />
        
        <View style={{ marginTop: 24 }}>
          <MenuItem icon="logout" title="Log Out" isDanger onPress={handleLogout} />
        </View>
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
  content: { padding: 24 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.expertPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  info: { flex: 1 },
  name: { fontFamily: 'Lufga-Bold', fontSize: 22, color: theme.colors.textPrimary, marginBottom: 4 },
  phone: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: { fontFamily: 'Lufga-Bold', fontSize: 12, color: '#FFF', marginLeft: 4 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textTertiary, marginBottom: 16, marginTop: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.expertPrimaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: { flex: 1, fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary },
});
`;

fs.writeFileSync(path.join(__dirname, 'src/screens/mechanic/ExpertHomeScreen.js'), homeContent);
fs.writeFileSync(path.join(__dirname, 'src/screens/mechanic/ExpertJobsScreen.js'), jobsContent);
fs.writeFileSync(path.join(__dirname, 'src/screens/mechanic/ExpertWalletScreen.js'), walletContent);
fs.writeFileSync(path.join(__dirname, 'src/screens/mechanic/ExpertProfileScreen.js'), profileContent);

console.log('All screens updated');
