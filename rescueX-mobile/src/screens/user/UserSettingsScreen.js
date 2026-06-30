import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function UserSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccountWarning');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.menuText}>Notifications</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="translate" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.menuText}>Language</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="lock-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.menuText}>Privacy & Security</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="delete-outline" size={24} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 20,
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 52,
  },
});
