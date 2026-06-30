import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import Svg, { Path } from 'react-native-svg';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserHistoryScreen from '../screens/user/UserHistoryScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import CategoriesScreen from '../screens/user/CategoriesScreen';

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
        <Path d={path} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth={2} />
      </Svg>
    </View>
  );
};

const SOSButton = ({ onPress }) => {
  return (
    <View style={styles.sosContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.sosButton}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function UserMainTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#ff5e2c',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <TabBarBackground />,
          tabBarAllowFontScaling: false,
          tabBarItemStyle: { zIndex: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 15, paddingTop: Platform.OS === 'ios' ? 10 : 5 },
          tabBarLabelStyle: { fontSize: 10, fontFamily: 'AgeoTrial-Bold', fontWeight: 'bold', textAlign: 'center' },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={UserHomeScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home-variant" size={26} color={color} />
            )
          }}
        />
        
        <Tab.Screen 
          name="Categories" 
          component={CategoriesScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="view-grid-outline" size={24} color={color} />
            )
          }}
        />

        <Tab.Screen 
          name="SOS" 
          component={UserHomeScreen} // Dummy
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => (
              <SOSButton onPress={() => console.log('SOS Pressed!')} />
            ),
          }}
        />

        <Tab.Screen 
          name="History" 
          component={UserHistoryScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="history" size={26} color={color} />
            )
          }}
        />

        <Tab.Screen 
          name="Account" 
          component={UserProfileScreen} 
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
  sosContainer: {
    flex: 1,
    top: -30, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  sosButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DD4646', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DD4646',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
