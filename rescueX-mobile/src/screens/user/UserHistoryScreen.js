import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { useBooking } from '../../data/bookingStore';

export default function UserHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { bookings } = useBooking();
  const [activeTab, setActiveTab] = useState('all');

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'done') return b.status === 'booking_completed';
    if (activeTab === 'cancel') return b.status === 'cancelled';
    if (activeTab === 'incomplete') return !['booking_completed', 'cancelled'].includes(b.status);
    return true;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting_assignment': return 'Incomplete';
      case 'expert_assigned': return 'Incomplete';
      case 'service_in_progress': return 'In Progress';
      case 'pending_completion_verification': return 'Incomplete';
      case 'booking_completed': return 'Done';
      case 'cancelled': return 'Cancel';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'booking_completed') return '#22C55E';
    if (status === 'cancelled') return '#EF4444';
    return '#ff5e2c';
  };

  const getTabColor = (tab) => {
    switch (tab) {
      case 'all': return '#1A1A1A';
      case 'incomplete': return '#ff5e2c';
      case 'done': return '#22C55E';
      case 'cancel': return '#EF4444';
      default: return '#1A1A1A';
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#ff5e2c', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}
      >
        <Text style={styles.title}>History</Text>
      </LinearGradient>
      
      <View style={styles.tabsContainer}>
        {['all', 'incomplete', 'done', 'cancel'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[
              styles.tabButton, 
              activeTab === tab && { backgroundColor: getTabColor(tab) }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        {filteredBookings.length === 0 ? (
          <Text style={styles.subtitle}>No bookings found in this category.</Text>
        ) : (
          filteredBookings.map(booking => (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => navigation.navigate('UserBookingDetailsScreen', { booking })}
              activeOpacity={0.7}
            >
              <View style={styles.bookingHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                  {booking.type === 'instant' ? (
                    <MaterialCommunityIcons name="lightning-bolt" size={16} color="#ff5e2c" style={{ marginRight: 4 }} />
                  ) : (
                    <MaterialCommunityIcons name="calendar-clock" size={16} color="#4C1D95" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.bookingId, { flex: 1 }]} numberOfLines={1} ellipsizeMode="middle">ID: {booking.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>
              
              {booking.type === 'instant' ? (
                <Text style={[styles.dateText, { color: '#ff5e2c' }]}>
                  Instant Service Request
                </Text>
              ) : (
                <Text style={styles.dateText}>
                  Scheduled: {booking.scheduledDate} {booking.scheduledTime ? `at ${booking.scheduledTime}` : ''}
                </Text>
              )}

              {booking.type === 'instant' ? (
                <Text style={styles.serviceText}>
                  {booking.vehicleTitle} - {booking.problem}
                </Text>
              ) : (
                booking.services && booking.services.map((svc, i) => (
                  <Text key={i} style={styles.serviceText}>
                    {svc.quantity}x {svc.name}
                  </Text>
                ))
              )}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{booking.type === 'instant' && !booking.totalAmount ? 'TBD' : `₹${booking.totalAmount || 0}`}</Text>
              </View>

              {booking.expert && !['pending', 'waiting_assignment'].includes(booking.status) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                  <MaterialCommunityIcons name="account-wrench-outline" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#6B7280', marginLeft: 6 }}>
                    Assigned Expert: {booking.expert.name}
                  </Text>
                </View>
              )}

              {booking.status === 'booking_completed' && (
                <View style={styles.completedInfoRow}>
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#22C55E" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                  {booking.serviceStartTime && booking.serviceEndTime && (
                    <Text style={styles.durationText}>
                      Duration: {(() => {
                        const s = Math.floor((new Date(booking.serviceEndTime).getTime() - new Date(booking.serviceStartTime).getTime()) / 1000);
                        const h = Math.floor(s / 3600);
                        const m = Math.floor((s % 3600) / 60);
                        const sec = s % 60;
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                      })()}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  title: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    fontSize: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 13,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dateText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  serviceText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  totalValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#ff5e2c',
  },
  completedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 11,
    color: '#22C55E',
    marginLeft: 4,
  },
  durationText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: '#3B82F6',
  },
});
