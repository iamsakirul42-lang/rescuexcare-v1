import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';

import ExpertHomeScreen from '../screens/mechanic/ExpertHomeScreen';
import ExpertJobsScreen from '../screens/mechanic/ExpertJobsScreen';
import ExpertWalletScreen from '../screens/mechanic/ExpertWalletScreen';
import ExpertProfileScreen from '../screens/mechanic/ExpertProfileScreen';
import { ExpertContext } from '../data/ExpertContext';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// SVG Background with a curved notch and border
const TabBarBackground = () => {
  const center = width / 2;
  const r = 38; // Radius of the cutout
  const offset = 20; // Smooth curve offset
  
  // Custom cubic bezier path for a smooth notch
  const path = `
    M 0 0 
    L ${center - r - offset} 0
    C ${center - r} 0, ${center - r} ${r}, ${center} ${r}
    C ${center + r} ${r}, ${center + r} 0, ${center + r + offset} 0
    L ${width} 0 
    L ${width} 100 
    L 0 100 
    Z
  `;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={100} viewBox={`0 0 ${width} 100`}>
        <Path d={path} fill="#FFFFFF" stroke={theme.colors.borderLight} strokeWidth={2} />
      </Svg>
    </View>
  );
};

// Center FAB Button
const CenterButton = ({ onPress, isOnline }) => {
  return (
    <View style={styles.centerBtnContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.centerButton, 
          { backgroundColor: isOnline ? theme.colors.success || '#10B981' : theme.colors.error || '#EF4444' },
          { shadowColor: isOnline ? theme.colors.success || '#10B981' : theme.colors.error || '#EF4444' }
        ]}
      >
        <MaterialCommunityIcons name="power" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default function ExpertMainTabs() {
  const { isOnline, setIsOnline } = useContext(ExpertContext);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.colors.expertPrimary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <TabBarBackground />,
          tabBarAllowFontScaling: false,
          tabBarItemStyle: { zIndex: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 15, paddingTop: Platform.OS === 'ios' ? 10 : 5 },
          tabBarLabelStyle: { fontSize: 10, fontFamily: 'Lufga-Bold', textAlign: 'center' },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={ExpertHomeScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home-variant" size={26} color={color} />
            )
          }}
        />
        
        <Tab.Screen 
          name="Jobs" 
          component={ExpertJobsScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="briefcase-outline" size={24} color={color} />
            )
          }}
        />

        <Tab.Screen 
          name="GoOnline" 
          component={ExpertHomeScreen} // Dummy component, action handled by button
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => (
              <CenterButton isOnline={isOnline} onPress={() => setIsOnline(!isOnline)} />
            ),
          }}
        />

        <Tab.Screen 
          name="Wallet" 
          component={ExpertWalletScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="wallet-outline" size={26} color={color} />
            )
          }}
        />

        <Tab.Screen 
          name="Profile" 
          component={ExpertProfileScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-outline" size={26} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 85,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  centerBtnContainer: {
    flex: 1,
    top: -30, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.expertPrimary, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.expertPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
