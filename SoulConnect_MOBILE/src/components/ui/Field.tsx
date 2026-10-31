import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, radii} from '../../theme/colors';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
}

export function Field({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline,
}: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.ink40}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginBottom: 14},
  label: {color: colors.ink80, fontSize: 13, fontWeight: '600', marginBottom: 6},
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  multiline: {minHeight: 96, textAlignVertical: 'top'},
  inputError: {borderColor: colors.danger},
  error: {color: colors.danger, fontSize: 12, marginTop: 4},
});
