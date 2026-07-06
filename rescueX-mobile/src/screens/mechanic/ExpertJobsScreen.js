import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBooking } from '../../data/bookingStore';

const formatAddress = (address) => {
  if (!address) return 'Unknown Location';
  if (typeof address === 'object' && address.fullAddress) return address.fullAddress;
  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address);
      if (parsed && parsed.fullAddress) return parsed.fullAddress;
    } catch(e) {
      return address;
    }
  }
  return String(address);
};

export default function ExpertJobsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { bookings } = useBooking();

  // Show active + completed bookings for the expert
  const activeJobs = bookings.filter(b => 
    !['cancelled'].includes(b.status)
  );

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting_assignment': return 'New Booking';
      case 'expert_assigned': return 'Assigned';
      case 'service_in_progress': return 'In Progress';
      case 'pending_completion_verification': return 'Pending Verification';
      case 'booking_completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'booking_completed') return theme.colors.success || '#22C55E';
    if (status === 'service_in_progress') return '#3B82F6';
    if (status === 'pending_completion_verification') return '#F59E0B';
    if (status === 'expert_assigned') return theme.colors.expertPrimary;
    return '#6B7280';
  };

  const renderJob = ({ item }) => {
    const isActionable = ['expert_assigned', 'service_in_progress', 'pending_completion_verification'].includes(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.jobCard} 
        onPress={() => {
          if (isActionable || item.status === 'booking_completed') {
            navigation.navigate('ExpertActiveJobScreen', { bookingId: item.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>
              {(item.services && item.services.length > 0) ? item.services.map(s => s.name).join(', ') : (item.problem || 'Service')}
            </Text>
            <Text style={styles.jobId} numberOfLines={1} ellipsizeMode="middle">ID: {item.id}</Text>
            {item.address && (
              <Text style={styles.jobAddress} numberOfLines={2}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#6B7280" /> {formatAddress(item.address)}
              </Text>
            )}
          </View>
          <Text style={styles.jobEarnings}>₹{item.totalAmount || 0}</Text>
        </View>
        <View style={styles.jobFooter}>
          <Text style={styles.jobDate}>
            {item.scheduledDate} {item.scheduledTime ? `at ${item.scheduledTime}` : ''}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        {isActionable && (
          <View style={styles.actionHint}>
            <MaterialCommunityIcons name="arrow-right-circle" size={16} color={theme.colors.expertPrimary} />
            <Text style={styles.actionHintText}>Tap to manage</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        data={activeJobs}
        renderItem={renderJob}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>No jobs yet.</Text>
            <Text style={styles.emptySubText}>Jobs will appear here when bookings are assigned.</Text>
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
  list: { padding: 24, paddingBottom: 120 },
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary, flex: 1 },
  jobId: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  jobAddress: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', marginTop: 4 },
  jobEarnings: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.success || '#22C55E', marginLeft: 12 },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDate: { fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.textTertiary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontFamily: 'Lufga-Bold', fontSize: 12 },
  actionHint: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  actionHintText: {
    fontFamily: 'Lufga-Bold', fontSize: 13, color: theme.colors.expertPrimary, marginLeft: 6,
  },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textTertiary, marginTop: 16 },
  emptySubText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});
