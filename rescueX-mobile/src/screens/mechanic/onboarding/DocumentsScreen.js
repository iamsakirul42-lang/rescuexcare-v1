import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';

const DocumentUploadCard = ({ title, subtitle, isRequired, isUploaded, onPress }) => (
  <View style={styles.docCard}>
    <View style={styles.docInfo}>
      <Text style={styles.docTitle}>{title} {isRequired && <Text style={{color: theme.colors.error}}>*</Text>}</Text>
      <Text style={styles.docSubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity 
      style={[styles.uploadBtn, isUploaded && styles.uploadedBtn]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={isUploaded ? "check-circle" : "cloud-upload"} 
        size={24} 
        color={isUploaded ? theme.colors.success : theme.colors.expertPrimary} 
      />
      <Text style={[styles.uploadText, isUploaded && styles.uploadedText]}>
        {isUploaded ? 'Uploaded' : 'Upload'}
      </Text>
    </TouchableOpacity>
  </View>
);

export default function DocumentsScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [docs, setDocs] = useState(onboardingData.documents || { aadhaar: null, pan: null, dl: null, certificate: null });

  // Mock upload functionality for MVP
  const handleUpload = (key) => {
    setDocs({ ...docs, [key]: 'mock_file_url' });
  };

  const isValid = docs.aadhaar !== null;

  const handleNext = () => {
    updateData('documents', docs);
    navigation.navigate('BankDetails');
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader 
        title="Upload Documents" 
        subtitle="We need these to verify your identity."
        step={6} 
        totalSteps={9} 
        onBack={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        <DocumentUploadCard 
          title="Aadhaar Card" 
          subtitle="Front & Back (JPG/PNG/PDF)"
          isRequired={true}
          isUploaded={!!docs.aadhaar}
          onPress={() => handleUpload('aadhaar')}
        />
        <DocumentUploadCard 
          title="PAN Card" 
          subtitle="Front side only"
          isRequired={false}
          isUploaded={!!docs.pan}
          onPress={() => handleUpload('pan')}
        />
        <DocumentUploadCard 
          title="Driving License" 
          subtitle="If applicable"
          isRequired={false}
          isUploaded={!!docs.dl}
          onPress={() => handleUpload('dl')}
        />
        <DocumentUploadCard 
          title="Mechanic Certificate" 
          subtitle="Optional"
          isRequired={false}
          isUploaded={!!docs.certificate}
          onPress={() => handleUpload('certificate')}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btn, !isValid && styles.btnDisabled]} 
          disabled={!isValid}
          onPress={handleNext}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { padding: 24 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  docInfo: {
    flex: 1,
    paddingRight: 16,
  },
  docTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  docSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.expertPrimaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadedBtn: {
    backgroundColor: theme.colors.successLight,
  },
  uploadText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 12,
    color: theme.colors.expertPrimary,
    marginLeft: 6,
  },
  uploadedText: {
    color: theme.colors.success,
  },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  btn: { backgroundColor: theme.colors.expertPrimary, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: theme.colors.border },
  btnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },
});
