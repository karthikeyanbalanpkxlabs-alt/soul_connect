import React, {useMemo, useRef, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {KEYCLOAK_REDIRECT_URI} from '../config/env';
import {useAuth} from '../context/AuthContext';
import {RootStackParamList} from '../navigation/types';
import {buildAuthorizeUrl, exchangeAuthCode} from '../services/api';
import {createPkcePair, isStaffRole, primaryRole, rolesFromToken} from '../services/pkce';
import {queryParam} from '../services/query';
import {colors, radii} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function shouldCapture(url: string): boolean {
  if (!url.startsWith(KEYCLOAK_REDIRECT_URI)) {
    return false;
  }
  return url.includes('code=') || url.includes('error=');
}

export function LoginScreen({navigation}: Props) {
  const {signIn} = useAuth();
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const started = useRef(false);
  const pair = useMemo(() => createPkcePair(), []);
  const authUrl = useMemo(
    () => buildAuthorizeUrl(pair.challenge, KEYCLOAK_REDIRECT_URI),
    [pair.challenge],
  );

  const handleUrl = async (url: string) => {
    if (started.current || !shouldCapture(url)) {
      return;
    }
    started.current = true;
    const query = url.split('?')[1]?.split('#')[0] || '';
    const oauthError = queryParam(`?${query}`, 'error_description') || queryParam(`?${query}`, 'error');
    if (oauthError) {
      started.current = false;
      setError(oauthError);
      return;
    }
    const code = queryParam(`?${query}`, 'code');
    if (!code) {
      started.current = false;
      return;
    }
    setWorking(true);
    try {
      const tokens = await exchangeAuthCode(code, pair.verifier, KEYCLOAK_REDIRECT_URI);
      await signIn({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
      });
      const role = primaryRole(rolesFromToken(tokens.access_token));
      navigation.reset({
        index: 0,
        routes: [{name: isStaffRole(role) ? 'StaffApp' : 'CustomerApp'}],
      });
    } catch (err: any) {
      started.current = false;
      setError(err?.message || 'Sign-in failed');
      setWorking(false);
    }
  };

  const onNavChange = (state: WebViewNavigation) => {
    if (shouldCapture(state.url)) {
      handleUrl(state.url);
    }
  };

  return (
    <View style={styles.fill}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <WebView
        source={{uri: authUrl}}
        incognito
        sharedCookiesEnabled={false}
        setSupportMultipleWindows={false}
        onNavigationStateChange={onNavChange}
        onShouldStartLoadWithRequest={request => {
          if (shouldCapture(request.url)) {
            handleUrl(request.url);
            return false;
          }
          return true;
        }}
      />
      <Pressable onPress={() => navigation.goBack()} style={styles.close}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
      {working ? (
        <Modal transparent animationType="fade">
          <View style={styles.modal}>
            <Text style={styles.modalText}>Signing you in…</Text>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.surface},
  error: {color: colors.danger, padding: 12, backgroundColor: '#FEF2F2'},
  close: {
    position: 'absolute',
    top: 54,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeText: {color: colors.plum, fontWeight: '700'},
  modal: {
    flex: 1,
    backgroundColor: 'rgba(15,10,30,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 12,
    color: colors.ink,
    fontWeight: '600',
  },
});
