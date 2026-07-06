import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

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
  const [mechanic, setMechanic] = React.useState(null);

  React.useEffect(() => {
    let subscription;

    const fetchMechanic = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase
          .from('mechanics')
          .select('name, phone, kyc_status, rating')
          .eq('id', authData.user.id)
          .single();
        if (data) {
          setMechanic(data);
        }

        // Live Realtime listener for rating updates
        subscription = supabase
          .channel('public:mechanics_' + authData.user.id)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'mechanics',
            filter: `id=eq.${authData.user.id}` 
          }, (payload) => {
            setMechanic((prev) => prev ? { ...prev, ...payload.new } : payload.new);
          })
          .subscribe();
      }
    };
    fetchMechanic();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

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
            <Text style={styles.avatarText}>{mechanic?.name ? mechanic.name.substring(0,2).toUpperCase() : 'EX'}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{mechanic?.name || 'Loading...'}</Text>
              {mechanic?.kyc_status === 'approved' && (
                <MaterialCommunityIcons 
                  name="check-decagram" 
                  size={20} 
                  color={theme.colors.success || '#10B981'} 
                  style={{ marginLeft: 4, marginTop: 2 }} 
                />
              )}
            </View>
            <Text style={styles.phone}>{mechanic?.phone || ''}</Text>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FFF" />
              <Text style={styles.ratingText}>{mechanic?.rating ? Number(mechanic.rating).toFixed(1) : 'New'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem 
          icon="account-edit-outline" 
          title="Personal Details" 
          onPress={() => navigation.navigate('ProfilePersonalDetails')}
        />
        <MenuItem icon="file-document-outline" title="My Documents" />
        <MenuItem 
          icon="bank-outline" 
          title="Bank Details" 
          onPress={() => navigation.navigate('ProfileBankDetails')} 
        />
        
        <Text style={styles.sectionTitle}>Settings</Text>
        <MenuItem icon="bell-outline" title="Notifications" onPress={() => navigation.navigate('ExpertNotifications')} />
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
  content: { padding: 24, paddingBottom: 120 },
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
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontFamily: 'Lufga-Bold', fontSize: 22, color: theme.colors.textPrimary },
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
