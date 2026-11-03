import React from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {colors} from './src/theme/colors';

function Gate() {
  const {ready} = useAuth();
  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.plum} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

function AppStatusBar() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent />
      <View pointerEvents="none" style={[styles.statusBar, {height: insets.top}]} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
      <AppStatusBar />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 100,
    elevation: 100,
  },
});
