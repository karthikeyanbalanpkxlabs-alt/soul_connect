import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {districts} from '../../data/districts';
import {updateCustomerProfile, uploadMediaFile} from '../../services/api';
import {pickMedia} from '../../services/media';
import {
  ageFromDob,
  completeness,
  draftError,
  draftFromProfile,
  ProfileDraft,
  profilePayload,
} from '../../services/profileDraft';
import {colors, radii} from '../../theme/colors';
import {EDUCATION, GENDERS, INCOMES, MARITAL, MOTHER_TONGUES, PROFESSIONS, RELIGIONS} from '../../components/register/options';

const TABS = [
  {id: 'about', label: 'About'},
  {id: 'details', label: 'Details'},
  {id: 'family', label: 'Family'},
  {id: 'partner', label: 'Partner Prefs'},
  {id: 'photos', label: 'Photos'},
  {id: 'horoscope', label: 'Horoscope'},
] as const;

type TabId = (typeof TABS)[number]['id'];

const LIFESTYLE = {
  diet: ['Strict Vegetarian', 'Vegetarian', 'Eggetarian', 'Non-Vegetarian'],
  smoking: ['Non-Smoker', 'Occasionally', 'Smoker'],
  drinking: ['Non-Drinker', 'Occasionally', 'Socially', 'Regular'],
  living_with: ['With Family', 'Alone', 'With Roommates'],
  willing_to_relocate: ['Yes, TN preferred', 'Yes, anywhere', 'No'],
  family_type: ['Nuclear Family', 'Joint Family', 'Extended Family'],
  family_status: ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'],
  family_values: ['Traditional', 'Moderate', 'Liberal'],
  dosham: ['No Dosham', 'Chevvai Dosham', 'Rahu-Ketu Dosham', 'Naga Dosham'],
};

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const RASIS = [
  'Mesham (Aries)', 'Rishabam (Taurus)', 'Mithunam (Gemini)', 'Katagam (Cancer)',
  'Simmam (Leo)', 'Kanni (Virgo)', 'Thulaam (Libra)', 'Vrichigam (Scorpio)',
  'Dhanusu (Sagittarius)', 'Makaram (Capricorn)', 'Kumbam (Aquarius)', 'Meenam (Pisces)',
];

interface CustomerProfileViewProps {
  profile: any;
  token: string | null;
  loading?: boolean;
  error?: string | null;
  onSaved: () => Promise<void> | void;
  onLogout: () => void;
}

export function CustomerProfileView({profile, token, loading, error, onSaved, onLogout}: CustomerProfileViewProps) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const wide = width >= 900;
  const paired = width >= 700;
  const [openId, setOpenId] = useState<TabId | null>('about');
  const [editingId, setEditingId] = useState<TabId | null>(null);
  const [backup, setBackup] = useState<ProfileDraft | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDob, setShowDob] = useState(false);
  const [sheet, setSheet] = useState<{title: string; options: string[]; onSelect: (value: string) => void; selected?: string} | null>(null);
  const [photoFor, setPhotoFor] = useState<'profile' | 'family' | null>(null);
  const [familyRatio, setFamilyRatio] = useState(4 / 3);

  useEffect(() => {
    if (profile) {
      setDraft(draftFromProfile(profile));
    }
  }, [profile]);

  useEffect(() => {
    const url = draft?.familyPhoto;
    if (!url) {
      return;
    }
    Image.getSize(
      url,
      (width, height) => {
        if (width > 0 && height > 0) {
          setFamilyRatio(width / height);
        }
      },
      () => setFamilyRatio(4 / 3),
    );
  }, [draft?.familyPhoto]);

  const score = draft ? completeness(draft) : 0;
  const name = `${draft?.first_name || ''} ${draft?.last_name || ''}`.trim() || 'Profile';
  const age = draft?.dob ? ageFromDob(draft.dob) : null;
  const location = [draft?.taluk_town, draft?.district, draft?.state || 'Tamil Nadu'].filter(Boolean).join(', ');
  const avatar = draft?.photos[0] || '';
  const maxDob = useMemo(() => yearsAgo(18), []);
  const minDob = useMemo(() => yearsAgo(80), []);

  const setField = (key: keyof ProfileDraft, value: string) => {
    setDraft(current => (current ? {...current, [key]: value} : current));
  };

  const save = async () => {
    if (!draft || !token || !profile) {
      return;
    }
    const problem = draftError(draft);
    if (problem) {
      Alert.alert('Check the profile', problem);
      return;
    }
    setSaving(true);
    const result = await updateCustomerProfile(token, profilePayload(profile, draft));
    setSaving(false);
    if (!result.ok) {
      Alert.alert('Could not save', result.error || 'Profile update failed.');
      return;
    }
    setEditingId(null);
    setBackup(null);
    await onSaved();
    Alert.alert('Saved', 'This section was saved.');
  };

  const beginEdit = (id: TabId) => {
    const base = editingId && editingId !== id && backup ? backup : draft;
    if (base) {
      setDraft(base);
      setBackup(base);
    }
    setEditingId(id);
    setOpenId(id);
  };

  const cancelEdit = () => {
    if (backup) {
      setDraft(backup);
    }
    setBackup(null);
    setEditingId(null);
  };

  const toggleSection = (id: TabId) => {
    if (openId === id) {
      if (editingId === id) {
        cancelEdit();
      }
      setOpenId(null);
      return;
    }
    if (editingId && editingId !== id) {
      cancelEdit();
    }
    setOpenId(id);
  };

  const addPhoto = async (source: 'library' | 'camera') => {
    const kind = photoFor;
    setPhotoFor(null);
    if (!kind || !draft) {
      return;
    }
    const file = await pickMedia(source);
    if (!file) {
      return;
    }
    const uploaded = await uploadMediaFile(file, kind === 'family' ? 'family_photo' : 'profile');
    if (!uploaded.ok) {
      Alert.alert('Upload failed', uploaded.error);
      return;
    }
    if (kind === 'family') {
      setField('familyPhoto', uploaded.url);
      return;
    }
    setDraft(current => (current && current.photos.length < 3 ? {...current, photos: [...current.photos, uploaded.url]} : current));
  };

  if (loading || !draft) {
    return (
      <View style={styles.center}>
        {loading || !error ? <ActivityIndicator color={colors.plum} /> : null}
        <Text style={styles.loadingText}>{loading ? 'Loading profile…' : error || 'Loading profile…'}</Text>
        {!loading && error ? (
          <Pressable onPress={onLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const sidebar = (
    <View style={wide ? styles.side : undefined}>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{uri: avatar}} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{(draft.first_name || 'P').slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          {profile?.public_verify ? (
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedMark}>✓</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.badges}>
          {profile?.subscription_type ? <Text style={styles.planBadge}>{String(profile.subscription_type)} plan</Text> : null}
          <Text style={profile?.public_verify ? styles.verifiedBadge : styles.pendingBadge}>
            {profile?.public_verify ? '✓ Publicly verified' : '⏳ Verification pending'}
          </Text>
        </View>
        <Text style={styles.tagline}>{draft.about_self || 'Looking for a partner equally at home with traditional values and modern growth.'}</Text>
        <Text style={styles.location}>📍 {location || 'Tamil Nadu'}</Text>
        <Text style={styles.customerId}>{profile?.customer_id || 'Member'}</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scorePct}>%</Text>
          </View>
          <View style={styles.scoreCopy}>
            <Text style={styles.scoreTitle}>Profile strength</Text>
            <Text style={styles.scoreBody}>Photos, family and horoscope raise your profile.</Text>
          </View>
        </View>
        <Text style={styles.factsTitle}>Quick snapshot</Text>
        <Fact icon="🎂" label="Age / DOB" value={age ? `${age} years` : draft.dob || 'N/A'} />
        <Fact icon="💼" label="Profession" value={draft.profession || 'N/A'} />
        <Fact icon="🎓" label="Education" value={draft.education || 'N/A'} />
        <Fact icon="💰" label="Income" value={draft.annual_income || 'N/A'} />
        <Fact icon="📍" label="District" value={draft.district || 'N/A'} />
        <Fact icon="🌐" label="Languages" value={draft.mother_tongue || 'Tamil'} />
      </View>
      <View style={styles.complete}>
        <View style={styles.completeHead}>
          <Text style={styles.completeLabel}>Profile completeness</Text>
          <Text style={styles.completePct}>{score}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${score}%`}]} />
        </View>
        <Tip done={Boolean(draft.jathagam || draft.star)} label={draft.star ? 'Horoscope details added' : 'Add horoscope details'} />
        <Tip done={draft.photos.length > 0} label={draft.photos.length ? 'Photos uploaded' : 'Upload photos to attract matches'} />
        <Tip done={Boolean(draft.about_self)} label={draft.about_self ? 'About you is written' : 'Write a short introduction'} />
      </View>
    </View>
  );

  const sectionEditing = (id: TabId) => editingId === id;
  const panels = (
    <View style={wide ? styles.main : undefined}>
      <Accordion
        icon="✍"
        title="About"
        open={openId === 'about'}
        editing={sectionEditing('about')}
        saving={saving && sectionEditing('about')}
        onToggle={() => toggleSection('about')}
        onEdit={() => beginEdit('about')}
        onSave={save}
        onCancel={cancelEdit}>
        {sectionEditing('about') ? (
          <TextInput value={draft.about_self} onChangeText={value => setField('about_self', value)} multiline placeholder="Write about your values, personality, and hobbies" placeholderTextColor={colors.ink40} style={[styles.editInput, styles.area]} />
        ) : (
          <Text style={styles.body}>{draft.about_self || 'Welcome to my profile. I am looking for a partner with shared values and mutual respect.'}</Text>
        )}
      </Accordion>
      <Accordion
        icon="👤"
        title="Details"
        open={openId === 'details'}
        editing={sectionEditing('details')}
        saving={saving && sectionEditing('details')}
        onToggle={() => toggleSection('details')}
        onEdit={() => beginEdit('details')}
        onSave={save}
        onCancel={cancelEdit}>
          <Text style={styles.groupTitle}>Personal details</Text>
            <Grid paired={paired}>
              <Detail label="Full name" value={name} editing={sectionEditing('details')} editor={<View style={styles.nameRow}><TextInput value={draft.first_name} onChangeText={value => setField('first_name', value)} style={[styles.editInput, styles.nameInput]} placeholder="First" placeholderTextColor={colors.ink40} /><TextInput value={draft.last_name} onChangeText={value => setField('last_name', value)} style={[styles.editInput, styles.nameInput]} placeholder="Last" placeholderTextColor={colors.ink40} /></View>} />
              <Detail label="Date of birth" value={draft.dob || 'N/A'} editing={sectionEditing('details')} editor={<Pressable onPress={() => setShowDob(true)} style={styles.editInput}><Text>{draft.dob || 'Select date'}</Text></Pressable>} />
              <Detail label="Age" value={age ? `${age} years` : 'N/A'} />
              <Detail label="Gender" value={draft.gender || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.gender} placeholder="Select gender" onPress={() => setSheet({title: 'Gender', options: GENDERS, selected: draft.gender, onSelect: value => setField('gender', value)})} />} />
              <Detail label="Height" value={draft.height || 'N/A'} editing={sectionEditing('details')} editor={<TextInput value={draft.height} onChangeText={value => setField('height', value)} style={styles.editInput} placeholder="Height" placeholderTextColor={colors.ink40} />} />
              <Detail label="Marital status" value={draft.maritial_status || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.maritial_status} placeholder="Select status" onPress={() => setSheet({title: 'Marital status', options: MARITAL, selected: draft.maritial_status, onSelect: value => setField('maritial_status', value)})} />} />
              <Detail label="Email" value={profile?.email || 'N/A'} />
              <Detail label="Phone" value={`${profile?.phone_code || '+91'} ${profile?.phone_number || 'N/A'}`} />
              <Detail label="Taluk / town" value={draft.taluk_town || 'N/A'} editing={sectionEditing('details')} editor={<TextInput value={draft.taluk_town} onChangeText={value => setField('taluk_town', value)} style={styles.editInput} placeholder="Taluk or town" placeholderTextColor={colors.ink40} />} />
              <Detail label="Religion" value={draft.religion || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.religion} placeholder="Select religion" onPress={() => setSheet({title: 'Religion', options: RELIGIONS, selected: draft.religion, onSelect: value => setField('religion', value)})} />} />
              <Detail label="Community" value={draft.caste || 'N/A'} editing={sectionEditing('details')} editor={<TextInput value={draft.caste} onChangeText={value => setField('caste', value)} style={styles.editInput} placeholder="Community" placeholderTextColor={colors.ink40} />} />
            </Grid>
          <Text style={styles.groupTitle}>Education and career</Text>
            <Grid paired={paired}>
              <Detail label="Education" value={draft.education || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.education} placeholder="Select education" onPress={() => setSheet({title: 'Education', options: EDUCATION, selected: draft.education, onSelect: value => setField('education', value)})} />} />
              <Detail label="Profession" value={draft.profession || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.profession} placeholder="Select profession" onPress={() => setSheet({title: 'Profession', options: PROFESSIONS, selected: draft.profession, onSelect: value => setField('profession', value)})} />} />
              <Detail label="Annual income" value={draft.annual_income || 'N/A'} editing={sectionEditing('details')} editor={<Chooser value={draft.annual_income} placeholder="Select income" onPress={() => setSheet({title: 'Income', options: INCOMES, selected: draft.annual_income, onSelect: value => setField('annual_income', value)})} />} />
            </Grid>
          <Text style={styles.groupTitle}>Lifestyle</Text>
            <Grid paired={paired}>
              <Detail label="Diet" value={draft.diet} editing={sectionEditing('details')} editor={<Chooser value={draft.diet} placeholder="Diet" onPress={() => setSheet({title: 'Diet', options: LIFESTYLE.diet, selected: draft.diet, onSelect: value => setField('diet', value)})} />} />
              <Detail label="Smoking" value={draft.smoking} editing={sectionEditing('details')} editor={<Chooser value={draft.smoking} placeholder="Smoking" onPress={() => setSheet({title: 'Smoking', options: LIFESTYLE.smoking, selected: draft.smoking, onSelect: value => setField('smoking', value)})} />} />
              <Detail label="Drinking" value={draft.drinking} editing={sectionEditing('details')} editor={<Chooser value={draft.drinking} placeholder="Drinking" onPress={() => setSheet({title: 'Drinking', options: LIFESTYLE.drinking, selected: draft.drinking, onSelect: value => setField('drinking', value)})} />} />
              <Detail label="Living with" value={draft.living_with} editing={sectionEditing('details')} editor={<Chooser value={draft.living_with} placeholder="Living with" onPress={() => setSheet({title: 'Living with', options: LIFESTYLE.living_with, selected: draft.living_with, onSelect: value => setField('living_with', value)})} />} />
              <Detail label="Relocate" value={draft.willing_to_relocate} editing={sectionEditing('details')} editor={<Chooser value={draft.willing_to_relocate} placeholder="Relocate" onPress={() => setSheet({title: 'Relocate', options: LIFESTYLE.willing_to_relocate, selected: draft.willing_to_relocate, onSelect: value => setField('willing_to_relocate', value)})} />} />
              <Detail label="Interests" value={draft.interests || 'N/A'} editing={sectionEditing('details')} editor={<TextInput value={draft.interests} onChangeText={value => setField('interests', value)} style={styles.editInput} placeholder="Interests" placeholderTextColor={colors.ink40} />} />
            </Grid>
      </Accordion>
      <Accordion
        icon="🏠"
        title="Family"
        open={openId === 'family'}
        editing={sectionEditing('family')}
        saving={saving && sectionEditing('family')}
        onToggle={() => toggleSection('family')}
        onEdit={() => beginEdit('family')}
        onSave={save}
        onCancel={cancelEdit}>
          <Grid paired={paired}>
            <Detail label="Father" value={draft.father_name || 'N/A'} editing={sectionEditing('family')} editor={<TextInput value={draft.father_name} onChangeText={value => setField('father_name', value)} style={styles.editInput} placeholder="Father's name" placeholderTextColor={colors.ink40} />} />
            <Detail label="Father's work" value={draft.father_occupation || 'N/A'} editing={sectionEditing('family')} editor={<TextInput value={draft.father_occupation} onChangeText={value => setField('father_occupation', value)} style={styles.editInput} placeholder="Occupation" placeholderTextColor={colors.ink40} />} />
            <Detail label="Mother" value={draft.mother_name || 'N/A'} editing={sectionEditing('family')} editor={<TextInput value={draft.mother_name} onChangeText={value => setField('mother_name', value)} style={styles.editInput} placeholder="Mother's name" placeholderTextColor={colors.ink40} />} />
            <Detail label="Mother's work" value={draft.mother_occupation || 'N/A'} editing={sectionEditing('family')} editor={<TextInput value={draft.mother_occupation} onChangeText={value => setField('mother_occupation', value)} style={styles.editInput} placeholder="Occupation" placeholderTextColor={colors.ink40} />} />
            <Detail label="Family type" value={draft.family_type || 'N/A'} editing={sectionEditing('family')} editor={<Chooser value={draft.family_type} placeholder="Family type" onPress={() => setSheet({title: 'Family type', options: LIFESTYLE.family_type, selected: draft.family_type, onSelect: value => setField('family_type', value)})} />} />
            <Detail label="Family status" value={draft.family_status || 'N/A'} editing={sectionEditing('family')} editor={<Chooser value={draft.family_status} placeholder="Family status" onPress={() => setSheet({title: 'Family status', options: LIFESTYLE.family_status, selected: draft.family_status, onSelect: value => setField('family_status', value)})} />} />
            <Detail label="Family values" value={draft.family_values || 'N/A'} editing={sectionEditing('family')} editor={<Chooser value={draft.family_values} placeholder="Family values" onPress={() => setSheet({title: 'Family values', options: LIFESTYLE.family_values, selected: draft.family_values, onSelect: value => setField('family_values', value)})} />} />
          </Grid>
          <Text style={styles.subHead}>About the family</Text>
          {sectionEditing('family') ? (
            <TextInput value={draft.about_family} onChangeText={value => setField('about_family', value)} multiline style={[styles.editInput, styles.area]} placeholder="About your family" placeholderTextColor={colors.ink40} />
          ) : (
            <Text style={styles.body}>{draft.about_family || 'Family details have not been added yet.'}</Text>
          )}
      </Accordion>
      <Accordion
        icon="💖"
        title="Partner Prefs"
        open={openId === 'partner'}
        editing={sectionEditing('partner')}
        saving={saving && sectionEditing('partner')}
        onToggle={() => toggleSection('partner')}
        onEdit={() => beginEdit('partner')}
        onSave={save}
        onCancel={cancelEdit}>
          <Grid paired={paired}>
            <Detail label="Age range" value={draft.pref_age_range || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_age_range} onChangeText={value => setField('pref_age_range', value)} style={styles.editInput} />} />
            <Detail label="Height" value={draft.pref_height || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_height} onChangeText={value => setField('pref_height', value)} style={styles.editInput} />} />
            <Detail label="Education" value={draft.pref_education || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_education} onChangeText={value => setField('pref_education', value)} style={styles.editInput} />} />
            <Detail label="Occupation" value={draft.pref_occupation || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_occupation} onChangeText={value => setField('pref_occupation', value)} style={styles.editInput} />} />
            <Detail label="Location" value={draft.pref_location || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_location} onChangeText={value => setField('pref_location', value)} style={styles.editInput} />} />
            <Detail label="Values" value={draft.pref_values || 'N/A'} editing={sectionEditing('partner')} editor={<TextInput value={draft.pref_values} onChangeText={value => setField('pref_values', value)} style={styles.editInput} />} />
          </Grid>
          <Text style={styles.subHead}>Overview</Text>
          {sectionEditing('partner') ? (
            <TextInput value={draft.pref_overview} onChangeText={value => setField('pref_overview', value)} multiline style={[styles.editInput, styles.area]} placeholder="Describe your ideal partner" placeholderTextColor={colors.ink40} />
          ) : (
            <Text style={styles.body}>{draft.pref_overview || 'Partner preferences have not been added yet.'}</Text>
          )}
      </Accordion>
      <Accordion
        icon="📷"
        title="Photos"
        open={openId === 'photos'}
        editing={sectionEditing('photos')}
        saving={saving && sectionEditing('photos')}
        onToggle={() => toggleSection('photos')}
        onEdit={() => beginEdit('photos')}
        onSave={save}
        onCancel={cancelEdit}>
          <View style={styles.photoRow}>
            {draft.photos.map((url, index) => (
              <View key={`${url}-${index}`} style={styles.photoTile}>
                <Image source={{uri: url}} style={styles.photo} resizeMode="cover" />
                {sectionEditing('photos') ? (
                  <Pressable style={styles.photoRemove} onPress={() => setDraft(current => (current ? {...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index)} : current))}>
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {sectionEditing('photos') && draft.photos.length < 3 ? (
              <Pressable style={styles.addPhoto} onPress={() => setPhotoFor('profile')}>
                <Text style={styles.addPhotoText}>Add photo</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.subHead}>Family photo</Text>
          {draft.familyPhoto ? (
            <View style={styles.familyFrame}>
              <Image source={{uri: draft.familyPhoto}} style={[styles.familyPhoto, {aspectRatio: familyRatio}]} resizeMode="contain" />
            </View>
          ) : (
            <Text style={styles.body}>No family photo yet.</Text>
          )}
          {sectionEditing('photos') ? (
            <Pressable onPress={() => setPhotoFor('family')} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>{draft.familyPhoto ? 'Replace family photo' : 'Add family photo'}</Text>
            </Pressable>
          ) : null}
      </Accordion>
      <Accordion
        icon="✨"
        title="Horoscope"
        open={openId === 'horoscope'}
        editing={sectionEditing('horoscope')}
        saving={saving && sectionEditing('horoscope')}
        onToggle={() => toggleSection('horoscope')}
        onEdit={() => beginEdit('horoscope')}
        onSave={save}
        onCancel={cancelEdit}>
          <Grid paired={paired}>
            <Detail label="Star (Nakshatra)" value={draft.star || 'N/A'} editing={sectionEditing('horoscope')} editor={<Chooser value={draft.star} placeholder="Select Star (Nakshatra)" onPress={() => setSheet({title: 'Star (Nakshatra)', options: NAKSHATRAS, selected: draft.star, onSelect: value => setField('star', value)})} />} />
            <Detail label="Rasi (Moon Sign)" value={draft.rasi || 'N/A'} editing={sectionEditing('horoscope')} editor={<Chooser value={draft.rasi} placeholder="Select Rasi (Moon Sign)" onPress={() => setSheet({title: 'Rasi (Moon Sign)', options: RASIS, selected: draft.rasi, onSelect: value => setField('rasi', value)})} />} />
            <Detail label="Lagnam (Ascendant)" value={draft.lagnam || 'N/A'} editing={sectionEditing('horoscope')} editor={<Chooser value={draft.lagnam} placeholder="Select Lagnam (Ascendant)" onPress={() => setSheet({title: 'Lagnam (Ascendant)', options: RASIS, selected: draft.lagnam, onSelect: value => setField('lagnam', value)})} />} />
            <Detail label="Gothram" value={draft.gothram || 'N/A'} editing={sectionEditing('horoscope')} editor={<TextInput value={draft.gothram} onChangeText={value => setField('gothram', value)} style={styles.editInput} placeholder="Gothram" placeholderTextColor={colors.ink40} />} />
            <Detail label="Date of birth" value={displayDob(draft.dob)} editing={sectionEditing('horoscope')} editor={<Pressable onPress={() => setShowDob(true)} style={[styles.editInput, styles.chooser]}><Text style={draft.dob ? styles.editValue : styles.placeholder}>{draft.dob ? displayDob(draft.dob) : 'Select date'}</Text><Text style={styles.chooserChevron}>📅</Text></Pressable>} />
            <Detail label="Time of birth" value={draft.tob || 'N/A'} editing={sectionEditing('horoscope')} editor={<TextInput value={draft.tob} onChangeText={value => setField('tob', value)} style={styles.editInput} placeholder="e.g. 06:34 AM" placeholderTextColor={colors.ink40} />} />
            <Detail label="Place of birth" value={draft.pob || 'N/A'} editing={sectionEditing('horoscope')} editor={<TextInput value={draft.pob} onChangeText={value => setField('pob', value)} style={styles.editInput} placeholder="Place of birth" placeholderTextColor={colors.ink40} />} />
            <Detail label="Dosham" value={draft.dosham || 'No Dosham'} editing={sectionEditing('horoscope')} editor={<Chooser value={draft.dosham} placeholder="Select Dosham" onPress={() => setSheet({title: 'Dosham', options: LIFESTYLE.dosham, selected: draft.dosham, onSelect: value => setField('dosham', value)})} />} />
          </Grid>
          <View style={styles.badgeRow}>
            <HoroBadge color={colors.sage} label={`Manglik: ${profile?.horoscopeDetails?.manglik || profile?.manglik || 'No'}`} />
            <HoroBadge color={colors.plum} label={`Chevvai Dosham: ${profile?.horoscopeDetails?.chevvai_dosham || profile?.chevvai_dosham || 'No'}`} />
            <HoroBadge color={colors.rose} label={`Rahu-Ketu: ${profile?.horoscopeDetails?.rahu_ketu_dosham || profile?.rahu_ketu_dosham || 'Neutral'}`} />
          </View>
      </Accordion>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.hero, {paddingTop: insets.top + 12}]}>
          <Text style={styles.heroTitle}>My profile</Text>
          <Pressable onPress={onLogout} style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>Log out</Text>
          </Pressable>
        </View>
        <View style={[styles.layout, wide && styles.layoutWide]}>
          {sidebar}
          {panels}
        </View>
      </ScrollView>
      {showDob && Platform.OS === 'android' ? (
        <DateTimePicker
          value={parseDob(draft.dob, maxDob)}
          mode="date"
          display="calendar"
          maximumDate={maxDob}
          minimumDate={minDob}
          onValueChange={(_event, date) => {
            setField('dob', formatDob(date));
            setShowDob(false);
          }}
          onDismiss={() => setShowDob(false)}
        />
      ) : null}
      <Modal visible={showDob && Platform.OS === 'ios'} transparent animationType="fade" onRequestClose={() => setShowDob(false)}>
        <Pressable style={styles.scrim} onPress={() => setShowDob(false)}>
          <Pressable style={styles.sheetCard} onPress={() => undefined}>
            <DateTimePicker value={parseDob(draft.dob, maxDob)} mode="date" display="inline" maximumDate={maxDob} minimumDate={minDob} onValueChange={(_event, date) => setField('dob', formatDob(date))} />
            <Pressable onPress={() => setShowDob(false)} style={styles.primaryBtn}><Text style={styles.primaryText}>Done</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={sheet != null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.scrim} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheetCard} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>{sheet?.title}</Text>
            <ScrollView style={styles.sheetList}>
              {sheet?.options.map(option => (
                <Pressable key={option} style={styles.sheetRow} onPress={() => { sheet.onSelect(option); setSheet(null); }}>
                  <Text style={[styles.sheetLabel, option === sheet.selected && styles.sheetLabelOn]}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={photoFor != null} transparent animationType="slide" onRequestClose={() => setPhotoFor(null)}>
        <Pressable style={styles.scrim} onPress={() => setPhotoFor(null)}>
          <Pressable style={styles.sheetCard} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>{photoFor === 'family' ? 'Family photo' : 'Profile photo'}</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => addPhoto('library')}><Text style={styles.secondaryText}>Gallery</Text></Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => addPhoto('camera')}><Text style={styles.secondaryText}>Camera</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Fact({icon, label, value, editing, editor}: {icon: string; label: string; value: string; editing?: boolean; editor?: React.ReactNode}) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factIcon}>{icon}</Text>
      <Text style={styles.factLabel}>{label}</Text>
      <View style={styles.factValue}>{editing && editor ? editor : <Text style={styles.factText}>{value}</Text>}</View>
    </View>
  );
}

function Accordion({
  icon,
  title,
  open,
  editing,
  saving,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  icon: string;
  title: string;
  open: boolean;
  editing: boolean;
  saving: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.accordion}>
      <View style={styles.accordionHead}>
        <Pressable onPress={onToggle} style={styles.accordionTitle}>
          <Text style={styles.panelIcon}>{icon}</Text>
          <Text style={styles.panelTitle}>{title}</Text>
          <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
        </Pressable>
        {editing ? (
          <View style={styles.accordionActions}>
            <Pressable onPress={onSave} disabled={saving} style={styles.saveChip}>
              <Text style={styles.saveChipText}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.cancelChip}>
              <Text style={styles.cancelChipText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onEdit} style={styles.editChip}>
            <Text style={styles.editChipText}>Edit</Text>
          </Pressable>
        )}
      </View>
      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

function Grid({paired, children}: {paired: boolean; children: React.ReactNode}) {
  return (
    <View style={paired ? styles.grid : undefined}>
      {React.Children.map(children, child => (React.isValidElement(child) ? React.cloneElement(child, {wide: paired} as Partial<unknown>) : child))}
    </View>
  );
}

function Detail({label, value, editing, editor, wide}: {label: string; value: string; editing?: boolean; editor?: React.ReactNode; wide?: boolean}) {
  return (
    <View style={[styles.detail, wide && styles.detailHalf]}>
      <Text style={styles.detailLabel}>{label}</Text>
      {editing && editor ? editor : <Text style={styles.detailValue}>{value}</Text>}
    </View>
  );
}

function Chooser({value, placeholder, onPress}: {value: string; placeholder: string; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.editInput, styles.chooser]}>
      <Text style={[value ? styles.editValue : styles.placeholder, styles.chooserText]} numberOfLines={1}>{value || placeholder}</Text>
      <Text style={styles.chooserChevron}>▾</Text>
    </Pressable>
  );
}

function HoroBadge({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.horoBadge}>
      <View style={[styles.horoDot, {backgroundColor: color}]} />
      <Text style={styles.horoBadgeText}>{label}</Text>
    </View>
  );
}

function Tip({done, label}: {done: boolean; label: string}) {
  return <Text style={[styles.tip, done && styles.tipDone]}>{done ? '✓ ' : '→ '}{label}</Text>;
}

function yearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

function parseDob(value: string, fallback: Date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return fallback;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function formatDob(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDob(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || 'N/A';
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.surface},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  loadingText: {marginTop: 10, color: colors.ink60},
  page: {paddingBottom: 40},
  hero: {minHeight: 150, backgroundColor: colors.plum, paddingHorizontal: 16, paddingBottom: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroActions: {flexDirection: 'row'},
  heroBtn: {backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8},
  heroSave: {backgroundColor: colors.sage, borderColor: colors.sage},
  heroBtnText: {color: colors.white, fontWeight: '800', fontSize: 12},
  layout: {marginTop: -48, paddingHorizontal: 16},
  layoutWide: {flexDirection: 'row', alignItems: 'flex-start', maxWidth: 1100, alignSelf: 'center', width: '100%'},
  side: {width: 340, marginRight: 20},
  main: {flex: 1},
  card: {backgroundColor: colors.white, borderRadius: radii.lg, padding: 18, borderWidth: 1, borderColor: colors.borderSoft},
  avatarWrap: {alignSelf: 'center'},
  avatar: {width: 108, height: 108, borderRadius: 54, backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.white},
  avatarLetter: {color: colors.white, fontSize: 36, fontWeight: '800'},
  verifiedDot: {position: 'absolute', right: 4, bottom: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.sage, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center'},
  verifiedMark: {color: colors.white, fontWeight: '800', fontSize: 12},
  name: {textAlign: 'center', fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 12},
  nameEdit: {marginTop: 12},
  nameRow: {flexDirection: 'row', gap: 8},
  nameInput: {flex: 1, textAlign: 'center'},
  editHint: {textAlign: 'center', color: colors.plum, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6},
  badges: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8},
  planBadge: {backgroundColor: colors.plumLight, color: colors.plumDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, margin: 3},
  verifiedBadge: {backgroundColor: colors.sageLight, color: colors.sage, fontSize: 11, fontWeight: '800', borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, margin: 3},
  pendingBadge: {backgroundColor: colors.amberLight, color: colors.amber, fontSize: 11, fontWeight: '700', borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, margin: 3},
  tagline: {textAlign: 'center', color: colors.ink60, marginTop: 10, lineHeight: 20},
  headline: {minHeight: 64, textAlign: 'center', marginTop: 8},
  location: {textAlign: 'center', color: colors.ink40, marginTop: 8},
  customerId: {alignSelf: 'center', marginTop: 6, color: colors.ink40, backgroundColor: colors.surface, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 3, fontSize: 12},
  scoreRow: {flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderSoft},
  scoreRing: {width: 64, height: 64, borderRadius: 32, backgroundColor: colors.roseLight, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  scoreNum: {color: colors.roseDark, fontWeight: '800', fontSize: 18},
  scorePct: {color: colors.ink40, fontSize: 10},
  scoreCopy: {flex: 1},
  scoreTitle: {fontWeight: '800', color: colors.ink},
  scoreBody: {color: colors.ink60, fontSize: 12, marginTop: 2},
  primaryBtn: {backgroundColor: colors.rose, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 14},
  saveBtn: {backgroundColor: colors.sage},
  primaryText: {color: colors.white, fontWeight: '800'},
  secondaryBtn: {borderWidth: 1.5, borderColor: colors.plum, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8},
  secondaryText: {color: colors.plum, fontWeight: '700'},
  factsTitle: {marginTop: 18, color: colors.plum, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase'},
  fact: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSoft},
  factIcon: {width: 24},
  factLabel: {width: 88, color: colors.ink40, fontSize: 12},
  factValue: {flex: 1},
  factText: {color: colors.ink, fontWeight: '600'},
  complete: {backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginTop: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.borderSoft},
  completeHead: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  completeLabel: {fontWeight: '700', color: colors.ink},
  completePct: {color: colors.plum, fontWeight: '800'},
  track: {height: 6, borderRadius: 6, backgroundColor: colors.plumLight, overflow: 'hidden'},
  fill: {height: 6, backgroundColor: colors.plum},
  tip: {color: colors.ink60, marginTop: 8, fontSize: 13},
  tipDone: {color: colors.ink40},
  logout: {marginTop: 14, alignItems: 'center', paddingVertical: 12},
  logoutText: {color: colors.roseDark, fontWeight: '800'},
  editBanner: {backgroundColor: colors.amberLight, borderRadius: radii.md, padding: 12, marginBottom: 12},
  editBannerTitle: {color: '#92400E', fontWeight: '800', fontSize: 12, textTransform: 'uppercase'},
  editBannerBody: {color: '#92400E', marginTop: 2},
  tabs: {backgroundColor: colors.white, borderRadius: radii.md, padding: 6, marginBottom: 12},
  tab: {paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 4},
  tabOn: {backgroundColor: colors.plum},
  tabText: {color: colors.ink60, fontWeight: '700'},
  tabTextOn: {color: colors.white},
  accordion: {backgroundColor: colors.white, borderRadius: radii.md, marginBottom: 12, borderWidth: 1, borderColor: colors.borderSoft, overflow: 'hidden'},
  accordionHead: {flexDirection: 'row', alignItems: 'center', paddingRight: 12},
  accordionTitle: {flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14},
  accordionActions: {flexDirection: 'row', alignItems: 'center'},
  accordionBody: {paddingHorizontal: 16, paddingBottom: 16},
  chevron: {color: colors.ink40, fontSize: 16, marginLeft: 6},
  editChip: {backgroundColor: colors.plumLight, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6},
  editChipText: {color: colors.plum, fontWeight: '800', fontSize: 12},
  saveChip: {backgroundColor: colors.sage, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6},
  saveChipText: {color: colors.white, fontWeight: '800', fontSize: 12},
  cancelChip: {backgroundColor: '#F1F5F9', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6},
  cancelChipText: {color: colors.ink60, fontWeight: '800', fontSize: 12},
  groupTitle: {marginTop: 8, marginBottom: 4, color: colors.plum, fontWeight: '800'},
  panel: {backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderSoft},
  panelHead: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  panelIcon: {width: 32, height: 32, borderRadius: 10, backgroundColor: colors.plumLight, textAlign: 'center', lineHeight: 32, marginRight: 8, overflow: 'hidden'},
  panelTitle: {flex: 1, fontWeight: '800', color: colors.ink, fontSize: 16},
  panelEdit: {color: colors.plum, fontWeight: '800'},
  body: {color: colors.ink60, lineHeight: 22},
  subHead: {marginTop: 14, marginBottom: 8, fontWeight: '800', color: colors.ink},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  detail: {width: '100%', paddingVertical: 10, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: colors.borderSoft},
  detailHalf: {width: '50%'},
  detailLabel: {color: colors.ink40, fontSize: 12, marginBottom: 4},
  detailValue: {color: colors.ink, fontWeight: '700'},
  editInput: {backgroundColor: '#F9F9FB', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, color: colors.ink},
  chooser: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  chooserText: {flex: 1, marginRight: 8},
  chooserChevron: {color: colors.ink40, fontSize: 14},
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 12},
  horoBadge: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8},
  horoDot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  horoBadgeText: {color: colors.ink, fontWeight: '700', fontSize: 12},
  editValue: {color: colors.ink, fontWeight: '700'},
  placeholder: {color: colors.ink40},
  area: {minHeight: 110, textAlignVertical: 'top'},
  photoRow: {flexDirection: 'row', flexWrap: 'wrap'},
  photoTile: {width: 104, height: 136, borderRadius: 14, overflow: 'hidden', marginRight: 8, marginBottom: 8},
  photo: {width: '100%', height: '100%'},
  photoRemove: {position: 'absolute', top: 6, right: 6, backgroundColor: colors.danger, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2},
  photoRemoveText: {color: colors.white, fontWeight: '800'},
  addPhoto: {width: 104, height: 136, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center'},
  addPhotoText: {color: colors.plum, fontWeight: '800'},
  familyFrame: {width: '100%', borderRadius: 14, overflow: 'hidden', backgroundColor: '#F4F2FA'},
  familyPhoto: {width: '100%', borderRadius: 14},
  scrim: {flex: 1, backgroundColor: 'rgba(15,10,30,0.55)', justifyContent: 'flex-end'},
  sheetCard: {backgroundColor: colors.white, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: 16, maxHeight: '70%'},
  sheetTitle: {fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8},
  sheetList: {maxHeight: 420},
  sheetRow: {paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSoft},
  sheetLabel: {color: colors.ink, fontSize: 16},
  sheetLabelOn: {color: colors.plum, fontWeight: '800'},
});
