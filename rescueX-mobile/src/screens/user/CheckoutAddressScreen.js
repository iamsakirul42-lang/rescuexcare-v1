import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MOCK_SAVED_ADDRESSES = [
  { id: '1', type: 'Home', fullAddress: '123, Palm Grove Apartments, Andheri West', landmark: 'Near Metro Station' },
  { id: '2', type: 'Work', fullAddress: '45, Tech Park, Malad East', landmark: 'Opposite Mall' }
];

export default function CheckoutAddressScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [selectedAddressId, setSelectedAddressId] = useState(MOCK_SAVED_ADDRESSES[0].id);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullAddress: '', landmark: '' });

  const handleNext = () => {
    let finalAddress = null;
    if (isAddingNew) {
      if (!newAddress.fullAddress.trim()) {
        alert('Please enter your full address');
        return;
      }
      finalAddress = { ...newAddress, type: 'Other' };
    } else {
      finalAddress = MOCK_SAVED_ADDRESSES.find(a => a.id === selectedAddressId);
    }
    
    navigation.navigate('CheckoutDateScreen', { address: finalAddress });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Address</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!isAddingNew ? (
          <>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {MOCK_SAVED_ADDRESSES.map((address) => (
              <TouchableOpacity 
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddressId === address.id && styles.addressCardSelected
                ]}
                onPress={() => setSelectedAddressId(address.id)}
              >
                <View style={styles.addressHeaderRow}>
                  <View style={styles.addressTypeContainer}>
                    <MaterialCommunityIcons 
                      name={address.type === 'Home' ? 'home' : 'office-building'} 
                      size={20} 
                      color={selectedAddressId === address.id ? '#ff5e2c' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.addressType,
                      selectedAddressId === address.id && { color: '#ff5e2c' }
                    ]}>{address.type}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name={selectedAddressId === address.id ? 'radiobox-marked' : 'radiobox-blank'} 
                    size={24} 
                    color={selectedAddressId === address.id ? '#ff5e2c' : '#D1D5DB'} 
                  />
                </View>
                <Text style={styles.addressText}>{address.fullAddress}</Text>
                {address.landmark ? <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text> : null}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={() => setIsAddingNew(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#ff5e2c" />
              <Text style={styles.addNewText}>Add New Address</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Add New Address</Text>
            
            <Text style={styles.inputLabel}>Full Address *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="House/Flat No, Building Name, Street..."
              value={newAddress.fullAddress}
              onChangeText={(t) => setNewAddress({...newAddress, fullAddress: t})}
              multiline
            />

            <Text style={styles.inputLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Near Apollo Hospital"
              value={newAddress.landmark}
              onChangeText={(t) => setNewAddress({...newAddress, landmark: t})}
            />

            <TouchableOpacity 
              style={styles.cancelNewButton}
              onPress={() => setIsAddingNew(false)}
            >
              <Text style={styles.cancelNewText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#1A1A1A', marginBottom: 16 },
  addressCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F3F4F6'
  },
  addressCardSelected: { borderColor: '#ff5e2c', backgroundColor: '#ff5e2c05' },
  addressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  addressType: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#1A1A1A', marginLeft: 8 },
  addressText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 14, color: '#4B5563', lineHeight: 20 },
  landmarkText: { fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  addNewButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16,
    borderWidth: 1.5, borderColor: '#ff5e2c', borderRadius: 12, borderStyle: 'dashed'
  },
  addNewText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#ff5e2c', marginLeft: 8 },
  inputLabel: { fontFamily: 'Lufga-Bold', fontSize: 14, color: '#4B5563', marginBottom: 8, marginTop: 16 },
  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 16, fontFamily: 'Lufga-Bold', fontWeight: 'normal', fontSize: 15, color: '#1A1A1A',
    minHeight: 56, textAlignVertical: 'top'
  },
  cancelNewButton: { alignItems: 'center', marginTop: 24, padding: 12 },
  cancelNewText: { fontFamily: 'Lufga-Bold', fontSize: 15, color: '#6B7280' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  nextButton: { backgroundColor: '#ff5e2c', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { fontFamily: 'Lufga-Bold', fontSize: 16, color: '#FFFFFF' }
});
