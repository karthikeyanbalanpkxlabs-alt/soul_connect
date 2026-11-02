import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme/colors';

export function Screen({children, backgroundColor}: {children: React.ReactNode; backgroundColor?: string}) {
  return (
    <SafeAreaView style={[styles.safe, backgroundColor ? {backgroundColor} : null]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.surface},
});
