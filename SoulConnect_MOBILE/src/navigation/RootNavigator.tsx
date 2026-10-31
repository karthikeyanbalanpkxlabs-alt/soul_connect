import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {AboutScreen} from '../screens/AboutScreen';
import {ContactScreen} from '../screens/ContactScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {LegalScreen} from '../screens/LegalScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {PaymentScreen} from '../screens/PaymentScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {CustomerTabs} from '../screens/portal/CustomerTabs';
import {ProfileDetailScreen} from '../screens/portal/ProfileDetailScreen';
import {StaffNavigator} from '../screens/portal/StaffNavigator';
import {colors} from '../theme/colors';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {authenticated, isStaff} = useAuth();
  const initialRouteName = !authenticated ? 'Home' : isStaff ? 'StaffApp' : 'CustomerApp';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.plum,
        headerTitleStyle: {color: colors.ink},
        contentStyle: {backgroundColor: colors.surface},
      }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Register'}} />
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false, title: 'Sign in'}} />
      <Stack.Screen name="About" component={AboutScreen} options={{title: 'About'}} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{title: 'Contact'}} />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={({route}) => ({title: route.params.kind === 'privacy' ? 'Privacy' : 'Terms'})}
      />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{title: 'Payment'}} />
      <Stack.Screen name="CustomerApp" component={CustomerTabs} options={{headerShown: false}} />
      <Stack.Screen name="StaffApp" component={StaffNavigator} options={{headerShown: false}} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{title: 'Profile'}} />
    </Stack.Navigator>
  );
}
