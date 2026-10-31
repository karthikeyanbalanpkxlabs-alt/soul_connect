import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Heart, Sparkles, User} from 'lucide-react-native';
import {AccountScreen} from './AccountScreen';
import {DiscoverScreen} from './DiscoverScreen';
import {InterestedScreen} from './InterestedScreen';
import {CustomerTabParamList} from '../../navigation/types';
import {colors} from '../../theme/colors';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTitleStyle: {color: colors.ink, fontWeight: '700'},
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.ink40,
        tabBarStyle: {backgroundColor: colors.white, borderTopColor: colors.borderSoft},
      }}>
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Matches',
          tabBarIcon: ({color, size}) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Interested"
        component={InterestedScreen}
        options={{
          tabBarIcon: ({color, size}) => <Heart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({color, size}) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function MenuRow({label, detail, onPress}: {label: string; detail: string; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {fontSize: 17, fontWeight: '700', color: colors.ink},
  detail: {color: colors.ink40, marginTop: 2},
  chevron: {fontSize: 28, color: colors.ink40},
});
