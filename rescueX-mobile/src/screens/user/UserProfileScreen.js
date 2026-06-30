import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

const MenuOption = ({ icon, title, subtitle, onPress, isDestructive }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconContainer, isDestructive && { backgroundColor: '#FEE2E2' }]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={isDestructive ? '#EF4444' : theme.colors.primary} 
      />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function UserProfileScreen({ navigation }) {
  // Dummy user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210'
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../../assets/images/user-icon.png')}
              style={styles.avatar}
              contentFit="contain"
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userText}>{user.phone}</Text>
            <Text style={styles.userText}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.cardContainer}>
            <MenuOption icon="account-outline" title="Personal Info" subtitle="Update your details" />
            <View style={styles.divider} />
            <MenuOption icon="map-marker-outline" title="Saved Addresses" subtitle="Manage your locations" />
            <View style={styles.divider} />
            <MenuOption icon="credit-card-outline" title="Payment Methods" subtitle="Cards & Wallets" />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.cardContainer}>
            <MenuOption 
              icon="cog-outline" 
              title="Settings" 
              subtitle="App preferences" 
              onPress={() => navigation.navigate('UserSettings')}
            />
            <View style={styles.divider} />
            <MenuOption icon="help-circle-outline" title="Help & Support" subtitle="Get assistance" />
          </View>
        </View>

        <View style={[styles.sectionContainer, { marginBottom: 120 }]}>
          <View style={styles.cardContainer}>
            <MenuOption 
              icon="logout" 
              title="Log Out" 
              isDestructive={true} 
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'RoleSelection' }],
                });
              }}
            />
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 32,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(249,115,22,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    tintColor: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userText: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 12,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 76,
  },
});

