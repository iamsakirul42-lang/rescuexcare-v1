import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function DeleteAccountSuccessScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle-outline" size={100} color="#22C55E" />
        </View>

        <Text style={styles.title}>Account Deletion Request Submitted</Text>
        
        <Text style={styles.description}>
          Your account has been scheduled for deletion. We're sorry to see you leave.
        </Text>
        
        <Text style={styles.description}>
          If you change your mind before the deletion process is completed, please contact RescueX Support.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RoleSelection' }],
            });
          }}
        >
          <Text style={styles.returnText}>Return to Welcome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Lufga-Bold',
    fontSize: 24,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontFamily: 'Lufga-Bold',
    fontWeight: 'normal',
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    padding: 24,
  },
  returnButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnText: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
