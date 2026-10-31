import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button} from '../../components/ui/Button';
import {useAuth} from '../../context/AuthContext';
import {resetToHome} from '../../navigation/resetToHome';
import {StaffStackParamList} from '../../navigation/types';
import {displayName} from '../../services/api';
import {colors} from '../../theme/colors';
import {MenuRow} from './CustomerTabs';
import {DashboardScreen} from './DashboardScreen';
import {RecordListScreen} from './RecordListScreen';

const Stack = createNativeStackNavigator<StaffStackParamList>();

function StaffMenuScreen({navigation}: NativeStackScreenProps<StaffStackParamList, 'StaffMenu'>) {
  const {profile, role, signOut} = useAuth();
  const manager = role === 'manager_g' || profile?.role === 'manager_g';
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{displayName(profile || {})}</Text>
      <Text style={styles.role}>{role.replace(/_g/g, '')}</Text>
      <MenuRow label="Dashboard" detail="Profiles, plans, and districts" onPress={() => navigation.navigate('Dashboard')} />
      <MenuRow label="Customers" detail="Member profiles" onPress={() => navigation.navigate('Customers')} />
      {manager ? <MenuRow label="Users" detail="Assist accounts" onPress={() => navigation.navigate('Users')} /> : null}
      <MenuRow label="Transactions" detail="Payment history" onPress={() => navigation.navigate('Transactions')} />
      <MenuRow label="Subscriptions" detail="Membership plans" onPress={() => navigation.navigate('Subscriptions')} />
      {manager ? (
        <MenuRow label="Payment accounts" detail="Settlement accounts" onPress={() => navigation.navigate('PaymentAccounts')} />
      ) : null}
      <Button
        label="Log out"
        variant="outline"
        onPress={async () => {
          await signOut();
          resetToHome(navigation);
        }}
      />
    </ScrollView>
  );
}

function CustomersScreen() {
  return <RecordListScreen kind="customers" />;
}
function UsersScreen() {
  return <RecordListScreen kind="users" />;
}
function TransactionsScreen() {
  return <RecordListScreen kind="transactions" />;
}
function SubscriptionsScreen() {
  return <RecordListScreen kind="subscriptions" />;
}
function PaymentsScreen() {
  return <RecordListScreen kind="payments" />;
}

export function StaffNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.plum,
        contentStyle: {backgroundColor: colors.surface},
      }}>
      <Stack.Screen name="StaffMenu" component={StaffMenuScreen} options={{title: 'Portal'}} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Stack.Screen name="PaymentAccounts" component={PaymentsScreen} options={{title: 'Payment accounts'}} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  content: {padding: 16, paddingBottom: 32},
  title: {fontSize: 26, fontWeight: '800', color: colors.ink},
  role: {color: colors.plum, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize'},
});
