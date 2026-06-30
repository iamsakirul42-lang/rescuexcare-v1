import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpertContext } from '../../data/ExpertContext';

export default function ExpertHomeScreen() {
  const { isOnline } = useContext(ExpertContext);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hello, Expert</Text>
          <Text style={styles.statusText}>{isOnline ? 'You are online' : 'You are offline'}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={isOnline ? "map-marker-radius" : "sleep"} 
          size={100} 
          color={isOnline ? theme.colors.expertPrimary : theme.colors.border} 
        />
        <Text style={styles.message}>
          {isOnline ? "Waiting for service requests in your area..." : "Go online to start receiving jobs."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  greeting: { fontFamily: 'Lufga-Bold', fontSize: 24, color: '#FFF' },
  statusText: { fontFamily: 'Lufga-Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    fontFamily: 'Lufga-Bold',
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
