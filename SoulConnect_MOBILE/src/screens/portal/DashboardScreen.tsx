import React, {useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {StaffStackParamList} from '../../navigation/types';
import {fetchDashboard} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Props = NativeStackScreenProps<StaffStackParamList, 'Dashboard'>;

export function DashboardScreen(_props: Props) {
  const {token} = useAuth();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [districts, setDistricts] = useState<Array<{district: string; count: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const result = await fetchDashboard(token);
    if (result.ok && result.data?.success) {
      setStats(result.data.stats || null);
      setDistricts(result.data.topDistricts || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }

  const cards = [
    ['Profiles', stats?.totalCustomers],
    ['Approved', stats?.approvedCustomers],
    ['Pending', stats?.pendingCustomers],
    ['Subscriptions', stats?.totalSubscriptions],
    ['Transactions', stats?.totalTransactions],
    ['Revenue', stats?.totalRevenue],
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={styles.grid}>
        {cards.map(([label, value]) => (
          <View key={String(label)} style={styles.card}>
            <Text style={styles.value}>{value ?? '—'}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.heading}>Top districts</Text>
      {districts.map(item => (
        <View key={item.district} style={styles.district}>
          <Text style={styles.districtName}>{item.district}</Text>
          <Text style={styles.districtCount}>{item.count}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 16, backgroundColor: colors.surface},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  card: {width: '48%', backgroundColor: colors.white, borderRadius: radii.md, padding: 14, marginBottom: 12},
  value: {fontSize: 24, fontWeight: '800', color: colors.ink},
  label: {color: colors.ink40, marginTop: 4},
  heading: {fontSize: 18, fontWeight: '700', color: colors.ink, marginVertical: 8},
  district: {flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white, padding: 14, borderRadius: radii.sm, marginBottom: 8},
  districtName: {color: colors.ink, fontWeight: '600'},
  districtCount: {color: colors.plum, fontWeight: '700'},
});
