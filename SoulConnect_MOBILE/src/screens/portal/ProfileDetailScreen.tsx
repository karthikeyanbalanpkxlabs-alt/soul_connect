import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {RootStackParamList} from '../../navigation/types';
import {displayName, fetchCustomerDetail, photoUrl} from '../../services/api';
import {colors, radii} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

export function ProfileDetailScreen({route}: Props) {
  const {token} = useAuth();
  const [person, setPerson] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Sign in to view this profile.');
      return;
    }
    fetchCustomerDetail(token, route.params.id).then(result => {
      if (!result.ok) {
        setError(result.error || 'Could not load this profile.');
      } else {
        setPerson(result.data?.data || result.data);
      }
      setLoading(false);
    });
  }, [route.params.id, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }
  if (error || !person) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Profile not found'}</Text>
      </View>
    );
  }

  const image = photoUrl(person);
  const facts = [
    ['Age / DOB', person.dob || person.age || '—'],
    ['District', person.district || '—'],
    ['Education', person.education || '—'],
    ['Profession', person.profession || '—'],
    ['Religion', person.religion || '—'],
    ['Community', person.caste || '—'],
    ['Height', person.height || '—'],
    ['Status', person.maritial_status || person.marital_status || '—'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {image ? <Image source={{uri: image}} style={styles.photo} /> : null}
      <Text style={styles.title}>{displayName(person)}</Text>
      {person.about_self ? <Text style={styles.about}>{String(person.about_self)}</Text> : null}
      {facts.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  content: {paddingBottom: 32, backgroundColor: colors.surface},
  photo: {width: '100%', height: 360, backgroundColor: colors.plumLight},
  title: {fontSize: 28, fontWeight: '800', color: colors.ink, paddingHorizontal: 20, paddingTop: 16},
  about: {color: colors.ink60, lineHeight: 22, paddingHorizontal: 20, marginTop: 8},
  row: {marginHorizontal: 20, marginTop: 10, backgroundColor: colors.white, borderRadius: radii.sm, padding: 14},
  label: {color: colors.ink40, fontSize: 12, fontWeight: '700'},
  value: {color: colors.ink, marginTop: 4, fontSize: 16},
  error: {color: colors.danger, padding: 24},
});
