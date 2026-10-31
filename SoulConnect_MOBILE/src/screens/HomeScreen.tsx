import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button} from '../components/ui/Button';
import {Screen} from '../components/ui/Screen';
import {fetchSubscriptions, isFreePrice, mapPlans, PlanCard} from '../services/api';
import {RootStackParamList} from '../navigation/types';
import {colors, radii} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const STEPS = [
  {n: '01', title: 'Create your profile', body: 'Tell your story, district, and community in Tamil or English.'},
  {n: '02', title: 'Get verified', body: 'Identity, family, and lifestyle checks keep every profile real.'},
  {n: '03', title: 'Compatibility match', body: 'Psychology matching looks past horoscope and biodata alone.'},
  {n: '04', title: 'Connect and commit', body: 'Move from interest to family conversations with support along the way.'},
];

const STATS = [
  {num: '1.2L+', label: 'Tamil Nadu profiles'},
  {num: '38', label: 'Districts covered'},
  {num: '94%', label: 'Verified profiles'},
  {num: '8,400+', label: 'Successful matches'},
];

export function HomeScreen({navigation}: Props) {
  const [plans, setPlans] = useState<PlanCard[]>([]);

  useEffect(() => {
    fetchSubscriptions()
      .then(result => setPlans(mapPlans(result.list)))
      .catch(() => setPlans(mapPlans([])));
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>
          Soul<Text style={styles.brandAccent}>Connect</Text>
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Tamil Nadu's psychology-based matrimony</Text>
        </View>
        <Text style={styles.title}>
          Find your <Text style={styles.em}>soulmate</Text> across Tamil Nadu
        </Text>
        <Text style={styles.sub}>
          Deep compatibility matching powered by psychology — not just horoscopes and biodata.
          All 38 districts, every community, every dream.
        </Text>
        <Text style={styles.tamil}>அனைத்து 38 மாவட்டங்களிலும் உங்கள் வாழ்க்கை துணையை கண்டுபிடியுங்கள்</Text>
        <Button label="Register free" onPress={() => navigation.navigate('Register')} />
        <Button
          label="Sign in"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.gap}
        />

        <View style={styles.stats}>
          {STATS.map(stat => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.eyebrow}>How it works</Text>
        <Text style={styles.sectionTitle}>Four steps to finding your person</Text>
        {STEPS.map(step => (
          <View key={step.n} style={styles.card}>
            <Text style={styles.step}>{step.n}</Text>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardBody}>{step.body}</Text>
          </View>
        ))}

        <Text style={styles.eyebrow}>Membership plans</Text>
        <Text style={styles.sectionTitle}>A plan for every family's journey</Text>
        {plans.map(plan => (
          <View key={plan.id} style={[styles.card, plan.isPopular && styles.featured]}>
            {plan.isPopular ? <Text style={styles.popular}>Most popular</Text> : null}
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.cardTitle}>{plan.name}</Text>
            <Text style={styles.cardBody}>{plan.sub}</Text>
            {plan.features.map(feature => (
              <Text key={feature} style={styles.feature}>
                ✓  {feature}
              </Text>
            ))}
            <Button
              label={isFreePrice(plan.price) ? 'Start free' : 'Choose plan'}
              onPress={() => navigation.navigate('Register')}
              style={styles.gap}
            />
          </View>
        ))}

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Ready to meet your soulmate?</Text>
          <Text style={styles.ctaBody}>
            Join families finding verified, compatible matches on Tamil Nadu's matrimony platform.
          </Text>
          <Button label="Register free now" onPress={() => navigation.navigate('Register')} />
        </View>

        <View style={styles.links}>
          <Link label="About us" onPress={() => navigation.navigate('About')} />
          <Link label="Contact" onPress={() => navigation.navigate('Contact')} />
          <Link label="Privacy" onPress={() => navigation.navigate('Legal', {kind: 'privacy'})} />
          <Link label="Terms" onPress={() => navigation.navigate('Legal', {kind: 'terms'})} />
        </View>
        <Text style={styles.copy}>© {new Date().getFullYear()} Soul Connect</Text>
      </ScrollView>
    </Screen>
  );
}

function Link({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {padding: 20, paddingBottom: 48},
  brand: {fontSize: 22, fontWeight: '800', color: colors.plum, marginBottom: 18},
  brandAccent: {color: colors.rose},
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.plumLight,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {color: colors.plumDark, fontWeight: '600', fontSize: 12},
  title: {fontSize: 34, fontWeight: '800', color: colors.ink, lineHeight: 40},
  em: {color: colors.rose},
  sub: {marginTop: 12, color: colors.ink60, fontSize: 16, lineHeight: 24},
  tamil: {marginTop: 8, marginBottom: 20, color: colors.ink40, fontSize: 14, lineHeight: 22},
  gap: {marginTop: 10},
  stats: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 28, gap: 12},
  stat: {width: '47%', backgroundColor: colors.white, borderRadius: radii.md, padding: 14},
  statNum: {fontSize: 22, fontWeight: '700', color: colors.ink},
  statLabel: {color: colors.ink40, fontSize: 12, marginTop: 4},
  eyebrow: {
    marginTop: 32,
    color: colors.rose,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  sectionTitle: {fontSize: 26, fontWeight: '700', color: colors.ink, marginTop: 8, marginBottom: 14},
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  featured: {borderColor: colors.plum},
  popular: {color: colors.plum, fontWeight: '700', marginBottom: 6},
  step: {color: colors.rose, fontWeight: '800', marginBottom: 6},
  cardTitle: {fontSize: 18, fontWeight: '700', color: colors.ink},
  cardBody: {color: colors.ink60, marginTop: 6, lineHeight: 22},
  price: {fontSize: 28, fontWeight: '800', color: colors.ink, marginBottom: 4},
  feature: {color: colors.ink80, marginTop: 6},
  cta: {marginTop: 20, backgroundColor: colors.ink, borderRadius: radii.lg, padding: 20},
  ctaTitle: {color: colors.white, fontSize: 24, fontWeight: '800'},
  ctaBody: {color: '#D6D0E4', marginVertical: 12, lineHeight: 22},
  links: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 24},
  link: {marginRight: 16, marginBottom: 8},
  linkText: {color: colors.plum, fontWeight: '600'},
  copy: {color: colors.ink40, marginTop: 8},
});
