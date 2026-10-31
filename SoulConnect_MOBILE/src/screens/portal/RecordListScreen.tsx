import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {
  approvalStatus,
  displayName,
  fetchCustomerList,
  fetchPaymentAccounts,
  fetchSubscriptions,
  fetchTransactions,
  mapPlans,
} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Kind = 'customers' | 'users' | 'transactions' | 'subscriptions' | 'payments';

const PAGE = 20;

export function RecordListScreen({kind}: {kind: Kind}) {
  const {token, role} = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (nextSkip: number, replace: boolean) => {
      if (!token) {
        setLoading(false);
        return;
      }
      const customerType = role.includes('customer');
      let list: any[] = [];
      let count = 0;
      if (kind === 'subscriptions') {
        const result = await fetchSubscriptions(token);
        list = mapPlans(result.list);
        count = list.length;
      } else if (kind === 'transactions') {
        const result = await fetchTransactions(token, {
          customer_type: customerType,
          skip: nextSkip,
          limit: PAGE,
          filters: {},
        });
        list = result.data?.data || [];
        count = result.data?.total || list.length;
      } else if (kind === 'payments') {
        const result = await fetchPaymentAccounts(token, {skip: nextSkip, limit: PAGE, filters: {}});
        list = result.data?.data || result.data?.accounts || [];
        count = result.data?.total || list.length;
      } else {
        const result = await fetchCustomerList(token, {
          customer_type: customerType,
          skip: nextSkip,
          limit: PAGE,
          filters: kind === 'users' ? {role: 'assit_g'} : {role: 'customer_g'},
        });
        list = (result.data?.data || []).map(item => ({...item, approvalStatus: approvalStatus(item)}));
        count = result.data?.total || 0;
      }
      setRows(current => (replace ? list : [...current, ...list]));
      setTotal(count);
      setSkip(nextSkip);
      setLoading(false);
      setRefreshing(false);
    },
    [kind, role, token],
  );

  useEffect(() => {
    load(0, true);
  }, [load]);

  if (loading && rows.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item, index) => String(item.id || item._id || item.customer_id || index)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(0, true); }} />
      }
      onEndReached={() => {
        if (kind !== 'subscriptions' && rows.length < total) {
          load(skip + PAGE, false);
        }
      }}
      ListEmptyComponent={<Text style={styles.empty}>Nothing to show yet.</Text>}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.name || displayName(item)}</Text>
          <Text style={styles.meta}>
            {item.email || item.price || item.account_name || item.subscription_type || item.approvalStatus || item.status || ''}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {padding: 16, backgroundColor: colors.surface, flexGrow: 1},
  card: {backgroundColor: colors.white, borderRadius: radii.md, padding: 14, marginBottom: 10},
  title: {fontSize: 16, fontWeight: '700', color: colors.ink},
  meta: {color: colors.ink40, marginTop: 4},
  empty: {textAlign: 'center', color: colors.ink40, marginTop: 40},
});
