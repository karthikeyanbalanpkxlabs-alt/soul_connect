import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button} from '../../components/ui/Button';
import {useAuth} from '../../context/AuthContext';
import {resetToHome} from '../../navigation/resetToHome';
import {CustomerTabParamList, RootStackParamList} from '../../navigation/types';
import {displayName} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function AccountScreen({navigation}: Props) {
  const {profile, loadingProfile, profileError, role, signOut} = useAuth();
  const rows = [
    ['Name', displayName(profile || {})],
    ['Email', profile?.email || '—'],
    ['Mobile', String(profile?.phone_number || profile?.phone || '—')],
    ['District', profile?.district || '—'],
    ['Plan', profile?.subscription_type || '—'],
    ['Verification', profile?.public_verify ? 'Approved' : 'Pending'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{loadingProfile ? 'Loading account…' : displayName(profile || {})}</Text>
      <Text style={styles.role}>{role.replace('_g', '')}</Text>
      {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
      {profile?.public_verify_command_helper ? <Text style={styles.note}>{profile.public_verify_command_helper}</Text> : null}
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
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

const styles = StyleSheet.create({
  content: {padding: 20, backgroundColor: colors.surface, flexGrow: 1},
  title: {fontSize: 28, fontWeight: '800', color: colors.ink},
  role: {color: colors.plum, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize'},
  error: {color: colors.danger, marginBottom: 12},
  note: {backgroundColor: colors.amberLight, padding: 12, borderRadius: radii.sm, marginBottom: 12, color: colors.ink},
  row: {backgroundColor: colors.white, borderRadius: radii.sm, padding: 14, marginBottom: 8},
  label: {color: colors.ink40, fontSize: 12, fontWeight: '700'},
  value: {color: colors.ink, fontSize: 16, marginTop: 4},
});
