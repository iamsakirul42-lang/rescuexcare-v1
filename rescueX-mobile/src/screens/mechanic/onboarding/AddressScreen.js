import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import { ExpertOnboardingContext } from '../../../data/ExpertOnboardingContext';
import OnboardingHeader from './components/OnboardingHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const CITIES = [
  "Alipore", "Anandapur", "B.B.D. Bagh (Dalhousie Square)", "Bagbazar", "Baguiati",
  "Bally", "Ballygunge", "Baranagar", "Barasat", "Barrackpore", "Baruipur", "Behala",
  "Belur", "Bhawanipore", "Bidhannagar (Salt Lake)", "Bowbazar", "Budge Budge",
  "Burrabazar", "Chandannagar", "Chandni Chowk", "Chinsurah", "Chitpur", "College Street",
  "Cossipore", "Dhakuria", "Dum Dum", "EM Bypass Corridor", "Entally", "Esplanade",
  "Garia", "Gariahat", "Howrah", "Jadavpur", "Joka", "Jorasanko", "Kalighat", "Kankurgachi",
  "Kasba", "Kestopur", "Khardaha", "Kumartuli", "Lake Town", "Madhyamgram", "Maheshtala",
  "Maniktala", "Mukundapur", "Nagatala", "Naktala", "New Alipore", "New Town (Action Area I)",
  "New Town (Action Area II)", "New Town (Action Area III)", "Park Circus", "Park Street",
  "Patuli", "Rajarhat", "Rajpur Sonarpur", "Salt Lake (Bidhannagar)", "Santoshpur",
  "Santragachi", "Sealdah", "Serampore", "Shobhabazar", "Shyambazar", "Sinthee",
  "Sodepur", "Tala", "Taltala", "Tangra", "Tollygunge", "Topsia", "Ultadanga"
];

export default function AddressScreen({ navigation }) {
  const { onboardingData, updateData } = useContext(ExpertOnboardingContext);
  const [data, setData] = useState(onboardingData.address);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const isValid = data.city.length > 2 && data.fullAddress.length > 5 && data.pinCode.length === 6;

  const handleNext = () => {
    updateData('address', data);
    navigation.navigate('VehicleExpertise');
  };

  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => {
        setData({ ...data, city: item });
        setShowCityPicker(false);
      }}
    >
      <Text style={[styles.cityItemText, data.city === item && styles.cityItemSelectedText]}>
        {item}
      </Text>
      {data.city === item && <MaterialCommunityIcons name="check" size={20} color={theme.colors.expertPrimary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <OnboardingHeader 
          title="Address Information" 
          subtitle="Where will you be working?"
          step={2} 
          totalSteps={9} 
          onBack={() => navigation.goBack()} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>City *</Text>
          <TouchableOpacity 
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={[styles.dropdownText, !data.city && styles.dropdownPlaceholder]}>
              {data.city || 'Select City'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.label}>Full Address *</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Street, Area, Building..."
            multiline
            value={data.fullAddress}
            onChangeText={(text) => setData({ ...data, fullAddress: text })}
          />

          <Text style={styles.label}>Landmark (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Near hospital, school, etc."
            value={data.landmark}
            onChangeText={(text) => setData({ ...data, landmark: text })}
          />

          <Text style={styles.label}>PIN Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit PIN code"
            keyboardType="number-pad"
            maxLength={6}
            value={data.pinCode}
            onChangeText={(text) => setData({ ...data, pinCode: text })}
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
      </KeyboardAvoidingView>

      {/* City Picker Modal */}
      <Modal visible={showCityPicker} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={renderCityItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  keyboardView: { flex: 1 },
  content: { padding: 24 },
  label: { fontFamily: 'Lufga-Bold', fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dropdownText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: theme.colors.textTertiary,
  },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  btn: {
    backgroundColor: theme.colors.expertPrimary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: theme.colors.border },
  btnText: { fontFamily: 'Lufga-Bold', fontSize: 18, color: '#FFF' },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  cityItemText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  cityItemSelectedText: {
    color: theme.colors.expertPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: 24,
  },
});
