import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { theme } from '../../theme';

export default function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        const stored = await AsyncStorage.getItem(`user_addresses_${userId}`);
        if (stored) {
          setAddresses(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (userId) {
        const newAddresses = addresses.filter(a => a.id !== id);
        setAddresses(newAddresses);
        await AsyncStorage.setItem(`user_addresses_${userId}`, JSON.stringify(newAddresses));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#ff5e2c" style={{ marginTop: 40 }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No saved addresses yet</Text>
            <Text style={styles.emptySubtext}>Addresses you use for booking will appear here.</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeaderRow}>
                <View style={styles.addressTypeContainer}>
                  <MaterialCommunityIcons 
                    name={address.type === 'Home' ? 'home' : address.type === 'Work' ? 'office-building' : 'map-marker'} 
                    size={20} 
                    color="#ff5e2c" 
                  />
                  <Text style={styles.addressType}>{address.type || 'Address'}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteAddress(address.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addressText}>{address.fullAddress}</Text>
              {address.landmark ? <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24,
    backgroundColor: '#ff5e2c', borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontFamily: 'Lufga-Bold', fontSize: 20, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  addressCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F3F4F6'
  },
  addressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  addressType: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#ff5e2c', marginLeft: 8 },
  addressText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#4B5563', lineHeight: 20 },
  landmarkText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#4B5563', marginTop: 16 },
  emptySubtext: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }
});
