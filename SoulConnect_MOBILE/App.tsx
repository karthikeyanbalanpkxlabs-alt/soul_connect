import React from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
});
