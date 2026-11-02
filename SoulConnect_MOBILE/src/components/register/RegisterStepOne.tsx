import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {districts} from '../../data/districts';
import {RegistrationValues} from '../../services/registration';
import {colors, radii} from '../../theme/colors';
import {
  birthYears,
  CM_HEIGHTS,
  daysInMonth,
  EDUCATION,
  FT_HEIGHTS,
  GENDERS,
  INCOMES,
  MARITAL,
  MONTHS,
  MOTHER_TONGUES,
  PROFESSIONS,
  REGISTER_FOR,
  RELIGIONS,
  WHY_REGISTER,
} from './options';

interface RegisterStepOneProps {
  values: RegistrationValues;
  errorFor: (key: keyof RegistrationValues) => string | undefined;
  onChange: (key: keyof RegistrationValues, value: string) => void;
  onTouch: (key: keyof RegistrationValues) => void;
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneSent: boolean;
  emailSent: boolean;
  phoneOtp: string;
  emailOtp: string;
  onPhoneOtp: (value: string) => void;
  onEmailOtp: (value: string) => void;
  busy: boolean;
  onSendPhone: () => Promise<boolean>;
  onSendEmail: () => Promise<boolean>;
  onVerifyPhone: () => void;
  onVerifyEmail: () => void;
  onCancelPhone: () => void;
  onCancelEmail: () => void;
  onEditPhone: () => void;
  onEditEmail: () => void;
  onContinue: () => void;
  notice?: string;
}

type SheetState = {
  title: string;
  options: {label: string; value: string}[];
  selected?: string;
  onSelect: (value: string) => void;
};

export function RegisterStepOne(props: RegisterStepOneProps) {
  const {width} = useWindowDimensions();
  const paired = width >= 700;
  const sideBySide = width >= 980;
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>(props.values.height.includes('cm (') ? 'cm' : 'ft');
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [query, setQuery] = useState('');
  const [phoneWait, setPhoneWait] = useState(0);
  const [emailWait, setEmailWait] = useState(0);
  const [dob, setDobParts] = useState(() => splitDob(props.values.dob));

  useEffect(() => {
    if (phoneWait <= 0) {
      return;
    }
    const timer = setTimeout(() => setPhoneWait(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [phoneWait]);

  useEffect(() => {
    if (emailWait <= 0) {
      return;
    }
    const timer = setTimeout(() => setEmailWait(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailWait]);

  const openSheet = (next: SheetState) => {
    setQuery('');
    setSheet(next);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!sheet || !needle) {
      return sheet?.options || [];
    }
    return sheet.options.filter(option => option.label.toLowerCase().includes(needle));
  }, [query, sheet]);

  const setDob = (part: 'year' | 'month' | 'day', value: string) => {
    const next = {...dob, [part]: value};
    const maxDay = daysInMonth(next.year, next.month);
    if (next.day && Number(next.day) > maxDay) {
      next.day = '';
    }
    setDobParts(next);
    props.onChange('dob', next.year && next.month && next.day ? `${next.year}-${next.month}-${next.day}` : '');
    props.onTouch('dob');
  };

  const sendPhone = async () => {
    const ok = await props.onSendPhone();
    if (ok) {
      setPhoneWait(30);
    }
  };

  const sendEmail = async () => {
    const ok = await props.onSendEmail();
    if (ok) {
      setEmailWait(30);
    }
  };

  const form = (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Create your profile</Text>
      <Text style={styles.cardSub}>Fill in your details. Takes about 10 minutes. All fields are private by default.</Text>

      <Section label="Personal information" />
      <Text style={styles.choiceLabel}>
        I am registering <Text style={styles.req}>*</Text>
      </Text>
      <View style={styles.choiceWrap}>
        {REGISTER_FOR.map(option => {
          const active = props.values.registerFor === option.label;
          return (
            <Pressable
              key={option.label}
              onPress={() => {
                props.onChange('registerFor', option.label);
                if (option.gender) {
                  props.onChange('gender', option.gender);
                }
              }}
              style={[styles.choice, active && styles.choiceOn]}>
              <Text style={styles.choiceIcon}>{option.icon}</Text>
              <Text style={[styles.choiceText, active && styles.choiceTextOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <ErrorText message={props.errorFor('registerFor')} />

      <Row paired={paired}>
        <Field
          fill={paired}
          label="First name"
          required
          value={props.values.firstName}
          placeholder="Enter first name"
          error={props.errorFor('firstName')}
          onChangeText={value => props.onChange('firstName', value)}
          onBlur={() => props.onTouch('firstName')}
        />
        <Field
          fill={paired}
          label="Last name"
          required
          value={props.values.lastName}
          placeholder="Enter last name"
          error={props.errorFor('lastName')}
          onChangeText={value => props.onChange('lastName', value)}
          onBlur={() => props.onTouch('lastName')}
        />
      </Row>

      <Row paired={paired}>
        <View style={[styles.group, paired && styles.fill]}>
          <Text style={styles.fieldLabel}>
            Date of birth <Text style={styles.req}>*</Text>
          </Text>
          <View style={styles.dateRow}>
            <SelectBox
              flex
              value={MONTHS.find(month => month.value === dob.month)?.label || ''}
              placeholder="Month"
              onPress={() =>
                openSheet({
                  title: 'Month',
                  selected: dob.month,
                  options: MONTHS,
                  onSelect: value => setDob('month', value),
                })
              }
            />
            <SelectBox
              flex
              value={dob.day ? String(Number(dob.day)) : ''}
              placeholder="Day"
              onPress={() =>
                openSheet({
                  title: 'Day',
                  selected: dob.day,
                  options: Array.from({length: daysInMonth(dob.year, dob.month)}, (_, index) => {
                    const day = String(index + 1).padStart(2, '0');
                    return {label: String(index + 1), value: day};
                  }),
                  onSelect: value => setDob('day', value),
                })
              }
            />
            <SelectBox
              flex
              value={dob.year}
              placeholder="Year"
              onPress={() =>
                openSheet({
                  title: 'Year',
                  selected: dob.year,
                  options: birthYears().map(year => ({label: year, value: year})),
                  onSelect: value => setDob('year', value),
                })
              }
            />
          </View>
          <ErrorText message={props.errorFor('dob')} />
        </View>
        <SelectField
          fill={paired}
          label="Gender"
          required
          value={props.values.gender}
          placeholder="Select gender"
          error={props.errorFor('gender')}
          onPress={() =>
            openSheet({
              title: 'Gender',
              selected: props.values.gender,
              options: GENDERS.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('gender', value),
            })
          }
        />
      </Row>

      <Row paired={paired}>
        <View style={[styles.group, paired && styles.fill]}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Mobile number <Text style={styles.req}>*</Text>
            </Text>
            {props.phoneVerified ? <Text style={styles.verified}>✓ Verified</Text> : null}
          </View>
          <View style={[styles.phoneBox, props.phoneVerified && styles.phoneReady]}>
            <Text style={styles.prefix}>🇮🇳 +91</Text>
            <TextInput
              value={props.values.mobile}
              editable={!props.phoneVerified}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="9876543210"
              placeholderTextColor={colors.ink40}
              onChangeText={value => {
                props.onChange('mobile', value.replace(/[^0-9]/g, '').slice(0, 10));
                if (props.phoneVerified || props.phoneSent) {
                  props.onEditPhone();
                }
              }}
              onBlur={() => props.onTouch('mobile')}
              style={styles.phoneInput}
            />
            <Pressable
              disabled={props.busy || (props.phoneVerified ? false : props.values.mobile.length !== 10)}
              onPress={props.phoneVerified ? props.onEditPhone : sendPhone}
              style={[styles.inlineBtn, props.phoneVerified && styles.editBtn, (props.busy || (!props.phoneVerified && props.values.mobile.length !== 10)) && styles.disabled]}>
              <Text style={[styles.inlineBtnText, props.phoneVerified && styles.editBtnText]}>
                {props.phoneVerified ? 'Edit' : props.phoneSent ? 'Resend' : 'Send OTP'}
              </Text>
            </Pressable>
          </View>
          <ErrorText message={props.errorFor('mobile')} />
          {props.phoneSent && !props.phoneVerified ? (
            <OtpCard
              tone="rose"
              value={props.phoneOtp}
              wait={phoneWait}
              busy={props.busy}
              onChange={props.onPhoneOtp}
              onVerify={props.onVerifyPhone}
              onResend={sendPhone}
              onCancel={props.onCancelPhone}
            />
          ) : null}
        </View>

        <View style={[styles.group, paired && styles.fill]}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Email address <Text style={styles.req}>*</Text>
            </Text>
            {props.emailVerified ? <Text style={styles.verified}>✓ Verified</Text> : null}
          </View>
          <View style={[styles.phoneBox, props.emailVerified && styles.phoneReady]}>
            <TextInput
              value={props.values.email}
              editable={!props.emailVerified}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@email.com"
              placeholderTextColor={colors.ink40}
              onChangeText={value => {
                props.onChange('email', value);
                if (props.emailVerified || props.emailSent) {
                  props.onEditEmail();
                }
              }}
              onBlur={() => props.onTouch('email')}
              style={styles.phoneInput}
            />
            <Pressable
              disabled={props.busy || (props.emailVerified ? false : !props.values.email.includes('@'))}
              onPress={props.emailVerified ? props.onEditEmail : sendEmail}
              style={[styles.inlineBtn, props.emailVerified && styles.editBtn, (props.busy || (!props.emailVerified && !props.values.email.includes('@'))) && styles.disabled]}>
              <Text style={[styles.inlineBtnText, props.emailVerified && styles.editBtnText]}>
                {props.emailVerified ? 'Edit' : props.emailSent ? 'Resend' : 'Send OTP'}
              </Text>
            </Pressable>
          </View>
          <ErrorText message={props.errorFor('email')} />
          {props.emailSent && !props.emailVerified ? (
            <OtpCard
              tone="plum"
              value={props.emailOtp}
              wait={emailWait}
              busy={props.busy}
              onChange={props.onEmailOtp}
              onVerify={props.onVerifyEmail}
              onResend={sendEmail}
              onCancel={props.onCancelEmail}
            />
          ) : null}
        </View>
      </Row>

      <Section label="Location — Tamil Nadu" />
      <Row paired={paired}>
        <SelectField
          fill={paired}
          label="District (மாவட்டம்)"
          required
          value={districtLabel(props.values.district)}
          placeholder="Select district"
          error={props.errorFor('district')}
          onPress={() =>
            openSheet({
              title: 'District',
              selected: props.values.district,
              options: districts.map(item => ({label: `${item.name} (${item.tamil})`, value: item.name})),
              onSelect: value => props.onChange('district', value),
            })
          }
        />
        <Field
          fill={paired}
          label="Taluk / town"
          value={props.values.taluk}
          placeholder="Enter your taluk or town"
          onChangeText={value => props.onChange('taluk', value)}
        />
      </Row>

      <Section label="Family & community" />
      <Row paired={paired}>
        <SelectField
          fill={paired}
          label="Religion"
          value={props.values.religion}
          placeholder="Select religion"
          onPress={() =>
            openSheet({
              title: 'Religion',
              selected: props.values.religion,
              options: RELIGIONS.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('religion', value),
            })
          }
        />
        <Field
          fill={paired}
          label="Caste / community"
          value={props.values.caste}
          placeholder="Enter community (optional)"
          onChangeText={value => props.onChange('caste', value)}
        />
      </Row>
      <Row paired={paired}>
        <SelectField
          fill={paired}
          label="Mother tongue"
          required
          value={props.values.motherTongue}
          placeholder="Select mother tongue"
          error={props.errorFor('motherTongue')}
          onPress={() =>
            openSheet({
              title: 'Mother tongue',
              selected: props.values.motherTongue,
              options: MOTHER_TONGUES.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('motherTongue', value),
            })
          }
        />
        <SelectField
          fill={paired}
          label="Marital status"
          required
          value={props.values.maritalStatus}
          placeholder="Select marital status"
          error={props.errorFor('maritalStatus')}
          onPress={() =>
            openSheet({
              title: 'Marital status',
              selected: props.values.maritalStatus,
              options: MARITAL.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('maritalStatus', value),
            })
          }
        />
      </Row>

      <Section label="Education & career" />
      <Row paired={paired}>
        <SelectField
          fill={paired}
          label="Education"
          value={props.values.education}
          placeholder="Select highest qualification"
          onPress={() =>
            openSheet({
              title: 'Education',
              selected: props.values.education,
              options: EDUCATION.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('education', value),
            })
          }
        />
        <SelectField
          fill={paired}
          label="Profession"
          value={props.values.profession}
          placeholder="Select profession"
          onPress={() =>
            openSheet({
              title: 'Profession',
              selected: props.values.profession,
              options: PROFESSIONS.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('profession', value),
            })
          }
        />
      </Row>
      <Row paired={paired}>
        <SelectField
          fill={paired}
          label="Annual income (₹)"
          value={props.values.income}
          placeholder="Prefer not to say"
          onPress={() =>
            openSheet({
              title: 'Annual income',
              selected: props.values.income,
              options: INCOMES.map(item => ({label: item, value: item})),
              onSelect: value => props.onChange('income', value),
            })
          }
        />
        <View style={[styles.group, paired && styles.fill]}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Height</Text>
            <View style={styles.unitSwitch}>
              {(['ft', 'cm'] as const).map(unit => (
                <Pressable
                  key={unit}
                  onPress={() => {
                    setHeightUnit(unit);
                    props.onChange('height', '');
                  }}
                  style={[styles.unitBtn, heightUnit === unit && styles.unitBtnOn]}>
                  <Text style={[styles.unitText, heightUnit === unit && styles.unitTextOn]}>{unit === 'ft' ? 'ft / in' : 'cm'}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <SelectBox
            value={props.values.height}
            placeholder={`Select height (${heightUnit === 'ft' ? 'ft/in' : 'cm'})`}
            onPress={() =>
              openSheet({
                title: 'Height',
                selected: props.values.height,
                options: (heightUnit === 'ft' ? FT_HEIGHTS : CM_HEIGHTS).map(item => ({label: item, value: item})),
                onSelect: value => props.onChange('height', value),
              })
            }
          />
        </View>
      </Row>

      <Section label="About you" />
      <Field
        label="About yourself"
        value={props.values.aboutMe}
        placeholder="Tell potential partners about yourself — your interests, values, and what you're looking for..."
        multiline
        onChangeText={value => props.onChange('aboutMe', value)}
      />
      <Field
        label="Partner preferences"
        value={props.values.preferences}
        placeholder="Describe your ideal partner — district preference, profession, values..."
        multiline
        onChangeText={value => props.onChange('preferences', value)}
      />

      <Pressable onPress={props.onContinue} style={styles.submit}>
        <Text style={styles.submitText}>Create profile and get started →</Text>
      </Pressable>
      <Text style={styles.footnote}>Free registration. Document verification and plans are configured in the next step.</Text>
    </View>
  );

  return (
    <View style={[styles.page, sideBySide && styles.pageWide]}>
      <Text style={styles.kicker}>Registration</Text>
      <Text style={styles.title}>Join in your own way</Text>
      <View style={styles.steps}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepCurrent]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <Text style={styles.stepCurrentLabel}>Profile details</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepIdle]}>
            <Text style={styles.stepIdleText}>2</Text>
          </View>
          <Text style={styles.stepIdleLabel}>Plans and verification</Text>
        </View>
      </View>
      {props.notice ? <Text style={styles.notice}>{props.notice}</Text> : null}
      <View style={sideBySide ? styles.split : undefined}>
        <View style={sideBySide ? styles.formSide : undefined}>{form}</View>
        <View style={sideBySide ? styles.infoSide : styles.infoBelow}>
          <Text style={styles.infoTitle}>Why register manually?</Text>
          {WHY_REGISTER.map((item, index) => (
            <View key={item.title} style={styles.infoRow}>
              <Text style={styles.infoNum}>{index + 1}</Text>
              <View style={styles.infoCopy}>
                <Text style={styles.infoHead}>{item.title}</Text>
                <Text style={styles.infoBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={sheet != null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.scrim} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>{sheet?.title}</Text>
            {(sheet?.options.length || 0) > 8 ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor={colors.ink40}
                style={styles.search}
              />
            ) : null}
            <FlatList
              data={filtered}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              style={styles.sheetList}
              renderItem={({item}) => (
                <Pressable
                  style={styles.sheetRow}
                  onPress={() => {
                    sheet?.onSelect(item.value);
                    setSheet(null);
                  }}>
                  <Text style={[styles.sheetLabel, item.value === sheet?.selected && styles.sheetLabelOn]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Row({paired, children}: {paired: boolean; children: React.ReactNode}) {
  return <View style={paired ? styles.pair : undefined}>{children}</View>;
}

function Section({label}: {label: string}) {
  return <Text style={styles.section}>{label}</Text>;
}

function ErrorText({message}: {message?: string}) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

function Field({
  label,
  required,
  value,
  placeholder,
  error,
  multiline,
  fill,
  onChangeText,
  onBlur,
}: {
  label: string;
  fill?: boolean;
  required?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <View style={[styles.group, fill && styles.fill]}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.ink40}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
      />
      <ErrorText message={error} />
    </View>
  );
}

function SelectField({
  label,
  required,
  value,
  placeholder,
  error,
  fill,
  onPress,
}: {
  label: string;
  fill?: boolean;
  required?: boolean;
  value: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.group, fill && styles.fill]}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <SelectBox value={value} placeholder={placeholder} error={Boolean(error)} onPress={onPress} />
      <ErrorText message={error} />
    </View>
  );
}

function SelectBox({
  value,
  placeholder,
  error,
  flex,
  onPress,
}: {
  value: string;
  placeholder: string;
  error?: boolean;
  flex?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.input, styles.select, flex && styles.fill, error && styles.inputError]}>
      <Text style={value ? styles.inputText : styles.placeholder} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Text style={styles.chevron}>▾</Text>
    </Pressable>
  );
}

function OtpCard({
  tone,
  value,
  wait,
  busy,
  onChange,
  onVerify,
  onResend,
  onCancel,
}: {
  tone: 'rose' | 'plum';
  value: string;
  wait: number;
  busy: boolean;
  onChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={[styles.otpCard, tone === 'plum' && styles.otpCardPlum]}>
      <Text style={styles.otpLabel}>Enter OTP</Text>
      <TextInput
        value={value}
        onChangeText={text => onChange(text.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="6-digit OTP"
        placeholderTextColor={colors.ink40}
        style={styles.otpInput}
      />
      <Pressable onPress={onVerify} disabled={busy || value.length !== 6} style={[styles.verifyBtn, (busy || value.length !== 6) && styles.disabled]}>
        <Text style={styles.verifyText}>{busy ? 'Verifying…' : 'Verify OTP'}</Text>
      </Pressable>
      {wait > 0 ? (
        <Text style={styles.wait}>{wait}s</Text>
      ) : (
        <Pressable onPress={onResend} disabled={busy}>
          <Text style={[styles.resend, tone === 'plum' && styles.resendPlum]}>Resend</Text>
        </Pressable>
      )}
      <Pressable onPress={onCancel} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

function splitDob(dob: string) {
  const [year = '', month = '', day = ''] = dob.split('-');
  return {year, month, day};
}

function districtLabel(name: string) {
  const match = districts.find(item => item.name === name);
  return match ? `${match.name} (${match.tamil})` : name;
}

const styles = StyleSheet.create({
  page: {paddingHorizontal: 16, paddingBottom: 28},
  pageWide: {maxWidth: 1100, alignSelf: 'center', width: '100%', paddingHorizontal: 28},
  kicker: {color: colors.rose, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center'},
  title: {color: colors.white, fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 8},
  steps: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22, marginBottom: 18, flexWrap: 'wrap'},
  stepItem: {flexDirection: 'row', alignItems: 'center', marginVertical: 4},
  stepDot: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  stepCurrent: {backgroundColor: colors.rose},
  stepIdle: {backgroundColor: 'rgba(255,255,255,0.1)'},
  stepDotText: {color: colors.white, fontWeight: '800', fontSize: 12},
  stepIdleText: {color: 'rgba(255,255,255,0.4)', fontWeight: '800', fontSize: 12},
  stepCurrentLabel: {color: colors.rose, fontSize: 11, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase'},
  stepIdleLabel: {color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase'},
  stepLine: {width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8},
  notice: {backgroundColor: colors.amberLight, color: colors.ink, padding: 12, borderRadius: radii.sm, marginBottom: 14},
  split: {flexDirection: 'row', alignItems: 'flex-start'},
  formSide: {flex: 1.25},
  infoSide: {flex: 0.75, marginLeft: 28, marginTop: 8},
  infoBelow: {marginTop: 28},
  card: {backgroundColor: colors.white, borderRadius: radii.lg, padding: 20},
  cardTitle: {fontSize: 22, fontWeight: '800', color: colors.ink},
  cardSub: {color: colors.ink60, marginTop: 6, marginBottom: 8, lineHeight: 20},
  section: {
    color: colors.plum,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.plumLight,
  },
  choiceLabel: {color: colors.ink, fontWeight: '800', marginBottom: 10},
  choiceWrap: {flexDirection: 'row', flexWrap: 'wrap'},
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  choiceOn: {borderColor: colors.plum, backgroundColor: 'rgba(237,233,254,0.8)'},
  choiceIcon: {fontSize: 16, marginRight: 6},
  choiceText: {color: '#334155', fontWeight: '700'},
  choiceTextOn: {color: colors.plumDark},
  pair: {flexDirection: 'row', alignItems: 'flex-start', gap: 14},
  group: {marginBottom: 14, minWidth: 0},
  fill: {flex: 1},
  fieldLabel: {color: colors.ink60, fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6},
  req: {color: colors.danger},
  labelRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15,
  },
  inputText: {flex: 1, color: colors.ink, fontSize: 15},
  placeholder: {flex: 1, color: colors.ink40, fontSize: 15},
  multiline: {minHeight: 96, textAlignVertical: 'top'},
  inputError: {borderColor: colors.danger},
  select: {flexDirection: 'row', alignItems: 'center'},
  chevron: {color: colors.ink40, marginLeft: 8},
  dateRow: {flexDirection: 'row', gap: 8},
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  phoneReady: {borderColor: colors.sage, backgroundColor: 'rgba(209,250,229,0.35)'},
  prefix: {
    paddingHorizontal: 10,
    color: colors.ink80,
    fontWeight: '700',
    borderRightWidth: 1,
    borderRightColor: colors.borderSoft,
    alignSelf: 'stretch',
    textAlignVertical: 'center',
    paddingVertical: 12,
  },
  phoneInput: {flex: 1, color: colors.ink, paddingHorizontal: 10, paddingVertical: 10, fontSize: 15},
  inlineBtn: {backgroundColor: colors.rose, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginRight: 6},
  inlineBtnText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  editBtn: {backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1'},
  editBtnText: {color: '#334155'},
  verified: {color: colors.sage, backgroundColor: colors.sageLight, borderRadius: radii.pill, overflow: 'hidden', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6},
  otpCard: {
    marginTop: 8,
    backgroundColor: 'rgba(253,232,239,0.8)',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  otpCardPlum: {backgroundColor: 'rgba(237,233,254,0.8)', borderColor: '#DDD6FE'},
  otpLabel: {color: colors.ink80, fontWeight: '700', fontSize: 12, marginRight: 8},
  otpInput: {
    width: 120,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rose,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 2,
    paddingVertical: 6,
    color: colors.ink,
    marginRight: 8,
    marginBottom: 6,
  },
  verifyBtn: {backgroundColor: colors.sage, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginBottom: 6},
  verifyText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  wait: {color: colors.ink60, fontSize: 12, marginRight: 8},
  resend: {color: colors.rose, fontWeight: '800', fontSize: 12, marginRight: 8},
  resendPlum: {color: colors.plum},
  cancelBtn: {backgroundColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 6},
  cancelText: {color: colors.ink60, fontWeight: '700', fontSize: 12},
  unitSwitch: {flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 2, marginBottom: 6},
  unitBtn: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  unitBtnOn: {backgroundColor: colors.plum},
  unitText: {color: colors.ink60, fontSize: 11, fontWeight: '700'},
  unitTextOn: {color: colors.white},
  submit: {backgroundColor: colors.rose, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8},
  submitText: {color: colors.white, fontWeight: '800', fontSize: 16},
  footnote: {color: colors.ink40, fontSize: 12, textAlign: 'center', marginTop: 10},
  error: {color: colors.danger, fontSize: 12, marginTop: 4},
  infoTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 16},
  infoRow: {flexDirection: 'row', marginBottom: 18},
  infoNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 34,
    color: colors.rose,
    fontWeight: '800',
    borderWidth: 1.5,
    borderColor: 'rgba(242,104,140,0.4)',
    backgroundColor: 'rgba(242,104,140,0.15)',
    marginRight: 12,
    overflow: 'hidden',
  },
  infoCopy: {flex: 1},
  infoHead: {color: colors.white, fontWeight: '700', marginBottom: 3},
  infoBody: {color: 'rgba(255,255,255,0.45)', lineHeight: 20},
  scrim: {flex: 1, backgroundColor: 'rgba(15,10,30,0.55)', justifyContent: 'flex-end'},
  sheet: {backgroundColor: colors.white, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: 16, maxHeight: '75%'},
  sheetTitle: {fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 10},
  search: {borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, color: colors.ink},
  sheetList: {flexGrow: 0},
  sheetRow: {paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSoft},
  sheetLabel: {color: colors.ink, fontSize: 16},
  sheetLabelOn: {color: colors.plum, fontWeight: '800'},
  disabled: {opacity: 0.5},
});
