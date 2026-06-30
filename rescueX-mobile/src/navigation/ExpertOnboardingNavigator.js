import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/mechanic/onboarding/WelcomeScreen';
import PersonalInfoScreen from '../screens/mechanic/onboarding/PersonalInfoScreen';
import AddressScreen from '../screens/mechanic/onboarding/AddressScreen';
import VehicleExpertiseScreen from '../screens/mechanic/onboarding/VehicleExpertiseScreen';
import ServicesScreen from '../screens/mechanic/onboarding/ServicesScreen';
import ExperienceScreen from '../screens/mechanic/onboarding/ExperienceScreen';
import DocumentsScreen from '../screens/mechanic/onboarding/DocumentsScreen';
import BankDetailsScreen from '../screens/mechanic/onboarding/BankDetailsScreen';
import EmergencyContactScreen from '../screens/mechanic/onboarding/EmergencyContactScreen';
import ReviewScreen from '../screens/mechanic/onboarding/ReviewScreen';
import SuccessScreen from '../screens/mechanic/onboarding/SuccessScreen';

const Stack = createNativeStackNavigator();

export default function ExpertOnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="VehicleExpertise" component={VehicleExpertiseScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
      <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}
