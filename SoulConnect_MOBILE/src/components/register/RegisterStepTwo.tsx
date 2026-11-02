import React, {useState} from 'react';
import {ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Camera, Check, FileText, Images, Plus, ShieldCheck, Trash2, UploadCloud, Users, X} from 'lucide-react-native';
import {PlanCard} from '../../services/api';
import {MediaKind, MediaSource, pickMedia, uploadPicked} from '../../services/media';
import {colors, radii} from '../../theme/colors';

const DOC_TYPES = ['Aadhaar Card', 'Voter ID', 'Driving License', 'Passport'];

interface RegisterStepTwoProps {
  plans: PlanCard[];
  selectedPlan: PlanCard | null;
  onSelectPlan: (plan: PlanCard) => void;
  profilePhotos: string[];
  familyPhoto: string;
  identityProof: string;
  onChangeProfilePhotos: (photos: string[]) => void;
  onChangeFamilyPhoto: (url: string) => void;
  onChangeIdentityProof: (url: string) => void;
  profileError?: string;
  familyError?: string;
  identityError?: string;
  busy?: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function RegisterStepTwo({
  plans,
  selectedPlan,
  onSelectPlan,
  profilePhotos,
  familyPhoto,
  identityProof,
  onChangeProfilePhotos,
  onChangeFamilyPhoto,
  onChangeIdentityProof,
  profileError,
  familyError,
  identityError,
  busy,
  onBack,
  onSubmit,
}: RegisterStepTwoProps) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [sourceFor, setSourceFor] = useState<MediaKind | null>(null);
  const [uploading, setUploading] = useState(false);
  const [identityName, setIdentityName] = useState('');

  const chooseSource = async (source: MediaSource) => {
    const kind = sourceFor;
    setSourceFor(null);
    if (!kind) {
      return;
    }
    const file = await pickMedia(source);
    if (!file) {
      return;
    }
    setUploading(true);
    const picked = await uploadPicked(kind, file);
    setUploading(false);
    if (!picked) {
      return;
    }
    if (kind === 'profile' && profilePhotos.length < 3) {
      onChangeProfilePhotos([...profilePhotos, picked.url]);
    } else if (kind === 'family') {
      onChangeFamilyPhoto(picked.url);
    } else if (kind === 'identity') {
      setIdentityName(picked.name);
      onChangeIdentityProof(picked.url);
    }
  };

  return (
    <View>
      <Text style={styles.kicker}>Registration</Text>
      <Text style={styles.title}>Choose plan and verify identity</Text>
      <Text style={styles.sub}>
        Secure your match compatibility ratings and access active communication features by finishing setup.
      </Text>

      <View style={styles.steps}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepDone]}>
            <Text style={styles.stepDotText}>✓</Text>
          </View>
          <Text style={styles.stepDoneLabel}>Profile details</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepCurrent]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
          <Text style={styles.stepCurrentLabel}>Plans and verification</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>1. Upload profile and family photos</Text>
      <Text style={styles.sectionSub}>
        Add high quality photos to make your profile stand out and gain verified responses.
      </Text>

      <View style={styles.photoCard}>
        <View style={styles.photoHead}>
          <View style={styles.iconBubble}>
            <Camera color={colors.plum} size={18} />
          </View>
          <Text style={styles.photoTitle}>
            Profile images <Text style={styles.req}>*</Text>
          </Text>
          <Text style={styles.photoLimit}>Max 3 photos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {profilePhotos.map((url, index) => (
            <View key={`${url}-${index}`} style={[styles.photoTile, index === 0 && styles.photoDefault]}>
              {index === 0 ? <Text style={styles.defaultBadge}>★ Default</Text> : null}
              <Image source={{uri: url}} style={styles.photo} />
              <Pressable
                style={styles.remove}
                onPress={() => onChangeProfilePhotos(profilePhotos.filter((_, photoIndex) => photoIndex !== index))}>
                <Trash2 color={colors.white} size={14} />
              </Pressable>
            </View>
          ))}
          {profilePhotos.length < 3 ? (
            <Pressable style={styles.addTile} onPress={() => setSourceFor('profile')}>
              <Plus color={colors.ink40} size={28} />
              <Text style={styles.addLabel}>Add image</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
      </View>

      <View style={styles.photoCard}>
        <View style={styles.photoHead}>
          <View style={styles.iconBubble}>
            <Users color={colors.plum} size={18} />
          </View>
          <Text style={styles.photoTitle}>
            Family photos <Text style={styles.req}>*</Text>
          </Text>
          <Text style={styles.photoLimit}>Max 1 photo</Text>
        </View>
        {familyPhoto ? (
          <View style={styles.photoTile}>
            <Image source={{uri: familyPhoto}} style={styles.photo} />
            <Pressable style={styles.remove} onPress={() => onChangeFamilyPhoto('')}>
              <Trash2 color={colors.white} size={14} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addTile} onPress={() => setSourceFor('family')}>
            <Plus color={colors.ink40} size={28} />
            <Text style={styles.addLabel}>Add family photo</Text>
          </Pressable>
        )}
        {familyError ? <Text style={styles.error}>{familyError}</Text> : null}
      </View>

      <Text style={[styles.sectionTitle, styles.planHeading]}>2. Select membership plan</Text>
      <Text style={styles.sectionSub}>Choose the membership level that suits your matchmaking goals.</Text>

      {plans.map(plan => {
        const selected = selectedPlan?.id === plan.id;
        const badge = badgeFor(plan.name);
        return (
          <Pressable
            key={plan.id}
            onPress={() => onSelectPlan(plan)}
            style={[styles.planCard, selected && styles.planSelected]}>
            {plan.isPopular ? <Text style={styles.popular}>Most popular</Text> : null}
            <Text style={[styles.badge, {backgroundColor: selected ? 'rgba(255,255,255,0.25)' : badge.bg, color: selected ? colors.white : badge.fg}]}>
              {badge.label}
            </Text>
            <Text style={[styles.price, selected && styles.onDark]}>{plan.price}</Text>
            <Text style={[styles.planDesc, selected && styles.onDarkSoft]}>{plan.sub}</Text>
            <Text style={[styles.planName, selected && styles.onDark]}>{plan.name}</Text>
            {plan.features.map(feature => (
              <View key={feature} style={styles.featureRow}>
                <Check color={selected ? colors.white : colors.sage} size={16} />
                <Text style={[styles.feature, selected && styles.onDark]}>{feature}</Text>
              </View>
            ))}
            <Pressable
              onPress={() => onSelectPlan(plan)}
              style={[styles.selectBtn, selected && styles.selectBtnOn]}>
              <Text style={[styles.selectLabel, selected && styles.selectLabelOn]}>
                {selected ? 'Selected ✓' : 'Select plan'}
              </Text>
            </Pressable>
          </Pressable>
        );
      })}

      <View style={styles.idCard}>
        <View style={styles.idHead}>
          <ShieldCheck color={colors.plum} size={22} />
          <Text style={styles.idTitle}>Secure government ID verification</Text>
        </View>
        <Text style={styles.idSub}>
          All uploads are encrypted and processed in compliance with Aadhaar vault directives.
        </Text>

        <View style={styles.idStep}>
          <Text style={styles.idNum}>1</Text>
          <Text style={styles.idStepLabel}>Select identity document type</Text>
        </View>
        <View style={styles.pills}>
          {DOC_TYPES.map(type => (
            <Pressable key={type} onPress={() => setDocType(type)} style={[styles.pill, docType === type && styles.pillOn]}>
              <Text style={[styles.pillText, docType === type && styles.pillTextOn]}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.idStep}>
          <Text style={styles.idNum}>2</Text>
          <Text style={styles.idStepLabel}>Upload scanned copy (front and back)</Text>
        </View>
        <Text style={styles.idHint}>Ensure full page visibility, text is sharp and unblurred.</Text>

        {identityProof ? (
          <View style={[styles.dropZone, styles.dropReady]}>
            {isPdf(identityProof, identityName) ? (
              <FileText color={colors.sage} size={36} />
            ) : (
              <Image source={{uri: identityProof}} style={styles.idPreview} />
            )}
            <Text style={styles.dropReadyTitle}>{docType} attached</Text>
            <Text style={styles.dropReadySub} numberOfLines={1}>
              {identityName || fileLabel(identityProof)}
            </Text>
            <Pressable
              style={styles.dropClear}
              onPress={() => {
                setIdentityName('');
                onChangeIdentityProof('');
              }}>
              <X color={colors.white} size={14} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setSourceFor('identity')} style={styles.dropZone}>
            <UploadCloud color={colors.plum} size={36} />
            <Text style={styles.dropTitle}>Tap to add your {docType}</Text>
            <Text style={styles.dropSub}>Gallery or documents</Text>
          </Pressable>
        )}
        {identityError ? <Text style={styles.error}>{identityError}</Text> : null}

        <Text style={styles.meterTitle}>Account verification and trust meter</Text>
        <Meter label="Level 1: Basic profile" filled labelRight="Basic" tone="basic" />
        <Meter
          label="Level 2: ID document approved"
          filled={Boolean(identityProof)}
          labelRight={identityProof ? 'Submitted' : 'Pending'}
          tone={identityProof ? 'done' : 'pending'}
        />
      </View>

      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backLabel}>Back to profile details</Text>
      </Pressable>
      <Pressable onPress={onSubmit} disabled={busy} style={[styles.submitBtn, busy && styles.disabled]}>
        <Text style={styles.submitLabel}>{busy ? 'Please wait…' : 'Submit and complete registration ✦'}</Text>
      </Pressable>

      <Modal visible={sourceFor != null} transparent animationType="slide" onRequestClose={() => setSourceFor(null)}>
        <Pressable style={styles.sheetScrim} onPress={() => setSourceFor(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>
              {sourceFor === 'identity' ? `Add ${docType}` : sourceFor === 'family' ? 'Add family photo' : 'Add profile image'}
            </Text>
            <Text style={styles.sheetSub}>
              {sourceFor === 'identity' ? 'Choose a photo from your gallery, or a file from documents.' : 'Choose a photo from your gallery, or take one with the camera.'}
            </Text>
            <SourceButton icon={Images} label="Gallery" onPress={() => chooseSource('library')} />
            {sourceFor === 'identity' ? (
              <SourceButton icon={FileText} label="Documents" onPress={() => chooseSource('documents')} />
            ) : (
              <SourceButton icon={Camera} label="Camera" onPress={() => chooseSource('camera')} />
            )}
            <Pressable onPress={() => setSourceFor(null)} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={uploading} transparent animationType="fade">
        <View style={styles.sheetScrim}>
          <View style={styles.uploadingCard}>
            <ActivityIndicator color={colors.plum} />
            <Text style={styles.uploadingText}>Uploading…</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SourceButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Camera;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.sourceBtn}>
      <View style={styles.iconBubble}>
        <Icon color={colors.plum} size={18} />
      </View>
      <Text style={styles.sourceLabel}>{label}</Text>
    </Pressable>
  );
}

function isPdf(url: string, name: string) {
  return /\.pdf($|\?)/i.test(url) || name.toLowerCase().endsWith('.pdf');
}

function fileLabel(url: string) {
  const clean = url.split('?')[0];
  const name = decodeURIComponent(clean.split('/').pop() || 'Document');
  return name || 'Document';
}

function Meter({
  label,
  filled,
  labelRight,
  tone,
}: {
  label: string;
  filled: boolean;
  labelRight: string;
  tone: 'basic' | 'done' | 'pending';
}) {
  return (
    <View style={styles.meterRow}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, {width: filled ? '100%' : '0%'}]} />
      </View>
      <Text style={[styles.meterBadge, tone === 'basic' && styles.meterBasic, tone === 'done' && styles.meterDone, tone === 'pending' && styles.meterPending]}>
        {labelRight}
      </Text>
    </View>
  );
}

function badgeFor(name: string) {
  const value = name.toLowerCase();
  if (value.includes('free')) {
    return {bg: colors.sageLight, fg: colors.sage, label: 'Free'};
  }
  if (value.includes('elite')) {
    return {bg: colors.amberLight, fg: colors.amber, label: 'Elite'};
  }
  if (value.includes('gold') || value.includes('vip')) {
    return {bg: colors.roseLight, fg: colors.roseDark, label: 'VIP'};
  }
  return {bg: colors.plumLight, fg: colors.plumDark, label: 'Premium'};
}

const styles = StyleSheet.create({
  kicker: {color: colors.rose, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center'},
  title: {color: colors.white, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8},
  sub: {color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginTop: 8},
  steps: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 22},
  stepItem: {flexDirection: 'row', alignItems: 'center'},
  stepDot: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  stepDone: {backgroundColor: colors.sage},
  stepCurrent: {backgroundColor: colors.rose},
  stepDotText: {color: colors.white, fontWeight: '800', fontSize: 12},
  stepDoneLabel: {color: colors.sage, fontSize: 11, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase'},
  stepCurrentLabel: {color: colors.rose, fontSize: 11, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase'},
  stepLine: {width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8},
  sectionTitle: {color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center'},
  sectionSub: {color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 6, marginBottom: 16, lineHeight: 20},
  planHeading: {marginTop: 8},
  photoCard: {backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 14},
  photoHead: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  iconBubble: {width: 36, height: 36, borderRadius: 12, backgroundColor: colors.plumLight, alignItems: 'center', justifyContent: 'center', marginRight: 10},
  photoTitle: {flex: 1, color: colors.ink, fontSize: 16, fontWeight: '800'},
  req: {color: colors.danger},
  photoLimit: {color: colors.ink40, fontSize: 12},
  photoRow: {gap: 12},
  photoTile: {width: 132, height: 176, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#E2E8F0'},
  photoDefault: {borderColor: colors.saffron},
  photo: {width: '100%', height: '100%'},
  defaultBadge: {position: 'absolute', top: 8, left: 8, zIndex: 2, backgroundColor: colors.saffron, color: colors.white, fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden'},
  remove: {position: 'absolute', right: 8, bottom: 8, backgroundColor: colors.danger, borderRadius: 14, padding: 6},
  addTile: {width: 132, height: 176, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E2E8F0', backgroundColor: 'rgba(248,250,252,0.8)', alignItems: 'center', justifyContent: 'center'},
  addLabel: {color: colors.ink40, fontWeight: '700', fontSize: 12, marginTop: 8},
  planCard: {backgroundColor: colors.white, borderRadius: radii.lg, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.borderSoft},
  planSelected: {backgroundColor: colors.plum, borderColor: colors.plum},
  popular: {alignSelf: 'center', marginBottom: 10, backgroundColor: colors.saffron, color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radii.pill, overflow: 'hidden'},
  badge: {alignSelf: 'flex-start', overflow: 'hidden', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12},
  price: {fontSize: 32, fontWeight: '800', color: colors.ink},
  planDesc: {color: colors.ink60, marginTop: 6, marginBottom: 14, lineHeight: 20},
  planName: {fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 12},
  featureRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8},
  feature: {flex: 1, marginLeft: 8, color: colors.ink80, lineHeight: 20},
  onDark: {color: colors.white},
  onDarkSoft: {color: 'rgba(255,255,255,0.8)'},
  selectBtn: {marginTop: 14, borderWidth: 2, borderColor: colors.plum, borderRadius: 12, paddingVertical: 12, alignItems: 'center'},
  selectBtnOn: {backgroundColor: colors.white, borderColor: colors.white},
  selectLabel: {color: colors.plum, fontWeight: '800'},
  selectLabelOn: {color: colors.plumDark},
  idCard: {backgroundColor: colors.white, borderRadius: radii.lg, padding: 18, marginTop: 8},
  idHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  idTitle: {flex: 1, color: colors.ink, fontSize: 18, fontWeight: '800'},
  idSub: {color: colors.ink60, marginTop: 8, marginBottom: 18, lineHeight: 20},
  idStep: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  idNum: {width: 24, height: 24, borderRadius: 12, backgroundColor: colors.plumLight, color: colors.plumDark, textAlign: 'center', lineHeight: 24, fontWeight: '800', marginRight: 10, overflow: 'hidden'},
  idStepLabel: {flex: 1, color: colors.ink, fontWeight: '800'},
  pills: {flexDirection: 'row', flexWrap: 'wrap', marginLeft: 34, marginBottom: 16},
  pill: {borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8},
  pillOn: {borderColor: colors.plum, backgroundColor: colors.plumLight},
  pillText: {color: colors.ink60, fontWeight: '600'},
  pillTextOn: {color: colors.plumDark, fontWeight: '800'},
  idHint: {color: colors.ink40, fontSize: 12, marginLeft: 34, marginBottom: 10},
  dropZone: {marginLeft: 34, minHeight: 140, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderSoft, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 16},
  dropReady: {borderColor: colors.sage, backgroundColor: colors.sageLight},
  dropTitle: {color: colors.ink80, fontWeight: '800', marginTop: 8},
  dropSub: {color: colors.ink40, marginTop: 4},
  idPreview: {width: 72, height: 72, borderRadius: 12, marginBottom: 8},
  dropReadyTitle: {color: '#047857', fontWeight: '800', marginTop: 8},
  dropReadySub: {color: colors.sage, marginTop: 4, maxWidth: '90%'},
  dropClear: {position: 'absolute', top: 8, right: 8, backgroundColor: colors.rose, borderRadius: 12, padding: 4},
  meterTitle: {fontWeight: '800', color: colors.ink, marginTop: 18, marginBottom: 10},
  meterRow: {marginBottom: 12},
  meterLabel: {color: colors.ink80, fontSize: 13, marginBottom: 6},
  meterTrack: {height: 8, borderRadius: 8, backgroundColor: '#E5E7EB', overflow: 'hidden'},
  meterFill: {height: 8, backgroundColor: colors.plum},
  meterBadge: {marginTop: 4, fontSize: 12, fontWeight: '800'},
  meterBasic: {color: colors.plum},
  meterDone: {color: colors.sage},
  meterPending: {color: colors.ink40},
  backBtn: {marginTop: 22, borderWidth: 2, borderColor: colors.white, borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center'},
  backLabel: {color: colors.white, fontWeight: '700', fontSize: 16},
  submitBtn: {marginTop: 12, backgroundColor: colors.rose, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center'},
  submitLabel: {color: colors.white, fontWeight: '800', fontSize: 16},
  disabled: {opacity: 0.6},
  error: {color: colors.danger, marginTop: 8},
  sheetScrim: {flex: 1, backgroundColor: 'rgba(15,10,30,0.55)', justifyContent: 'flex-end'},
  sheet: {backgroundColor: colors.white, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: 20, paddingBottom: 28},
  sheetTitle: {fontSize: 18, fontWeight: '800', color: colors.ink},
  sheetSub: {color: colors.ink60, marginTop: 6, marginBottom: 16, lineHeight: 20},
  sourceBtn: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.md, padding: 12, marginBottom: 10},
  sourceLabel: {color: colors.ink, fontWeight: '800', fontSize: 16, marginLeft: 4},
  sheetCancel: {alignItems: 'center', paddingVertical: 12},
  sheetCancelText: {color: colors.ink60, fontWeight: '700'},
  uploadingCard: {alignSelf: 'center', marginBottom: 120, backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: 28, paddingVertical: 22, alignItems: 'center'},
  uploadingText: {color: colors.ink, fontWeight: '700', marginTop: 10},
});
