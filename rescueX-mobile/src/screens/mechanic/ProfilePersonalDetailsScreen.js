import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ExpertOnboardingContext } from '../../data/ExpertOnboardingContext';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfilePersonalDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { onboardingData } = useContext(ExpertOnboardingContext);
  const data = onboardingData.personal;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Personal Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <Text style={styles.fieldValue}>{data.fullName || 'Not Provided'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <Text style={styles.fieldValue}>{data.mobile ? `+91 ${data.mobile}` : 'Not Provided'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <Text style={styles.fieldValue}>{data.email || 'Not Provided'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.fieldValue}>{data.dob || 'Not Provided'}</Text>
          </View>
        </View>

        <View style={styles.noticeContainer}>
          <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.success || '#10B981'} style={styles.noticeIcon} />
          <Text style={styles.noticeText}>
            These details are approved by the RescueX team and cannot be changed directly. Please contact support if you need to update them.
          </Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  content: { padding: 24 },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  fieldRow: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  noticeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
