import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {resetToHome} from '../../navigation/resetToHome';
import {CustomerTabParamList, RootStackParamList} from '../../navigation/types';
import {CustomerProfileView} from './CustomerProfileView';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function AccountScreen({navigation}: Props) {
  const {profile, loadingProfile, profileError, token, signOut, refreshProfile} = useAuth();

  return (
    <CustomerProfileView
      profile={profile}
      token={token}
      loading={loadingProfile}
      error={profileError}
      onSaved={refreshProfile}
      onLogout={async () => {
        await signOut();
        resetToHome(navigation);
      }}
    />
  );
}
