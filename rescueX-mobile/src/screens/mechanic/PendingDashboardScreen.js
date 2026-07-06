import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { supabase } from '../../lib/supabase';

export default function PendingDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    });
  };

  React.useEffect(() => {
    let interval;
    
    const checkStatus = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data } = await supabase
        .from('mechanics')
        .select('kyc_status')
        .eq('id', authData.user.id)
        .single();

      if (data?.kyc_status === 'approved') {
        clearInterval(interval);
        navigation.replace('MechanicSplash');
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <Text style={styles.headerTitle}>Expert Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTitle}>Under Review</Text>
          </View>
          <Text style={styles.statusDesc}>
            Your application is currently being reviewed by the RescueX team. This usually takes 24-48 hours.
          </Text>
          
          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
              <Text style={styles.timelineTextDone}>Application Submitted</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.timelineTextPending}>Document Verification</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <MaterialCommunityIcons name="circle-outline" size={20} color={theme.colors.textTertiary} />
              <Text style={styles.timelineTextFuture}>Account Activation</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.supportBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="headset" size={20} color={theme.colors.expertPrimary} />
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>
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
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFF' },
  content: { padding: 24, flex: 1 },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.warningLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
    marginRight: 8,
  },
  statusTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: theme.colors.warning,
  },
  statusDesc: {
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTextDone: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textPrimary, marginLeft: 12 },
  timelineTextPending: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.warning, marginLeft: 12 },
  timelineTextFuture: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textTertiary, marginLeft: 12 },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 9,
    marginVertical: 4,
  },
  footer: { padding: 24 },
  supportBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.expertPrimaryLight,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  supportBtnText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: theme.colors.expertPrimary },
});
