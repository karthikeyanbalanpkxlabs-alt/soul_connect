import React from 'react';
import {StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView} from 'react-native-webview';
import {WEB_ORIGIN} from '../config/env';
import {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;

const PATHS = {
  privacy: '/privacy-policy/',
  terms: '/terms-and-conditions/',
};

export function LegalScreen({route}: Props) {
  return <WebView style={styles.fill} source={{uri: `${WEB_ORIGIN}${PATHS[route.params.kind]}`}} />;
}

const styles = StyleSheet.create({
  fill: {flex: 1},
});
