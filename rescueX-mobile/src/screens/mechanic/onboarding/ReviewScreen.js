import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';
import { supabase } from '../../../lib/supabase';

const ReviewSection = ({ title, onEdit, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value || '—'}</Text>
  </View>
);

export default function ReviewScreen({ navigation }) {
  const { onboardingData } = useContext(ExpertOnboardingContext);
  const { personal, address, vehicles, services, experience, bank, emergency, documents } = onboardingData;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      const userId = authData.user.id;
      
      // Insert into mechanics table
      const { error: mechanicsError } = await supabase
        .from('mechanics')
        .insert({
          id: userId,
          name: personal.fullName || 'Expert',
          phone: personal.mobile || '',
          email: personal.email || '',
          kyc_status: 'pending',
          dob: personal.dob,
          full_address: address.fullAddress,
          pin_code: address.pinCode,
          vehicles: vehicles,
          services: services,
          experience_years: parseInt(experience.years) || 0,
          bank_account_name: bank.holderName,
          bank_account_number: bank.accountNumber,
          bank_name: bank.bankName,
          emergency_contact_name: emergency.name,
          emergency_contact_relation: emergency.relationship,
          emergency_contact_mobile: emergency.mobile
        });
        
      if (mechanicsError) throw mechanicsError;

      // Insert into expert_profiles to satisfy the bookings table foreign key constraint
      const { error: expertProfilesError } = await supabase
        .from('expert_profiles')
        .insert({
          id: userId
        });
        
      if (expertProfilesError) {
        console.warn('Could not insert into expert_profiles:', expertProfilesError);
        // We do not throw here, just in case expert_profiles is populated by a trigger in some environments
      }

      // Insert into kyc_verifications table
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .insert({
          mechanic_id: userId,
          status: 'pending',
          aadhaar_url: documents?.aadhaar || null,
          pan_url: documents?.pan || null,
          license_url: documents?.dl || null,
          rc_url: documents?.certificate || null
        });

      if (kycError) throw kycError;
      
      navigation.navigate('Success');
    } catch (err) {
      Alert.alert('Error Submitting', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader 
        title="Review Application" 
        subtitle="Please check your details before submitting."
        step={9} 
        totalSteps={9} 
        onBack={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ReviewSection title="Personal Information" onEdit={() => navigation.navigate('PersonalInfo')}>
          <DataRow label="Name" value={personal.fullName} />
          <DataRow label="Mobile" value={personal.mobile} />
          <DataRow label="Email" value={personal.email} />
          <DataRow label="DOB" value={personal.dob} />
        </ReviewSection>

        <ReviewSection title="Address Details" onEdit={() => navigation.navigate('Address')}>
          <DataRow label="City" value={address.city} />
          <DataRow label="Address" value={address.fullAddress} />
          <DataRow label="PIN Code" value={address.pinCode} />
        </ReviewSection>

        <ReviewSection title="Expertise" onEdit={() => navigation.navigate('VehicleExpertise')}>
          <DataRow label="Vehicles" value={vehicles.join(', ')} />
          <DataRow label="Services" value={services.join(', ')} />
          <DataRow label="Experience" value={`${experience.years} years`} />
        </ReviewSection>

        <ReviewSection title="Documents" onEdit={() => navigation.navigate('Documents')}>
          <DataRow label="Aadhaar" value={documents?.aadhaar ? 'Uploaded' : 'Pending'} />
          <DataRow label="PAN Card" value={documents?.pan ? 'Uploaded' : 'Pending'} />
          <DataRow label="Driving License" value={documents?.dl ? 'Uploaded' : 'Pending'} />
          <DataRow label="Certificate" value={documents?.certificate ? 'Uploaded' : 'Pending'} />
        </ReviewSection>

        <ReviewSection title="Bank Details" onEdit={() => navigation.navigate('BankDetails')}>
          <DataRow label="Account Name" value={bank.holderName} />
          <DataRow label="Account No." value={bank.accountNumber} />
          <DataRow label="Bank Name" value={bank.bankName} />
        </ReviewSection>

        <ReviewSection title="Emergency Contact" onEdit={() => navigation.navigate('EmergencyContact')}>
          <DataRow label="Contact Name" value={emergency.name} />
          <DataRow label="Relationship" value={emergency.relationship} />
          <DataRow label="Mobile" value={emergency.mobile} />
        </ReviewSection>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit Application'}</Text>
          {!loading && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { padding: 24, paddingBottom: 40 },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: theme.colors.expertPrimaryLight,
    borderRadius: 8,
  },
  editText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: theme.colors.expertPrimary,
  },
  sectionContent: {
    padding: 16,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dataLabel: {
    width: 120,
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  dataValue: {
    flex: 1,
    fontFamily: 'Lufga-Bold',
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
