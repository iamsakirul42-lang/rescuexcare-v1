import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { supabase } from '../../lib/supabase';

const CACHE_KEY = '@user_notifications';
const READ_KEY = '@user_read_notifications';

export default function UserNotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadCachedData();
    fetchInitialData();
  }, []);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setNotifications(JSON.parse(cached));
      
      const read = await AsyncStorage.getItem(READ_KEY);
      if (read) setReadIds(new Set(JSON.parse(read)));
    } catch (e) {
      console.error('Error loading cache:', e);
    }
  };

  const saveCache = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving cache:', e);
    }
  };

  const markAsRead = async (notification) => {
    if (readIds.has(notification.id)) return; // Already read

    const newReadIds = new Set(readIds);
    newReadIds.add(notification.id);
    setReadIds(newReadIds);
    await AsyncStorage.setItem(READ_KEY, JSON.stringify([...newReadIds]));

    // If it's an individual notification, update DB as well
    if (notification.target_user_id) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);
      } catch (e) {
        console.error('Error marking as read in DB:', e);
      }
    }

    // Navigate to booking if booking_id exists
    if (notification.booking_id) {
      navigation.navigate('UserBookingDetailsScreen', { bookingId: notification.booking_id });
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      setCurrentUserId(userId);

      if (!userId) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_audience.in.(all_users),target_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setNotifications(data);
        saveCache(data);
      }

      setupRealtime(userId);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = (userId) => {
    const subscription = supabase
      .channel('public:notifications:user')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        const isTargeted = payload.new.target_audience === 'all_users' || payload.new.target_user_id === userId;
        if (isTargeted) {
          setNotifications(prev => {
            const updated = [payload.new, ...prev];
            saveCache(updated);
            return updated;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Booking Update': return 'calendar-clock';
      case 'Wallet / Payment': return 'wallet-outline';
      case 'KYC': return 'file-document-outline';
      case 'Emergency Alert': return 'alert-circle-outline';
      case 'Maintenance': return 'wrench-outline';
      case 'Promotional': return 'tag-outline';
      default: return 'bell-outline';
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !readIds.has(item.id) && !item.is_read;

    return (
      <TouchableOpacity 
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => markAsRead(item)}
      >
        {isUnread && <View style={styles.unreadBadge} />}
        
        <View style={[styles.iconContainer, isUnread && { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons 
            name={getIconForType(item.type)} 
            size={24} 
            color={isUnread ? '#FFF' : theme.colors.primary} 
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, isUnread && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
          <View style={styles.metaRow}>
            {item.type && (
              <View style={styles.typeTag}>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            )}
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>You will see new updates and messages here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: theme.colors.textPrimary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: theme.colors.textPrimary, marginTop: 16 },
  emptySubtext: { fontFamily: 'Satoshi-Bold', fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: theme.colors.primary + '30',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: { flex: 1 },
  title: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.textPrimary, marginBottom: 4 },
  unreadText: { color: theme.colors.primary },
  message: { fontFamily: 'Satoshi-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  typeTag: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: { fontFamily: 'Satoshi-Bold', fontSize: 10, color: theme.colors.textSecondary },
  time: { fontFamily: 'Satoshi-Bold', fontSize: 12, color: theme.colors.textTertiary },
});
