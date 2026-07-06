import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BookingProvider } from './src/data/bookingStore';
import { ExpertOnboardingProvider } from './src/data/ExpertOnboardingContext';
import { WalletProvider } from './src/data/WalletContext';
import { ExpertProvider } from './src/data/ExpertContext';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import ExpertOnboardingNavigator from './src/navigation/ExpertOnboardingNavigator';
import PendingDashboardScreen from './src/screens/mechanic/PendingDashboardScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OtpVerificationScreen from './src/screens/auth/OtpVerificationScreen';
import UserSplash from './src/screens/user/UserSplash';
import UserSettingsScreen from './src/screens/user/UserSettingsScreen';
import DeleteAccountWarningScreen from './src/screens/user/DeleteAccountWarningScreen';
import DeleteAccountReasonScreen from './src/screens/user/DeleteAccountReasonScreen';
import DeleteAccountConfirmScreen from './src/screens/user/DeleteAccountConfirmScreen';
import DeleteAccountSuccessScreen from './src/screens/user/DeleteAccountSuccessScreen';
import MechanicSplash from './src/screens/mechanic/MechanicSplash';
import UserMainTabs from './src/navigation/UserMainTabs';
import ExpertMainTabs from './src/navigation/ExpertMainTabs';
import ExpertWithdrawScreen from './src/screens/mechanic/ExpertWithdrawScreen';
import ExpertWithdrawSuccessScreen from './src/screens/mechanic/ExpertWithdrawSuccessScreen';
import BookingScreen from './src/screens/user/BookingScreen';
import BookingConfirmedScreen from './src/screens/user/BookingConfirmedScreen';
import BookingStatusScreen from './src/screens/user/BookingStatusScreen';
import PaymentScreen from './src/screens/user/PaymentScreen';
import RatingScreen from './src/screens/user/RatingScreen';
import BookingCompletedScreen from './src/screens/user/BookingCompletedScreen';
import ProfilePersonalDetailsScreen from './src/screens/mechanic/ProfilePersonalDetailsScreen';
import ProfileBankDetailsScreen from './src/screens/mechanic/ProfileBankDetailsScreen';
import ChangeBankRequestScreen from './src/screens/mechanic/ChangeBankRequestScreen';
import ChangeBankSuccessScreen from './src/screens/mechanic/ChangeBankSuccessScreen';
import CartScreen from './src/screens/user/CartScreen';
import CheckoutAddressScreen from './src/screens/user/CheckoutAddressScreen';
import CheckoutDateScreen from './src/screens/user/CheckoutDateScreen';
import CheckoutTimeScreen from './src/screens/user/CheckoutTimeScreen';
import CheckoutNotesScreen from './src/screens/user/CheckoutNotesScreen';
import CheckoutSummaryScreen from './src/screens/user/CheckoutSummaryScreen';
import CheckoutPaymentScreen from './src/screens/user/CheckoutPaymentScreen';
import CheckoutConfirmedScreen from './src/screens/user/CheckoutConfirmedScreen';
import ServiceDetailsScreen from './src/screens/user/ServiceDetailsScreen';
import UserBookingDetailsScreen from './src/screens/user/UserBookingDetailsScreen';
import ExpertActiveJobScreen from './src/screens/mechanic/ExpertActiveJobScreen';
import ExpertNotificationsScreen from './src/screens/mechanic/ExpertNotificationsScreen';
import UserNotificationsScreen from './src/screens/user/UserNotificationsScreen';
import SavedAddressesScreen from './src/screens/user/SavedAddressesScreen';
import { syncServicePricing } from './src/data/categoriesMarketplace';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.ttf'),
    'AgeoTrial-Bold': require('./assets/fonts/AgeoTrial-Bold.ttf'),
    'Rockybilly': require('./assets/fonts/Rockybilly.ttf'),
    'Lufga-Bold': require('./assets/fonts/Lufga-Bold.ttf'),
  });

  useEffect(() => {
    syncServicePricing();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <BookingProvider>
      <ExpertOnboardingProvider>
        <WalletProvider>
          <ExpertProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen name="ExpertOnboarding" component={ExpertOnboardingNavigator} />
              <Stack.Screen name="PendingDashboard" component={PendingDashboardScreen} />
              <Stack.Screen name="UserSignup" component={SignupScreen} initialParams={{ role: 'user' }} />
              <Stack.Screen name="ExpertSignup" component={SignupScreen} initialParams={{ role: 'expert' }} />
              <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="UserSplash" component={UserSplash} />
              <Stack.Screen name="UserSettings" component={UserSettingsScreen} />
              <Stack.Screen name="DeleteAccountWarning" component={DeleteAccountWarningScreen} />
              <Stack.Screen name="DeleteAccountReason" component={DeleteAccountReasonScreen} />
              <Stack.Screen name="DeleteAccountConfirm" component={DeleteAccountConfirmScreen} />
              <Stack.Screen name="DeleteAccountSuccess" component={DeleteAccountSuccessScreen} />
              <Stack.Screen name="MechanicSplash" component={MechanicSplash} />
              <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
              <Stack.Screen name="UserNotifications" component={UserNotificationsScreen} />
              <Stack.Screen name="UserMainTabs" component={UserMainTabs} />
              <Stack.Screen name="ExpertMainTabs" component={ExpertMainTabs} />
              <Stack.Screen name="ExpertWithdraw" component={ExpertWithdrawScreen} />
              <Stack.Screen name="ExpertWithdrawSuccess" component={ExpertWithdrawSuccessScreen} />
              <Stack.Screen name="ExpertNotifications" component={ExpertNotificationsScreen} />
              <Stack.Screen name="ProfilePersonalDetails" component={ProfilePersonalDetailsScreen} />
              <Stack.Screen name="ProfileBankDetails" component={ProfileBankDetailsScreen} />
              <Stack.Screen name="ChangeBankRequest" component={ChangeBankRequestScreen} />
              <Stack.Screen name="ChangeBankSuccess" component={ChangeBankSuccessScreen} />
              <Stack.Screen name="CartScreen" component={CartScreen} />
              <Stack.Screen name="CheckoutAddressScreen" component={CheckoutAddressScreen} />
              <Stack.Screen name="CheckoutDateScreen" component={CheckoutDateScreen} />
              <Stack.Screen name="CheckoutTimeScreen" component={CheckoutTimeScreen} />
              <Stack.Screen name="CheckoutNotesScreen" component={CheckoutNotesScreen} />
              <Stack.Screen name="CheckoutSummaryScreen" component={CheckoutSummaryScreen} />
              <Stack.Screen name="CheckoutPaymentScreen" component={CheckoutPaymentScreen} />
              <Stack.Screen name="CheckoutConfirmedScreen" component={CheckoutConfirmedScreen} />
              <Stack.Screen name="ServiceDetailsScreen" component={ServiceDetailsScreen} />
              <Stack.Screen name="UserBookingDetailsScreen" component={UserBookingDetailsScreen} />
              <Stack.Screen name="ExpertActiveJobScreen" component={ExpertActiveJobScreen} />
              <Stack.Screen name="BookingScreen" component={BookingScreen} />
              <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
              <Stack.Screen name="BookingStatus" component={BookingStatusScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Rating" component={RatingScreen} />
              <Stack.Screen name="BookingCompleted" component={BookingCompletedScreen} />
            </Stack.Navigator>
            </NavigationContainer>
          </ExpertProvider>
        </WalletProvider>
      </ExpertOnboardingProvider>
    </BookingProvider>
  );
}
