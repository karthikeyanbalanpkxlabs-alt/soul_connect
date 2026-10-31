import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {CustomerTabParamList, RootStackParamList} from '../../navigation/types';
import {approvalStatus, displayName, fetchCustomerList, oppositeGender, photoUrl, sendInterest} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Discover'>,
  NativeStackScreenProps<RootStackParamList>
>;

const PAGE = 10;

export function DiscoverScreen({navigation}: Props) {
  const {token, profile, loadingProfile} = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (nextSkip: number, replace: boolean) => {
      if (!token || !profile) {
        setLoading(false);
        return;
      }
      const result = await fetchCustomerList(token, {
        customer_type: true,
        skip: nextSkip,
        limit: PAGE,
        filters: {role: 'customer_g', gender: oppositeGender(profile?.gender)},
      });
      const list = (result.data?.data || []).map(item => ({
        ...item,
        approvalStatus: approvalStatus(item),
      }));
      setRows(current => (replace ? list : [...current, ...list]));
      setTotal(result.data?.total || 0);
      setSkip(nextSkip);
      setLoading(false);
      setRefreshing(false);
    },
    [profile?.gender, token],
  );

  useEffect(() => {
    if (token && profile?.public_verify) {
      setLoading(true);
      load(0, true);
    } else if (profile || !token) {
      setLoading(false);
    }
  }, [load, profile, token]);

  if (loadingProfile || (loading && rows.length === 0)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.rose} />
        <Text style={styles.muted}>Loading profiles…</Text>
      </View>
    );
  }

  if (profile && profile.public_verify !== true) {
    return (
      <View style={styles.pending}>
        <Text style={styles.title}>Profile verification pending</Text>
        <Text style={styles.body}>
          Every profile is reviewed before it can browse matches. Complete identity, family photo,
          horoscope, family background, and lifestyle details from your account.
        </Text>
        {profile.public_verify_command_helper ? (
          <Text style={styles.note}>{profile.public_verify_command_helper}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item, index) => String(item._id || item.customer_id || index)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(0, true);
          }}
        />
      }
      onEndReached={() => {
        if (!loading && rows.length < total) {
          setLoading(true);
          load(skip + PAGE, false);
        }
      }}
      ListEmptyComponent={<Text style={styles.muted}>No profiles found.</Text>}
      renderItem={({item}) => {
        const id = String(item._id || item.id || item.customer_id);
        const image = photoUrl(item);
        return (
          <Pressable style={styles.card} onPress={() => navigation.navigate('ProfileDetail', {id})}>
            {image ? <Image source={{uri: image}} style={styles.photo} /> : <View style={styles.photo} />}
            <View style={styles.meta}>
              <Text style={styles.name}>{displayName(item)}</Text>
              <Text style={styles.muted}>
                {[item.district, item.profession || item.education].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.status}>{item.approvalStatus}</Text>
              <Pressable
                onPress={() => {
                  if (!token || !profile) {
                    return;
                  }
                  sendInterest(token, {
                    target_customer_id: id,
                    target_id: id,
                    user_customer_id: profile.customer_id || profile._id,
                    user_id: profile._id || profile.id,
                    loggedInKeycloakId: profile.keycloakId,
                    loggedInEmail: profile.email,
                    isInterested: true,
                    interestSent: true,
                    interest_sent: true,
                    status: 'Interested',
                  });
                }}>
                <Text style={styles.interest}>Send interest</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  list: {padding: 16, backgroundColor: colors.surface},
  card: {backgroundColor: colors.white, borderRadius: radii.md, marginBottom: 12, overflow: 'hidden'},
  photo: {height: 220, backgroundColor: colors.plumLight},
  meta: {padding: 14},
  name: {fontSize: 18, fontWeight: '700', color: colors.ink},
  muted: {color: colors.ink40, marginTop: 4},
  status: {marginTop: 8, color: colors.sage, fontWeight: '600'},
  interest: {marginTop: 10, color: colors.rose, fontWeight: '700'},
  pending: {flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.surface},
  title: {fontSize: 26, fontWeight: '800', color: colors.ink},
  body: {color: colors.ink60, marginTop: 12, lineHeight: 22},
  note: {marginTop: 16, backgroundColor: colors.amberLight, padding: 12, borderRadius: radii.sm, color: colors.ink},
});
