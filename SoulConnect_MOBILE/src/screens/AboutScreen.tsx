import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button} from '../components/ui/Button';
import {Screen} from '../components/ui/Screen';
import {RootStackParamList} from '../navigation/types';
import {colors, radii} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const FEATURES = [
  {title: 'Verified profiles', body: 'Profiles are reviewed so families can start from a real, serious introduction.'},
  {title: 'Personalized matching', body: 'Matches consider values, lifestyle, and family expectations, not only filters.'},
  {title: 'Privacy', body: 'You decide when contact details and photos are shared.'},
  {title: 'Relationship managers', body: 'Higher plans include people who stay with you through family conversations.'},
];

export function AboutScreen({navigation}: Props) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>About us</Text>
        <Text style={styles.title}>Connecting souls, creating forever.</Text>
        <Text style={styles.body}>
          Soul Connect treats marriage as the meeting of two people, two families, and two sets of
          hopes. The platform covers Tamil Nadu with psychology-based compatibility and human review.
        </Text>
        {FEATURES.map(item => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}
        <Button label="Begin registration" onPress={() => navigation.navigate('Register')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {padding: 20, paddingBottom: 40},
  kicker: {color: colors.rose, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase'},
  title: {fontSize: 32, fontWeight: '800', color: colors.ink, marginVertical: 10},
  body: {color: colors.ink60, lineHeight: 22, marginTop: 6},
  card: {backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginVertical: 8},
  cardTitle: {fontSize: 18, fontWeight: '700', color: colors.ink},
});
