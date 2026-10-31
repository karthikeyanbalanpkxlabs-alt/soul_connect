import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {CustomerTabParamList, RootStackParamList} from '../../navigation/types';
import {displayName, fetchInterested} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Interested'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function InterestedScreen({navigation}: Props) {
  const {token, profile} = useAuth();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await fetchInterested(token, {
      keycloakId: profile.keycloakId,
      email: profile.email,
      customer_id: profile.customer_id || profile._id,
    });
    setSent(result.data?.sentInterests || []);
    setReceived(result.data?.receivedInterests || []);
    setLoading(false);
  }, [profile, token]);

  useEffect(() => {
    load();
  }, [load]);

  const data = tab === 'sent' ? sent : received;

  return (
    <View style={styles.fill}>
      <View style={styles.tabs}>
        <Tab label="Sent" active={tab === 'sent'} onPress={() => setTab('sent')} />
        <Tab label="Received" active={tab === 'received'} onPress={() => setTab('received')} />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.rose} style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => String(item._id || item.customer_id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No interests in this list yet.</Text>}
          renderItem={({item}) => {
            const person = item.customer || item.profile || item;
            const id = String(person._id || person.id || person.customer_id || item.target_customer_id || '');
            return (
              <Pressable
                style={styles.card}
                onPress={() => {
                  if (id) {
                    navigation.navigate('ProfileDetail', {id});
                  }
                }}>
                <Text style={styles.name}>{displayName(person)}</Text>
                <Text style={styles.meta}>{person.district || item.status || ''}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

function Tab({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabOn]}>
      <Text style={[styles.tabText, active && styles.tabTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.surface},
  tabs: {flexDirection: 'row', padding: 16, gap: 8},
  tab: {paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.white},
  tabOn: {backgroundColor: colors.roseLight},
  tabText: {color: colors.ink60, fontWeight: '600'},
  tabTextOn: {color: colors.roseDark},
  loader: {marginTop: 24},
  list: {paddingHorizontal: 16, paddingBottom: 24},
  card: {backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 10},
  name: {fontSize: 17, fontWeight: '700', color: colors.ink},
  meta: {color: colors.ink40, marginTop: 4},
  empty: {color: colors.ink40, textAlign: 'center', marginTop: 32},
});
