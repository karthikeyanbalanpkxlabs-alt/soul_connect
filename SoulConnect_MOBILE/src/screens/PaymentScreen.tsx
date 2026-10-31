import React, {useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView} from 'react-native-webview';
import {API_URL, WEB_ORIGIN} from '../config/env';
import {Button} from '../components/ui/Button';
import {Screen} from '../components/ui/Screen';
import {RootStackParamList} from '../navigation/types';
import {completePaidRegistration} from '../services/registration';
import {queryParam} from '../services/query';
import {storageKeys, storageRemove} from '../services/storage';
import {colors} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function paymentHtml(params: Props['route']['params']): string {
  const amount = String(params.price).replace(/[^0-9.]/g, '') || '0';
  const fields = {
    plan: params.planName,
    amount,
    email: params.email || 'customer@soulconect.com',
    name: params.name || 'SoulConnect Member',
    phone: params.phone || '9876543210',
    frontend_redirect: `${WEB_ORIGIN}/`,
  };
  const inputs = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeAttr(value)}" />`)
    .join('');
  return `<!doctype html><html><body onload="document.forms[0].submit()">
    <form method="POST" action="${API_URL}/api/public/payment/omniware/redirect">${inputs}</form>
    <p>Opening secure payment…</p>
  </body></html>`;
}

function queryValue(url: string, key: string): string {
  return queryParam(url, key);
}

export function PaymentScreen({route, navigation}: Props) {
  const handled = useRef(false);
  const [phase, setPhase] = useState<'gateway' | 'working' | 'done' | 'failed'>('gateway');
  const [message, setMessage] = useState('');

  const finish = async (url: string) => {
    if (handled.current || !url.includes('soulconect.com') || !url.includes('payment=')) {
      return;
    }
    handled.current = true;
    const status = queryValue(url, 'payment').toLowerCase();
    if (status !== 'success') {
      setPhase('failed');
      setMessage(queryValue(url, 'reason') || queryValue(url, 'message') || 'Payment was not completed.');
      return;
    }
    setPhase('working');
    const outcome = await completePaidRegistration({
      orderId: queryValue(url, 'order_id') || queryValue(url, 'orderid'),
      txnId: queryValue(url, 'txn') || queryValue(url, 'txnid'),
      planName: queryValue(url, 'plan') || route.params.planName,
      amount: queryValue(url, 'amount'),
      paymentType: queryValue(url, 'payment_type') || queryValue(url, 'payment_mode'),
    });
    if (!outcome.result.ok) {
      setPhase('failed');
      setMessage(outcome.result.error || 'Payment succeeded, but the profile could not be created.');
      handled.current = false;
      return;
    }
    await storageRemove(storageKeys.pendingRegistration);
    await storageRemove(storageKeys.pendingPlan);
    await storageRemove(storageKeys.registrationData);
    setPhase('done');
    setMessage(`Order ${outcome.orderId}. Sign in with the welcome email sent to ${outcome.email || 'you'}.`);
  };

  if (phase !== 'gateway') {
    return (
      <Screen>
        <View style={styles.result}>
          {phase === 'working' ? <ActivityIndicator color={colors.plum} /> : null}
          <Text style={styles.title}>{phase === 'done' ? 'Payment received' : phase === 'failed' ? 'Payment needs attention' : 'Creating your profile'}</Text>
          <Text style={styles.body}>{message}</Text>
          {phase === 'done' ? <Button label="Sign in" onPress={() => navigation.reset({index: 0, routes: [{name: 'Login'}]})} /> : null}
          {phase === 'failed' ? <Button label="Back to registration" variant="outline" onPress={() => navigation.goBack()} /> : null}
        </View>
      </Screen>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{html: paymentHtml(route.params)}}
      onShouldStartLoadWithRequest={request => {
        finish(request.url);
        return true;
      }}
      onNavigationStateChange={state => finish(state.url)}
    />
  );
}

const styles = StyleSheet.create({
  result: {flex: 1, padding: 24, justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '800', color: colors.ink, marginBottom: 12},
  body: {color: colors.ink60, fontSize: 16, lineHeight: 24, marginBottom: 20},
});
