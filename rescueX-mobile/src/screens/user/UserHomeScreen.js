import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LocationPickerModal from '../../components/LocationPickerModal';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const VehicleCard = ({ title, subtitle, imageSource, isTall, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, { height: isTall ? 220 : 180 }]}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Image 
      source={imageSource}
      style={styles.cardImage}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={200}
    />
  </TouchableOpacity>
);

export default function UserHomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedLocation, setSelectedLocation] = useState('Kolkata, WB');
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);

  const handleVehiclePress = (vehicleType) => {
    navigation.getParent()?.navigate('BookingScreen', {
      vehicleType,
      location: selectedLocation,
    }) || navigation.navigate('BookingScreen', {
      vehicleType,
      location: selectedLocation,
    });
  };

  return (
    <View style={styles.mainContainer}>

      <Image
        source={require('../../../assets/images/kolkata-art-transparent.png')}
        style={styles.bgIllustration}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />

      <LinearGradient
        colors={['#ff5e2c', '#e84f21', '#c73e16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => setLocationModalVisible(true)}>
          <Text style={styles.greeting}>Current Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.userName}>{selectedLocation}</Text>
            <MaterialCommunityIcons name="chevron-down" size={28} color="#FFFFFF" style={styles.dropdownIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => navigation.navigate('Categories')}
        >
          <LottieView
            source={require('../../../assets/animations/shopping-cart.json')}
            autoPlay
            loop
            style={{ width: 45, height: 45, tintColor: '#FFFFFF' }}
            colorFilters={[{ keypath: '**', color: '#FFFFFF' }]}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Expert services in minutes</Text>

        <View style={styles.gridContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            <VehicleCard 
              title="Auto" 
              subtitle="Quick rides"
              imageSource={require('../../../assets/images/Auto.png')}
              isTall={false}
              onPress={() => handleVehiclePress('auto')}
            />
            <VehicleCard 
              title="Car" 
              subtitle="Your everyday rides"
              imageSource={require('../../../assets/images/Car.png')}
              isTall={true}
              onPress={() => handleVehiclePress('car')}
            />
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <VehicleCard 
              title="Bike" 
              subtitle="Beat the traffic"
              imageSource={require('../../../assets/images/Bike.png')}
              isTall={true}
              onPress={() => handleVehiclePress('bike')}
            />
            <VehicleCard 
              title="Truck" 
              subtitle="Heavy load"
              imageSource={require('../../../assets/images/Truck.png')}
              isTall={false}
              onPress={() => handleVehiclePress('truck')}
            />
          </View>
        </View>
        
        {/* Extra padding at the bottom for the tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <LocationPickerModal 
        visible={isLocationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={setSelectedLocation}
        selectedLocation={selectedLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bgIllustration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.35,
    opacity: 0.3,
    tintColor: theme.colors.success,
    zIndex: 0,
    transform: [{ scale: 1.15 }],
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#ff5e2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  greeting: {
    ...theme.typography.body,
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userName: {
    ...theme.typography.h1,
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    color: '#FFFFFF',
    fontSize: 28,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    tintColor: theme.colors.success,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  card: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.15)', // Darker, translucent border to show against gradient
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 14,
    color: '#4B5563', // Darker gray
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 24,
    color: '#000000', // Pure black
  },
  cardImage: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: '85%',
    height: '60%',
  },
});
