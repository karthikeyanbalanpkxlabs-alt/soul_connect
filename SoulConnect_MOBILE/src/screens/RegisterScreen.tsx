import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFormik} from 'formik';
import {RegisterStepOne} from '../components/register/RegisterStepOne';
import {RegisterStepTwo} from '../components/register/RegisterStepTwo';
import {Screen} from '../components/ui/Screen';
import {RootStackParamList} from '../navigation/types';
import {fetchSubscriptions, isFreePrice, mapPlans, PlanCard, savePublicCustomer, sendOtp, verifyOtp} from '../services/api';
import {
  buildCustomerFixture,
  emptyRegistration,
  registrationSchema,
  rememberPendingRegistration,
} from '../services/registration';
import {colors} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

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
      return false;
    }
    if (type === 'phone') {
      setPhoneSent(true);
    } else {
      setEmailSent(true);
    }
    setNotice(type === 'phone' ? 'OTP sent to your mobile.' : 'OTP sent to your email.');
    return true;
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
      headerStyle: {backgroundColor: colors.ink},
      headerTintColor: colors.white,
      headerTitleStyle: {color: colors.white},
    });
  }, [navigation]);

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
    <Screen backgroundColor={colors.ink}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={step === 2 ? styles.stepTwoContent : styles.content} keyboardShouldPersistTaps="handled">
          {step === 1 ? (
            <RegisterStepOne
              values={formik.values}
              errorFor={key => touchedError(formik, key)}
              onChange={(key, value) => formik.setFieldValue(key, value)}
              onTouch={key => formik.setFieldTouched(key)}
              phoneVerified={phoneVerified}
              emailVerified={emailVerified}
              phoneSent={phoneSent}
              emailSent={emailSent}
              phoneOtp={phoneOtp}
              emailOtp={emailOtp}
              onPhoneOtp={setPhoneOtp}
              onEmailOtp={setEmailOtp}
              busy={busy}
              onSendPhone={() => sendCode('phone')}
              onSendEmail={() => sendCode('email')}
              onVerifyPhone={() => confirmCode('phone')}
              onVerifyEmail={() => confirmCode('email')}
              onCancelPhone={() => {
                setPhoneSent(false);
                setPhoneOtp('');
              }}
              onCancelEmail={() => {
                setEmailSent(false);
                setEmailOtp('');
              }}
              onEditPhone={() => {
                setPhoneVerified(false);
                setPhoneSent(false);
                setPhoneOtp('');
              }}
              onEditEmail={() => {
                setEmailVerified(false);
                setEmailSent(false);
                setEmailOtp('');
              }}
              notice={notice}
              onContinue={goToPlans}
            />
          ) : (
            <>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
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
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function touchedError(formik: {touched: Record<string, boolean | undefined>; errors: Record<string, string | undefined>}, key: string) {
  return formik.touched[key] ? formik.errors[key] : undefined;
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.ink},
  content: {paddingTop: 8, paddingBottom: 28, backgroundColor: colors.ink},
  stepTwoContent: {padding: 20, paddingBottom: 48, backgroundColor: colors.ink},
  notice: {backgroundColor: '#FEF3C7', color: colors.ink, padding: 12, borderRadius: 12, marginBottom: 12},
});
