import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button} from '../components/ui/Button';
import {Screen} from '../components/ui/Screen';
import {colors, radii} from '../theme/colors';

export function ContactScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Support · 7 days a week</Text>
        <Text style={styles.title}>Let’s connect</Text>
        <Text style={styles.body}>
          Questions about matching, membership, or verification can go to the Tiruppur team.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SOUL CONNECT TRUST</Text>
          <Text style={styles.body}>15, Velampalayam Ring Road{'\n'}Velampalayam, Tirupur – 641 654{'\n'}Tamil Nadu, India</Text>
          <Text style={styles.meta}>Mon – Sat: 9:30 AM – 6:30 PM IST</Text>
          <Button
            label="Open in Maps"
            variant="outline"
            onPress={() =>
              Linking.openURL('https://www.google.com/maps/search/?api=1&query=15+Velampalayam+Ring+Road+Tirupur+641654')
            }
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>+91 83006 93931</Text>
          <Button label="Call" onPress={() => Linking.openURL('tel:+918300693931')} />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>info@soulconect.com</Text>
          <Button label="Email" variant="outline" onPress={() => Linking.openURL('mailto:info@soulconect.com')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {padding: 20, paddingBottom: 40},
  kicker: {color: colors.rose, fontWeight: '700'},
  title: {fontSize: 32, fontWeight: '800', color: colors.ink, marginVertical: 8},
  body: {color: colors.ink60, lineHeight: 22},
  card: {backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginTop: 14},
  cardTitle: {fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 8},
  meta: {color: colors.ink40, marginVertical: 10},
});
