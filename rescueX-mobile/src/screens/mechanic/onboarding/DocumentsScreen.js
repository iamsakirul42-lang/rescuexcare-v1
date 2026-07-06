import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { theme } from '../../../theme';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../lib/supabase';

const DocumentUploadCard = ({ title, subtitle, isRequired, isUploaded, onPress, loading }) => (
  <View style={styles.docCard}>
    <View style={styles.docInfo}>
      <Text style={styles.docTitle}>{title} {isRequired && <Text style={{color: theme.colors.error}}>*</Text>}</Text>
      <Text style={styles.docSubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity 
      style={[styles.uploadBtn, isUploaded && styles.uploadedBtn]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.expertPrimary} />
      ) : (
        <>
          <MaterialCommunityIcons 
            name={isUploaded ? "check-circle" : "cloud-upload"} 
            size={24} 
            color={isUploaded ? theme.colors.success : theme.colors.expertPrimary} 
          />
          <Text style={[styles.uploadText, isUploaded && styles.uploadedText]}>
            {isUploaded ? 'Uploaded' : 'Upload'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  </View>
);

export default function DocumentsScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [docs, setDocs] = useState(onboardingData.documents || { aadhaar: null, pan: null, dl: null, certificate: null });
  const [uploadingState, setUploadingState] = useState({});

  const handleUpload = async (key) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingState(prev => ({ ...prev, [key]: true }));
        const asset = result.assets[0];
        
        const base64FileData = asset.base64;
        const fileExt = asset.uri.split('.').pop().toLowerCase() || 'jpg';
        const fileName = `${key}_${Date.now()}.${fileExt}`;
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id || 'anonymous';
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, decode(base64FileData), {
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);

        setDocs(prev => ({ ...prev, [key]: publicUrlData.publicUrl }));
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
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
          loading={uploadingState['aadhaar']}
          onPress={() => handleUpload('aadhaar')}
        />
        <DocumentUploadCard 
          title="PAN Card" 
          subtitle="Front side only"
          isRequired={false}
          isUploaded={!!docs.pan}
          loading={uploadingState['pan']}
          onPress={() => handleUpload('pan')}
        />
        <DocumentUploadCard 
          title="Driving License" 
          subtitle="If applicable"
          isRequired={false}
          isUploaded={!!docs.dl}
          loading={uploadingState['dl']}
          onPress={() => handleUpload('dl')}
        />
        <DocumentUploadCard 
          title="Mechanic Certificate" 
          subtitle="Optional"
          isRequired={false}
          isUploaded={!!docs.certificate}
          loading={uploadingState['certificate']}
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
