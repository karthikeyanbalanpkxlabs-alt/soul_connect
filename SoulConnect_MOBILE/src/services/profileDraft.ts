export interface ProfileDraft {
  first_name: string;
  last_name: string;
  about_self: string;
  dob: string;
  gender: string;
  height: string;
  maritial_status: string;
  mother_tongue: string;
  district: string;
  taluk_town: string;
  state: string;
  zipcode: string;
  education: string;
  profession: string;
  annual_income: string;
  religion: string;
  caste: string;
  diet: string;
  smoking: string;
  drinking: string;
  living_with: string;
  willing_to_relocate: string;
  interests: string;
  father_name: string;
  father_occupation: string;
  mother_name: string;
  mother_occupation: string;
  family_type: string;
  family_status: string;
  family_values: string;
  about_family: string;
  pref_age_range: string;
  pref_height: string;
  pref_education: string;
  pref_occupation: string;
  pref_location: string;
  pref_values: string;
  pref_overview: string;
  star: string;
  rasi: string;
  lagnam: string;
  gothram: string;
  dosham: string;
  tob: string;
  pob: string;
  photos: string[];
  familyPhoto: string;
  jathagam: string;
}

function read(source: any, path: string, fallback = '') {
  const value = path.split('.').reduce((current, key) => current?.[key], source);
  if (value == null || value === '') {
    return fallback;
  }
  return String(value);
}

function photoList(profile: any): string[] {
  const image = profile?.image;
  if (Array.isArray(image)) {
    return image
      .map((item: any) => (typeof item === 'string' ? item : item?.url))
      .filter(Boolean);
  }
  if (Array.isArray(profile?.photos)) {
    return profile.photos.filter((item: unknown) => typeof item === 'string');
  }
  return [];
}

function familyPhoto(profile: any): string {
  const photos = profile?.family_photos;
  if (!Array.isArray(photos) || !photos.length) {
    return '';
  }
  const first = photos[0];
  return typeof first === 'string' ? first : first?.url || '';
}

export function draftFromProfile(profile: any): ProfileDraft {
  const family = profile?.familyBackground || {};
  const life = profile?.lifeStyle || {};
  const pref = profile?.partnerPreferencesDetails || {};
  const horo = profile?.horoscopeDetails || {};
  return {
    first_name: read(profile, 'first_name') || read(profile, 'firstName'),
    last_name: read(profile, 'last_name') || read(profile, 'lastName'),
    about_self: read(profile, 'about_self'),
    dob: read(profile, 'dob') || read(horo, 'dob'),
    gender: read(profile, 'gender'),
    height: read(profile, 'height'),
    maritial_status: read(profile, 'maritial_status') || read(profile, 'marital_status'),
    mother_tongue: read(profile, 'mother_tongue', 'Tamil'),
    district: read(profile, 'district'),
    taluk_town: read(profile, 'taluk_town'),
    state: read(profile, 'state', 'tamilnadu'),
    zipcode: read(profile, 'zipcode'),
    education: read(profile, 'education'),
    profession: read(profile, 'profession'),
    annual_income: read(profile, 'annual_income'),
    religion: read(profile, 'religion'),
    caste: read(profile, 'caste'),
    diet: read(life, 'diet') || read(profile, 'diet', 'Strict Vegetarian'),
    smoking: read(life, 'smoking') || read(profile, 'smoking', 'Non-Smoker'),
    drinking: read(life, 'drinking') || read(profile, 'drinking', 'Non-Drinker'),
    living_with: read(life, 'living_with') || read(profile, 'living_with', 'With Family'),
    willing_to_relocate: read(life, 'willing_to_relocate') || read(profile, 'willing_to_relocate', 'Yes, TN preferred'),
    interests: read(life, 'interests') || read(profile, 'interests'),
    father_name: read(family, 'father_name') || read(profile, 'father_name'),
    father_occupation: read(family, 'father_occupation') || read(profile, 'father_occupation'),
    mother_name: read(family, 'mother_name') || read(profile, 'mother_name'),
    mother_occupation: read(family, 'mother_occupation') || read(profile, 'mother_occupation'),
    family_type: read(family, 'family_type') || read(profile, 'family_type'),
    family_status: read(family, 'family_status') || read(profile, 'family_status'),
    family_values: read(family, 'family_values') || read(profile, 'family_values'),
    about_family: read(family, 'about_family') || read(profile, 'about_family'),
    pref_age_range: read(pref, 'age_range', '27 – 33 yrs'),
    pref_height: read(pref, 'height'),
    pref_education: read(pref, 'education'),
    pref_occupation: read(pref, 'occupation'),
    pref_location: read(pref, 'location', 'Tamil Nadu or willing to relocate'),
    pref_values: read(pref, 'values', 'Family-oriented, respectful, grounded'),
    pref_overview: read(pref, 'overview') || read(profile, 'partner_preference'),
    star: read(horo, 'star') || read(profile, 'star') || read(profile, 'nakshatra'),
    rasi: read(horo, 'rasi') || read(profile, 'rasi'),
    lagnam: read(horo, 'lagnam') || read(profile, 'lagnam') || read(profile, 'ascendant'),
    gothram: read(horo, 'gothram') || read(profile, 'gothram'),
    dosham: read(horo, 'dosham') || read(profile, 'dosham', 'No Dosham'),
    tob: read(horo, 'tob') || read(profile, 'tob'),
    pob: read(horo, 'pob') || read(profile, 'pob'),
    photos: photoList(profile),
    familyPhoto: familyPhoto(profile),
    jathagam: read(horo, 'jathagam.url') || read(profile, 'jathagam.url') || read(profile, 'jathagam'),
  };
}

export function ageFromDob(dob: string): number | null {
  if (!dob) {
    return null;
  }
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function draftError(draft: ProfileDraft): string | null {
  if (draft.dob) {
    const age = ageFromDob(draft.dob);
    if (age == null) {
      return 'Enter a valid date of birth.';
    }
    if (age < 18) {
      return 'Age must be at least 18.';
    }
  }
  const lifestyle = [draft.diet, draft.smoking, draft.drinking, draft.living_with, draft.willing_to_relocate];
  if (lifestyle.some(value => !value.trim())) {
    return 'Complete diet, smoking, drinking, living with, and relocate.';
  }
  return null;
}

export function profilePayload(profile: any, draft: ProfileDraft) {
  return {
    ...profile,
    first_name: draft.first_name,
    last_name: draft.last_name,
    about_self: draft.about_self,
    dob: draft.dob,
    gender: draft.gender,
    height: draft.height,
    maritial_status: draft.maritial_status,
    mother_tongue: draft.mother_tongue,
    district: draft.district,
    taluk_town: draft.taluk_town,
    state: draft.state,
    zipcode: draft.zipcode,
    education: draft.education,
    profession: draft.profession,
    annual_income: draft.annual_income,
    religion: draft.religion,
    caste: draft.caste,
    interests: draft.interests,
    image: draft.photos.map((url, index) => ({url, default: index === 0})),
    photos: draft.photos,
    family_photos: draft.familyPhoto ? [{url: draft.familyPhoto}] : profile?.family_photos || [],
    partner_preference: draft.pref_overview,
    horoscopeDetails: {
      ...(profile?.horoscopeDetails || {}),
      dob: draft.dob,
      star: draft.star,
      rasi: draft.rasi,
      lagnam: draft.lagnam,
      gothram: draft.gothram,
      dosham: draft.dosham,
      manglik: profile?.horoscopeDetails?.manglik || profile?.manglik || 'No',
      chevvai_dosham: profile?.horoscopeDetails?.chevvai_dosham || profile?.chevvai_dosham || 'No',
      rahu_ketu_dosham: profile?.horoscopeDetails?.rahu_ketu_dosham || profile?.rahu_ketu_dosham || 'Neutral',
      tob: draft.tob,
      pob: draft.pob,
      jathagam: draft.jathagam || profile?.horoscopeDetails?.jathagam || profile?.jathagam || null,
    },
    familyBackground: {
      ...(profile?.familyBackground || {}),
      father_name: draft.father_name,
      father_occupation: draft.father_occupation,
      mother_name: draft.mother_name,
      mother_occupation: draft.mother_occupation,
      family_type: draft.family_type,
      family_status: draft.family_status,
      family_values: draft.family_values,
      about_family: draft.about_family,
    },
    lifeStyle: {
      ...(profile?.lifeStyle || {}),
      diet: draft.diet,
      smoking: draft.smoking,
      drinking: draft.drinking,
      living_with: draft.living_with,
      willing_to_relocate: draft.willing_to_relocate,
      interests: draft.interests,
    },
    partnerPreferencesDetails: {
      ...(profile?.partnerPreferencesDetails || {}),
      age_range: draft.pref_age_range,
      height: draft.pref_height,
      education: draft.pref_education,
      occupation: draft.pref_occupation,
      location: draft.pref_location,
      values: draft.pref_values,
      overview: draft.pref_overview,
    },
    keycloakId: profile?.keycloakId,
    customer_id: profile?.customer_id,
    _id: profile?._id,
  };
}

export function completeness(draft: ProfileDraft): number {
  const checks = [
    draft.first_name,
    draft.dob,
    draft.about_self,
    draft.district,
    draft.education,
    draft.profession,
    draft.photos[0],
    draft.familyPhoto,
    draft.star,
    draft.about_family,
  ];
  const filled = checks.filter(item => String(item || '').trim()).length;
  return Math.round((filled / checks.length) * 100);
}
