import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Dimensions, Alert, Image, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import LocationPickerModal from '../../components/LocationPickerModal';
import UserIcon from '../../components/UserIcon';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation, route }) {
  const { role } = route.params; // 'user' or 'expert'
  const isExpert = role === 'expert';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (!name || !email || !phone || !city || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          }
        }
      });

      if (error) throw error;

      // 2. Create profile record in public.profiles
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: role,
            full_name: name,
            email: email,
            mobile: phone,
            city: city
          });

        if (profileError) throw profileError;
      }

      // 3. Navigate
      if (isExpert) {
        navigation.replace('ExpertOnboarding');
      } else {
        navigation.replace('UserSplash');
      }
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, !isExpert && { backgroundColor: '#FFFFFF' }]}>

      {/* Background Illustration */}
      <Image
        source={require('../../../assets/images/kolkata-art-transparent.png')}
        style={styles.bgIllustration}
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient
          colors={isExpert 
            ? [theme.colors.expertPrimary, '#4C1D95', '#2E1065'] 
            : ['#ff5e2c', '#e84f21', '#c73e16']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fixedHeader, { paddingTop: Math.max(insets.top, 20) + 10 }]}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.backBtn} 
              activeOpacity={0.7}
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(() => navigation.goBack(), 50);
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={[styles.roleIconCircle, isExpert ? styles.expertIconCircle : styles.userIconCircle]}>
              {isExpert ? (
                <Image
                  source={require('../../../assets/images/expert-icon.png')}
                  style={styles.customIcon}
                  resizeMode="contain"
                />
              ) : (
                <UserIcon width={85} height={85} />
              )}
            </View>
            {isExpert && (
              <View style={[styles.roleBadge, styles.expertBadge]}>
                <Text style={[styles.roleBadgeText, styles.expertBadgeText]}>
                  EXPERT
                </Text>
              </View>
            )}
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              {isExpert
                ? 'Join as an expert and start earning'
                : 'Sign up to get roadside assistance'}
            </Text>
          </View>
        </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* City / Area */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>City / Area</Text>
                <TouchableOpacity 
                  style={[styles.inputRow, { paddingVertical: 12 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss();
                    setLocationModalVisible(true);
                  }}
                >
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <Text style={[styles.input, { flex: 1, paddingVertical: 0, color: city ? theme.colors.textPrimary : theme.colors.textTertiary }]}>
                    {city || "Select area or city"}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <MaterialCommunityIcons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Fixed Bottom Section */}
            <View style={styles.fixedBottom}>
              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.signupBtn, isExpert ? styles.expertBtn : styles.userBtn, loading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.signupBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen', { role })}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

      <LocationPickerModal 
        visible={isLocationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={setCity}
        selectedLocation={city}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF6E5',
  },
  bgIllustration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.25,
    opacity: 0.2,
    tintColor: '#FF7A00',
    zIndex: 0,
    transform: [{ scale: 1.15 }],
  },
  keyboardView: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  fixedBottom: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roleIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  customIcon: {
    width: 60,
    height: 60,
  },
  userIconCircle: {
    backgroundColor: 'transparent',
  },
  expertIconCircle: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roleBadge: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  expertBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roleBadgeText: {
    ...theme.typography.small,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  userBadgeText: {
    color: '#1A1A1A',
  },
  expertBadgeText: {
    color: '#1A1A1A',
  },
  headerTitle: {
    ...theme.typography.h1,
    color: '#FFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  userBtn: {
    backgroundColor: '#ff5e2c',
  },
  expertBtn: {
    backgroundColor: theme.colors.accent,
  },
  signupBtnText: {
    ...theme.typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 17,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    ...theme.typography.bodyBold,
    color: theme.colors.accent,
  },
});
