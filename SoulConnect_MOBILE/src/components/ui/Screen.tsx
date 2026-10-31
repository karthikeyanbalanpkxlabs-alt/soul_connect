import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme/colors';

export function Screen({children}: {children: React.ReactNode}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.surface},
});
