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
import UserIcon from '../../components/UserIcon';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }) {
  const { role } = route.params; // 'user' or 'expert'
  const isExpert = role === 'expert';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Determine role logic
      if (isExpert) {
        const { data: profile, error: profileError } = await supabase
          .from('mechanics')
          .select('kyc_status')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          // If no profile exists, they haven't finished onboarding
          navigation.replace('ExpertOnboarding');
        } else if (profile.kyc_status === 'pending' || profile.kyc_status === 'rejected') {
          // Under review or rejected
          navigation.replace('PendingDashboard');
        } else {
          // Approved
          navigation.replace('MechanicSplash');
        }
      } else {
        navigation.replace('UserSplash', { isLogin: true });
      }
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: '#FFFFFF' }]}>
      {/* Background Illustration */}
      <Image
        source={require('../../../assets/images/kolkata-art-transparent.png')}
        style={styles.bgIllustration}
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>
              Log in to your account
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

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View style={styles.fixedBottom}>
            <TouchableOpacity
              style={[styles.loginBtn, isExpert ? styles.expertBtn : styles.userBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>{loading ? 'Logging In...' : 'Log In'}</Text>
              {!loading && <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />}
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: width * 0.45,
    height: 70,
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
    marginBottom: 28,
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
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  loginBtn: {
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
  loginBtnText: {
    ...theme.typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 17,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    ...theme.typography.bodyBold,
    color: theme.colors.accent,
  },
});
