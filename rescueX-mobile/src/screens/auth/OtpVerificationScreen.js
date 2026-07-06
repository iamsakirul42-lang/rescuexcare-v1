import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions, Alert, Image, Keyboard,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function OtpVerificationScreen({ navigation, route }) {
  const { email, password, name, phone, city, role } = route.params;
  const isExpert = role === 'expert';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setResending(true);
    try {
      // In Supabase, calling resend() is possible, or calling signUp again triggers a new email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      
      setTimeLeft(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 8) {
      Alert.alert('Incomplete Code', 'Please enter the full 8-digit code.');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    
    try {
      // 1. Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpValue,
        type: 'signup',
      });

      if (error) throw error;

      // 2. Create the profile now that they are fully authenticated
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
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
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, !isExpert && { backgroundColor: '#FFFFFF' }]}>
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
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="email-check-outline" size={48} color={isExpert ? theme.colors.expertPrimary : '#ff5e2c'} />
            </View>
            <Text style={styles.headerTitle}>Verify Email</Text>
            <Text style={styles.headerSubtitle}>
              We've sent an 8-digit code to{'\n'}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.instruction}>Enter the code to verify your account</Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput, 
                  digit ? (isExpert ? styles.expertInputFilled : styles.userInputFilled) : null
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            {timeLeft > 0 ? (
              <Text style={styles.timerText}>Resend code in <Text style={{fontWeight: 'bold'}}>{timeLeft}s</Text></Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={[styles.resendText, isExpert ? {color: theme.colors.expertPrimary} : {color: '#ff5e2c'}]}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.fixedBottom}>
          <TouchableOpacity
            style={[styles.verifyBtn, isExpert ? styles.expertBtn : styles.userBtn, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
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
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  instruction: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 32,
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Lufga-Bold',
    color: theme.colors.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInputFilled: {
    borderColor: '#ff5e2c',
    backgroundColor: 'rgba(255, 94, 44, 0.05)',
  },
  expertInputFilled: {
    borderColor: theme.colors.expertPrimary,
    backgroundColor: 'rgba(59, 23, 117, 0.05)',
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  resendText: {
    ...theme.typography.bodyBold,
  },
  fixedBottom: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 32,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
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
  verifyBtnText: {
    ...theme.typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 17,
  },
});
