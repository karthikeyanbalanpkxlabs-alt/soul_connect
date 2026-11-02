import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFormik} from 'formik';
import {RegisterStepTwo} from '../components/register/RegisterStepTwo';
import {Button} from '../components/ui/Button';
import {Field} from '../components/ui/Field';
import {Screen} from '../components/ui/Screen';
import {districts} from '../data/districts';
import {RootStackParamList} from '../navigation/types';
import {fetchSubscriptions, isFreePrice, mapPlans, PlanCard, savePublicCustomer, sendOtp, verifyOtp} from '../services/api';
import {
  buildCustomerFixture,
  emptyRegistration,
  registrationSchema,
  rememberPendingRegistration,
} from '../services/registration';
import {colors, radii} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const FOR_OPTIONS = ['For myself', 'For my son', 'For my daughter', 'For my brother', 'For my sister', 'For a relative'];
const GENDERS = ['Male', 'Female'];
const MARITAL = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

export function RegisterScreen({navigation}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanCard | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchSubscriptions()
      .then(result => {
        const next = mapPlans(result.list);
        setPlans(next);
        setSelectedPlan(next[0] || null);
      })
      .catch(() => {
        const next = mapPlans([]);
        setPlans(next);
        setSelectedPlan(next[0] || null);
      });
  }, []);

  const formik = useFormik({
    initialValues: emptyRegistration,
    validationSchema: registrationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async values => {
      if (!phoneVerified || !emailVerified) {
        setNotice('Verify mobile and email with OTP before continuing.');
        setStep(1);
        return;
      }
      if (!selectedPlan) {
        setNotice('Choose a membership plan.');
        return;
      }
      const fixture = buildCustomerFixture(values, selectedPlan.id, {
        email: emailVerified,
        phone: phoneVerified,
      });
      if (profilePhotos.length) {
        fixture.image = profilePhotos.map((url, index) => ({url, default: index === 0}));
      }
      if (isFreePrice(selectedPlan.price)) {
        setBusy(true);
        const result = await savePublicCustomer(fixture);
        setBusy(false);
        if (!result.ok) {
          setNotice(result.error || 'Could not create the profile.');
          return;
        }
        Alert.alert('Welcome', 'Free registration is complete. Sign in with the details sent to you.', [
          {text: 'Sign in', onPress: () => navigation.replace('Login')},
        ]);
        return;
      }
      await rememberPendingRegistration(fixture, selectedPlan, values);
      navigation.navigate('Payment', {
        planName: selectedPlan.name,
        price: selectedPlan.price,
        email: values.email,
        name: values.firstName,
        phone: values.mobile,
      });
    },
  });

  const sendCode = async (type: 'phone' | 'email') => {
    setBusy(true);
    const result =
      type === 'phone'
        ? await sendOtp({type: 'phone', phone_number: formik.values.mobile, phone_code: '+91'})
        : await sendOtp({type: 'email', email: formik.values.email});
    setBusy(false);
    if (!result.ok && result.data?.success === false) {
      setNotice(result.error || 'Could not send OTP.');
      return;
    }
    if (type === 'phone') {
      setPhoneSent(true);
    } else {
      setEmailSent(true);
    }
    setNotice(type === 'phone' ? 'OTP sent to your mobile.' : 'OTP sent to your email.');
  };

  const confirmCode = async (type: 'phone' | 'email') => {
    setBusy(true);
    const result =
      type === 'phone'
        ? await verifyOtp({type: 'phone', otp: phoneOtp, phone_number: formik.values.mobile})
        : await verifyOtp({type: 'email', otp: emailOtp, email: formik.values.email});
    setBusy(false);
    if (!result.ok) {
      setNotice(result.error || 'OTP verification failed.');
      return;
    }
    if (type === 'phone') {
      setPhoneVerified(true);
    } else {
      setEmailVerified(true);
    }
    setNotice(type === 'phone' ? 'Mobile verified.' : 'Email verified.');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: step === 2 ? colors.ink : colors.white},
      headerTintColor: step === 2 ? colors.white : colors.plum,
      headerTitleStyle: {color: step === 2 ? colors.white : colors.ink},
    });
  }, [navigation, step]);

  const goToPlans = async () => {
    const errors = await formik.validateForm();
    const stepOneKeys = [
      'registerFor',
      'firstName',
      'lastName',
      'dob',
      'gender',
      'mobile',
      'email',
      'district',
      'motherTongue',
      'maritalStatus',
    ] as const;
    const blocked = stepOneKeys.some(key => errors[key]);
    formik.setTouched(
      stepOneKeys.reduce((acc, key) => ({...acc, [key]: true}), {}),
      false,
    );
    if (blocked || !phoneVerified || !emailVerified) {
      setNotice(!phoneVerified || !emailVerified ? 'Verify mobile and email before choosing a plan.' : 'Complete the required profile fields.');
      return;
    }
    setNotice('');
    setStep(2);
  };

  return (
    <Screen backgroundColor={step === 2 ? colors.ink : colors.surface}>
      <KeyboardAvoidingView style={[styles.fill, step === 2 && styles.stepTwoBg]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={step === 2 ? styles.stepTwoContent : styles.content} keyboardShouldPersistTaps="handled">
          {step === 1 ? <Text style={styles.kicker}>Step 1 of 2</Text> : null}
          {step === 1 ? <Text style={styles.title}>Create your profile</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          {step === 1 ? (
            <>
              <Text style={styles.label}>Registering for</Text>
              <View style={styles.row}>
                {FOR_OPTIONS.map(option => (
                  <Choice
                    key={option}
                    label={option}
                    active={formik.values.registerFor === option}
                    onPress={() => formik.setFieldValue('registerFor', option)}
                  />
                ))}
              </View>
              <Field label="First name" value={formik.values.firstName} onChangeText={value => formik.setFieldValue('firstName', value)} onBlur={() => formik.setFieldTouched('firstName')} error={touchedError(formik, 'firstName')} />
              <Field label="Last name" value={formik.values.lastName} onChangeText={value => formik.setFieldValue('lastName', value)} onBlur={() => formik.setFieldTouched('lastName')} error={touchedError(formik, 'lastName')} />
              <Field label="Date of birth" placeholder="YYYY-MM-DD" value={formik.values.dob} onChangeText={value => formik.setFieldValue('dob', value)} onBlur={() => formik.setFieldTouched('dob')} error={touchedError(formik, 'dob')} autoCapitalize="none" />
              <Text style={styles.label}>Gender</Text>
              <View style={styles.row}>
                {GENDERS.map(option => (
                  <Choice key={option} label={option} active={formik.values.gender === option} onPress={() => formik.setFieldValue('gender', option)} />
                ))}
              </View>
              {touchedError(formik, 'gender') ? <Text style={styles.error}>{touchedError(formik, 'gender')}</Text> : null}
              <Field label="Mobile" keyboardType="number-pad" value={formik.values.mobile} onChangeText={value => formik.setFieldValue('mobile', value.replace(/[^0-9]/g, '').slice(0, 10))} error={touchedError(formik, 'mobile')} />
              <View style={styles.inline}>
                <Button label={phoneVerified ? 'Mobile verified' : 'Send mobile OTP'} variant="outline" disabled={phoneVerified || busy} onPress={() => sendCode('phone')} />
              </View>
              {phoneSent && !phoneVerified ? (
                <>
                  <Field label="Mobile OTP" keyboardType="number-pad" value={phoneOtp} onChangeText={setPhoneOtp} />
                  <Button label="Verify mobile OTP" onPress={() => confirmCode('phone')} disabled={busy} />
                </>
              ) : null}
              <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={formik.values.email} onChangeText={value => formik.setFieldValue('email', value)} error={touchedError(formik, 'email')} />
              <View style={styles.inline}>
                <Button label={emailVerified ? 'Email verified' : 'Send email OTP'} variant="outline" disabled={emailVerified || busy} onPress={() => sendCode('email')} />
              </View>
              {emailSent && !emailVerified ? (
                <>
                  <Field label="Email OTP" keyboardType="number-pad" value={emailOtp} onChangeText={setEmailOtp} />
                  <Button label="Verify email OTP" onPress={() => confirmCode('email')} disabled={busy} />
                </>
              ) : null}
              <Text style={styles.label}>District</Text>
              <Pressable style={styles.picker} onPress={() => setDistrictOpen(true)}>
                <Text style={formik.values.district ? styles.pickerValue : styles.pickerPlaceholder}>
                  {formik.values.district || 'Select a district'}
                </Text>
              </Pressable>
              {touchedError(formik, 'district') ? <Text style={styles.error}>{touchedError(formik, 'district')}</Text> : null}
              <Field label="Taluk / town" value={formik.values.taluk} onChangeText={value => formik.setFieldValue('taluk', value)} />
              <Field label="Religion" value={formik.values.religion} onChangeText={value => formik.setFieldValue('religion', value)} />
              <Field label="Community" value={formik.values.caste} onChangeText={value => formik.setFieldValue('caste', value)} />
              <Field label="Mother tongue" value={formik.values.motherTongue} onChangeText={value => formik.setFieldValue('motherTongue', value)} error={touchedError(formik, 'motherTongue')} />
              <Text style={styles.label}>Marital status</Text>
              <View style={styles.row}>
                {MARITAL.map(option => (
                  <Choice key={option} label={option} active={formik.values.maritalStatus === option} onPress={() => formik.setFieldValue('maritalStatus', option)} />
                ))}
              </View>
              <Field label="Education" value={formik.values.education} onChangeText={value => formik.setFieldValue('education', value)} />
              <Field label="Profession" value={formik.values.profession} onChangeText={value => formik.setFieldValue('profession', value)} />
              <Field label="Annual income" value={formik.values.income} onChangeText={value => formik.setFieldValue('income', value)} />
              <Field label="Height" placeholder={`5'8"`} value={formik.values.height} onChangeText={value => formik.setFieldValue('height', value)} />
              <Field label="About you" multiline value={formik.values.aboutMe} onChangeText={value => formik.setFieldValue('aboutMe', value)} />
              <Field label="Partner preference" multiline value={formik.values.preferences} onChangeText={value => formik.setFieldValue('preferences', value)} />
              <Button label="Continue to plans" onPress={goToPlans} />
            </>
          ) : (
            <RegisterStepTwo
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              profilePhotos={profilePhotos}
              familyPhoto={formik.values.familyPhoto}
              identityProof={formik.values.identityProof}
              onChangeProfilePhotos={photos => {
                setProfilePhotos(photos);
                formik.setFieldValue('profilePhoto', photos[0] || '');
              }}
              onChangeFamilyPhoto={url => formik.setFieldValue('familyPhoto', url)}
              onChangeIdentityProof={url => formik.setFieldValue('identityProof', url)}
              profileError={touchedError(formik, 'profilePhoto')}
              familyError={touchedError(formik, 'familyPhoto')}
              identityError={touchedError(formik, 'identityProof')}
              busy={busy}
              onBack={() => {
                setNotice('');
                setStep(1);
              }}
              onSubmit={() => formik.handleSubmit()}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={districtOpen} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Districts</Text>
          <FlatList
            data={districts}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => (
              <Pressable
                style={styles.district}
                onPress={() => {
                  formik.setFieldValue('district', item.name);
                  setDistrictOpen(false);
                }}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planSub}>{item.tamil}</Text>
              </Pressable>
            )}
          />
          <Button label="Close" variant="outline" onPress={() => setDistrictOpen(false)} />
        </View>
      </Modal>
    </Screen>
  );
}

function Choice({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceOn]}>
      <Text style={[styles.choiceText, active && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

function touchedError(formik: {touched: Record<string, boolean | undefined>; errors: Record<string, string | undefined>}, key: string) {
  return formik.touched[key] ? formik.errors[key] : undefined;
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  stepTwoBg: {backgroundColor: colors.ink},
  content: {padding: 20, paddingBottom: 40},
  stepTwoContent: {padding: 20, paddingBottom: 48, backgroundColor: colors.ink},
  kicker: {color: colors.rose, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase'},
  title: {fontSize: 28, fontWeight: '800', color: colors.ink, marginBottom: 12, marginTop: 4},
  notice: {backgroundColor: colors.amberLight, color: colors.ink, padding: 12, borderRadius: radii.sm, marginBottom: 12},
  label: {color: colors.ink80, fontWeight: '600', marginBottom: 8},
  row: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12},
  choice: {borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: colors.white},
  choiceOn: {backgroundColor: colors.plum, borderColor: colors.plum},
  choiceText: {color: colors.ink60},
  choiceTextOn: {color: colors.white, fontWeight: '700'},
  inline: {marginBottom: 12},
  picker: {backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.sm, padding: 14, marginBottom: 8},
  pickerValue: {color: colors.ink, fontSize: 16},
  pickerPlaceholder: {color: colors.ink40, fontSize: 16},
  error: {color: colors.danger, marginBottom: 10},
  planName: {fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 4},
  planSub: {color: colors.ink60, marginTop: 2},
  modal: {flex: 1, backgroundColor: colors.surface, padding: 20, paddingTop: 56},
  district: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSoft},
});
