import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DeleteAccountConfirmScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { reason, customReason } = route.params || {};

  const handleDelete = () => {
    // In a real app, you would make an API call here to mark the account as pending deletion.
    // passing reason and customReason to the backend.
    
    navigation.navigate('DeleteAccountSuccess');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningIconContainer}>
          <MaterialCommunityIcons name="help-circle-outline" size={60} color="#EF4444" />
        </View>

        <Text style={styles.title}>Are you sure you want to delete your account?</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 24,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#4B5563',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
