"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import keycloak from "@/lib/keycloak";
import {
  ArrowLeft,
  Share2,
  Flag,
  MoreHorizontal,
  Lock,
  Unlock,
  Upload,
  Camera,
  Check,
  Mic,
  Volume2,
  Trash2,
  Play,
  Square,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
  Users,
  Plus,
  Star,
} from "lucide-react";

import { useKeycloak } from "@/providers/KeycloakProvider";
import configUrls from "../../../../configUrls";
import { districts } from "@/data/districts";

const STAR_TAMIL_MAP: Record<string, string> = {
  "Ashwini": "அசுவினி",
  "Bharani": "பரணி",
  "Krittika": "கார்த்திகை",
  "Rohini": "ரோகிணி",
  "Mrigashirsha": "மிருகசீரிஷம்",
  "Ardra": "திருவாதிரை",
  "Punarvasu": "புனர்பூசம்",
  "Pushya": "பூசம்",
  "Ashlesha": "ஆயில்யம்",
  "Magha": "மகம்",
  "Purva Phalguni": "பூரம்",
  "Uttara Phalguni": "உத்திரம்",
  "Hasta": "அஸ்தம்",
  "Chitra": "சித்திரை",
  "Swati": "சுவாதி",
  "Vishakha": "விசாகம்",
  "Anuradha": "அனுஷம்",
  "Jyeshta": "கேட்டை",
  "Moola": "மூலம்",
  "Purva Ashadha": "பூராடம்",
  "Uttara Ashadha": "உத்திராடம்",
  "Shravana": "திருவோணம்",
  "Dhanishta": "அவிட்டம்",
  "Shatabhisha": "சதயம்",
  "Purva Bhadrapada": "பூரட்டாதி",
  "Uttara Bhadrapada": "உத்திரட்டாதி",
  "Revati": "ரேவதி",
};

const RASI_TAMIL_MAP: Record<string, string> = {
  "Mesham (Aries)": "மேஷம்",
  "Mesham": "மேஷம்",
  "Aries": "மேஷம்",
  "Rishabam (Taurus)": "ரிஷபம்",
  "Rishabam": "ரிஷபம்",
  "Taurus": "ரிஷபம்",
  "Mithunam (Gemini)": "மிதுனம்",
  "Mithunam": "மிதுனம்",
  "Gemini": "மிதுனம்",
  "Katagam (Cancer)": "கடகம்",
  "Katagam": "கடகம்",
  "Cancer": "கடகம்",
  "Simmam (Leo)": "சிம்மம்",
  "Simmam": "சிம்மம்",
  "Leo": "சிம்மம்",
  "Kanni (Virgo)": "கன்னி",
  "Kanni": "கன்னி",
  "Virgo": "கன்னி",
  "Thulaam (Libra)": "துலாம்",
  "Thulaam": "துலாம்",
  "Libra": "துலாம்",
  "Vrichigam (Scorpio)": "விருச்சிகம்",
  "Vrichigam": "விருச்சிகம்",
  "Scorpio": "விருச்சிகம்",
  "Dhanusu (Sagittarius)": "தனுசு",
  "Dhanusu": "தனுசு",
  "Sagittarius": "தனுசு",
  "Makaram (Capricorn)": "மகரம்",
  "Makaram": "மகரம்",
  "Capricorn": "மகரம்",
  "Kumbam (Aquarius)": "கும்பம்",
  "Kumbam": "கும்பம்",
  "Aquarius": "கும்பம்",
  "Meenam (Pisces)": "மீனம்",
  "Meenam": "மீனம்",
  "Pisces": "மீனம்",
};

const getStarTamil = (star?: string) => {
  if (!star) return "";
  const trimmed = star.trim();
  if (STAR_TAMIL_MAP[trimmed]) return STAR_TAMIL_MAP[trimmed];
  const key = Object.keys(STAR_TAMIL_MAP).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  return key ? STAR_TAMIL_MAP[key] : "";
};

const getRasiTamil = (val?: string) => {
  if (!val) return "";
  const trimmed = val.trim();
  if (RASI_TAMIL_MAP[trimmed]) return RASI_TAMIL_MAP[trimmed];
  const key = Object.keys(RASI_TAMIL_MAP).find((k) =>
    trimmed.toLowerCase().includes(k.toLowerCase())
  );
  return key ? RASI_TAMIL_MAP[key] : "";
};

const getDoshamTamil = (dosham?: string) => {
  if (!dosham) return "";
  const lower = dosham.toLowerCase();
  if (lower.includes("no") || lower.includes("none")) return "தோஷமில்லை";
  if (lower.includes("chevvai")) return "செவ்வாய் தோஷம்";
  if (lower.includes("rahu")) return "ராகு கேது தோஷம்";
  if (lower.includes("naga")) return "நாக தோஷம்";
  return dosham;
};

const getPobTamil = (pob?: string) => {
  if (!pob) return "";
  const matched = districts.find(
    (d) => d.name.toLowerCase() === pob.trim().toLowerCase()
  );
  return matched ? matched.tamil : "";
};

const getTobTamil = (tob?: string) => {
  if (!tob) return "";
  const lower = tob.toLowerCase();
  if (lower.includes("am")) {
    const hourMatch = lower.match(/^(\d{1,2})/);
    const hour = hourMatch ? parseInt(hourMatch[1], 10) : 6;
    if (hour >= 4 && hour <= 7) return "அதிகாலை";
    return "காலை";
  }
  if (lower.includes("pm")) return "மாலை / இரவு";
  return "";
};

const getHoroVal = (profile: any, formData: any, key: string, fallback: string = "") => {
  if (formData[key] !== undefined) return formData[key];
  if (profile?.horoscopeDetails?.[key] !== undefined) return profile.horoscopeDetails[key];
  if (profile?.[key] !== undefined) return profile[key];
  return fallback;
};

const BLOOD_GROUPS = [
  "A+ve",
  "A-ve",
  "B+ve",
  "B-ve",
  "O+ve",
  "O-ve",
  "AB+ve",
  "AB-ve",
  "A1+ve",
  "A1-ve",
  "A2+ve",
  "A2-ve",
  "A1B+ve",
  "A1B-ve",
  "A2B+ve",
  "A2B-ve",
  "Bombay Blood Group",
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshta",
  "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const RASIS = [
  "Mesham (Aries)", "Rishabam (Taurus)", "Mithunam (Gemini)", "Katagam (Cancer)",
  "Simmam (Leo)", "Kanni (Virgo)", "Thulaam (Libra)", "Vrichigam (Scorpio)",
  "Dhanusu (Sagittarius)", "Makaram (Capricorn)", "Kumbam (Aquarius)", "Meenam (Pisces)"
];

const LAGNAMS = [
  "Mesham (Aries)", "Rishabam (Taurus)", "Mithunam (Gemini)", "Katagam (Cancer)",
  "Simmam (Leo)", "Kanni (Virgo)", "Thulaam (Libra)", "Vrichigam (Scorpio)",
  "Dhanusu (Sagittarius)", "Makaram (Capricorn)", "Kumbam (Aquarius)", "Meenam (Pisces)"
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loadingProfile, profileError, refreshProfile, roles } =
    useKeycloak();

  const tokenParsed: any = keycloak?.tokenParsed;
  const userRoles: string[] = roles || tokenParsed?.realm_access?.roles || [];
  const isCustomer = userRoles.includes("customer_g");
  const isManager = userRoles.includes("manager_g");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || profile.firstName || "",
        last_name: profile.last_name || profile.lastName || "",
        email: profile.email || "",
        phone_code: profile.phone_code || "+91",
        phone_number: profile.phone_number || profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        maritial_status: profile.maritial_status || profile.marital_status || "",
        height: profile.height || "",
        district: profile.district || "",
        taluk_town: profile.taluk_town || "",
        state: profile.state || "",
        zipcode: profile.zipcode || "",
        religion: profile.religion || "",
        caste: profile.caste || "",
        mother_tongue: profile.mother_tongue || "",
        education: profile.education || "",
        profession: profile.profession || profile.occupation || "",
        annual_income: profile.annual_income || "",
        about_self: profile.about_self || "",
        partner_preference: profile.partner_preference || "",
        ambition: profile.ambition || "",
        blood_group: profile.blood_group || "",
        additional_report_info: profile.additional_report_info || "",
        star: profile.star || profile.nakshatra || "",
        rasi: profile.rasi || profile.moon_sign || "",
        lagnam: profile.lagnam || profile.ascendant || "",
        gothram: profile.gothram || "",
        tob: profile.tob || profile.time_of_birth || "",
        pob: profile.pob || profile.place_of_birth || "",
        dosham: profile.dosham || "",
        diet: profile.lifeStyle?.diet || profile.diet || "",
        smoking: profile.lifeStyle?.smoking || profile.smoking || "",
        drinking: profile.lifeStyle?.drinking || profile.drinking || "",
        living_with: profile.lifeStyle?.living_with || profile.living_with || "",
        willing_to_relocate: profile.lifeStyle?.willing_to_relocate || profile.willing_to_relocate || "",
        interests: profile.lifeStyle?.interests || profile.interests || "",
        pref_age_range: profile.partnerPreferencesDetails?.age_range || "27 – 33 yrs",
        pref_age_flexible: profile.partnerPreferencesDetails?.age_flexible || "flexible",
        pref_height: profile.partnerPreferencesDetails?.height || "5'7\" and above",
        pref_marital_status: profile.partnerPreferencesDetails?.marital_status || "Never Married preferred",
        pref_diet: profile.partnerPreferencesDetails?.diet || "Vegetarian only",
        pref_smoking: profile.partnerPreferencesDetails?.smoking || "Non-Smoker",
        pref_drinking: profile.partnerPreferencesDetails?.drinking || "Non-Drinker preferred",
        pref_drinking_flexible: profile.partnerPreferencesDetails?.drinking_flexible || "flexible",
        pref_education: profile.partnerPreferencesDetails?.education || "Graduate & above",
        pref_occupation: profile.partnerPreferencesDetails?.occupation || "Any professional field",
        pref_income: profile.partnerPreferencesDetails?.income || "₹8L+ per year",
        pref_religion: profile.partnerPreferencesDetails?.religion || "Hindu preferred",
        pref_caste: profile.partnerPreferencesDetails?.caste || "Tamil Brahmin preferred",
        pref_caste_open: profile.partnerPreferencesDetails?.caste_open || "open",
        pref_location: profile.partnerPreferencesDetails?.location || "Tamil Nadu or willing to relocate",
        pref_living_setup: profile.partnerPreferencesDetails?.living_setup || "Open to joint or nuclear family",
        pref_values: profile.partnerPreferencesDetails?.values || "Family-oriented, respectful, grounded",
        pref_personality: profile.partnerPreferencesDetails?.personality || "Honest, emotionally mature, ambitious",
        pref_overview: profile.partnerPreferencesDetails?.overview || profile.partner_preference || "",
      });

      const existingImages = Array.isArray(profile.image) && profile.image.length > 0
        ? profile.image.map((img: any) => typeof img === "string" ? img : (img?.url || img?.path)).filter(Boolean)
        : Array.isArray(profile.photos) && profile.photos.length > 0
        ? profile.photos.map((img: any) => typeof img === "string" ? img : (img?.url || img?.path)).filter(Boolean)
        : typeof profile.image === "string" && profile.image
        ? [profile.image]
        : [];
      if (existingImages.length > 0) {
        setCasualPhotos(existingImages);
      }

      if (profile.family_photo) {
        const src = typeof profile.family_photo === "string" ? profile.family_photo : (profile.family_photo?.url || profile.family_photo?.path);
        if (src) setFamilyPhotos([src]);
      } else if (Array.isArray(profile.family_photos) && profile.family_photos.length > 0) {
        const src = typeof profile.family_photos[0] === "string" ? profile.family_photos[0] : (profile.family_photos[0]?.url || profile.family_photos[0]?.path);
        if (src) setFamilyPhotos([src]);
      }

      const jathObj = profile.horoscopeDetails?.jathagam || profile.jathagam;
      if (jathObj) {
        setHoroscopeUploaded(true);
        const name = typeof jathObj === "object" ? jathObj.name || "jathagam_document.pdf" : "jathagam_document.pdf";
        setHoroscopeFileName(name);
      }
    }
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveInlineProfile = async () => {
    try {
      if (formData.dob) {
        const dobDate = new Date(formData.dob);
        if (isNaN(dobDate.getTime())) {
          showToast("Please enter a valid Date of Birth", "error");
          return;
        }
        const today = new Date();
        if (dobDate > today) {
          showToast("Date of Birth cannot be in the future", "error");
          return;
        }
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18) {
          showToast("Age must be at least 18 years old", "error");
          return;
        }
      }

      if (
        (formData.diet !== undefined && !String(formData.diet).trim()) ||
        (formData.smoking !== undefined && !String(formData.smoking).trim()) ||
        (formData.drinking !== undefined && !String(formData.drinking).trim()) ||
        (formData.living_with !== undefined && !String(formData.living_with).trim()) ||
        (formData.willing_to_relocate !== undefined && !String(formData.willing_to_relocate).trim()) ||
        (formData.interests !== undefined && !String(formData.interests).trim())
      ) {
        showToast("Please complete all Lifestyle details (Diet, Smoking, Drinking, Living With, Relocate, Interests)", "error");
        return;
      }

      if (keycloak) {
        await keycloak.updateToken(30);
      }
      const token = keycloak?.token;
      const apiUrl = configUrls?.apiUrl || "http://localhost:3000";

      const imageObjects = casualPhotos.map((url, idx) => ({
        url,
        default: idx === 0,
      }));

      const payload = {
        ...profile,
        ...formData,
        image: imageObjects,
        photos: casualPhotos,
        family_photos: familyPhotos.length > 0 ? [{ url: familyPhotos[0] }] : (profile?.family_photos || []),
        horoscopeDetails: {
          dob: formData.dob !== undefined ? formData.dob : (profile?.horoscopeDetails?.dob || profile?.dob || ""),
          star: formData.star !== undefined ? formData.star : (profile?.horoscopeDetails?.star || profile?.star || ""),
          rasi: formData.rasi !== undefined ? formData.rasi : (profile?.horoscopeDetails?.rasi || profile?.rasi || ""),
          lagnam: formData.lagnam !== undefined ? formData.lagnam : (profile?.horoscopeDetails?.lagnam || profile?.lagnam || ""),
          gothram: formData.gothram !== undefined ? formData.gothram : (profile?.horoscopeDetails?.gothram || profile?.gothram || ""),
          tob: formData.tob !== undefined ? formData.tob : (profile?.horoscopeDetails?.tob || profile?.tob || ""),
          pob: formData.pob !== undefined ? formData.pob : (profile?.horoscopeDetails?.pob || profile?.pob || ""),
          dosham: formData.dosham !== undefined ? formData.dosham : (profile?.horoscopeDetails?.dosham || profile?.dosham || "No Dosham"),
          manglik: formData.manglik !== undefined ? formData.manglik : (profile?.horoscopeDetails?.manglik || profile?.manglik || "No"),
          chevvai_dosham: formData.chevvai_dosham !== undefined ? formData.chevvai_dosham : (profile?.horoscopeDetails?.chevvai_dosham || profile?.chevvai_dosham || "No"),
          rahu_ketu_dosham: formData.rahu_ketu_dosham !== undefined ? formData.rahu_ketu_dosham : (profile?.horoscopeDetails?.rahu_ketu_dosham || profile?.rahu_ketu_dosham || "Neutral"),
          jathagam: profile?.horoscopeDetails?.jathagam || profile?.jathagam || null,
        },
        familyBackground: {
          ...(profile?.familyBackground || {}),
          father_name: formData.father_name || profile?.familyBackground?.father_name || profile?.father_name || "",
          father_occupation: formData.father_occupation || profile?.familyBackground?.father_occupation || profile?.father_occupation || "",
          mother_name: formData.mother_name || profile?.familyBackground?.mother_name || profile?.mother_name || "",
          mother_occupation: formData.mother_occupation || profile?.familyBackground?.mother_occupation || profile?.mother_occupation || "",
          siblings: formData.siblings || profile?.familyBackground?.siblings || profile?.siblings || "",
          siblings_details: formData.siblings_details || profile?.familyBackground?.siblings_details || profile?.siblings_details || "",
          family_type: formData.family_type || profile?.familyBackground?.family_type || profile?.family_type || "",
          family_type_details: formData.family_type_details || profile?.familyBackground?.family_type_details || profile?.family_type_details || "",
          family_status: formData.family_status || profile?.familyBackground?.family_status || profile?.family_status || "",
          family_status_details: formData.family_status_details || profile?.familyBackground?.family_status_details || profile?.family_status_details || "",
          family_address: formData.family_address || profile?.familyBackground?.family_address || profile?.family_address || "",
          family_values: formData.family_values || profile?.familyBackground?.family_values || profile?.family_values || "",
          family_values_details: formData.family_values_details || profile?.familyBackground?.family_values_details || profile?.family_values_details || "",
          about_family: formData.about_family || profile?.familyBackground?.about_family || profile?.about_family || "",
          about_family_tamil: formData.about_family_tamil || profile?.familyBackground?.about_family_tamil || profile?.about_family_tamil || "",
        },
        lifeStyle: {
          ...(profile?.lifeStyle || {}),
          diet: formData.diet !== undefined ? formData.diet : (profile?.lifeStyle?.diet || profile?.diet || "Strict Vegetarian"),
          smoking: formData.smoking !== undefined ? formData.smoking : (profile?.lifeStyle?.smoking || profile?.smoking || "Non-Smoker"),
          drinking: formData.drinking !== undefined ? formData.drinking : (profile?.lifeStyle?.drinking || profile?.drinking || "Non-Drinker"),
          living_with: formData.living_with !== undefined ? formData.living_with : (profile?.lifeStyle?.living_with || profile?.living_with || "With Family"),
          willing_to_relocate: formData.willing_to_relocate !== undefined ? formData.willing_to_relocate : (profile?.lifeStyle?.willing_to_relocate || profile?.willing_to_relocate || "Yes, TN preferred"),
          interests: formData.interests !== undefined ? formData.interests : (profile?.lifeStyle?.interests || profile?.interests || "Yoga, Cooking, Trekking"),
        },
        partnerPreferencesDetails: {
          ...(profile?.partnerPreferencesDetails || {}),
          age_range: formData.pref_age_range !== undefined ? formData.pref_age_range : (profile?.partnerPreferencesDetails?.age_range || "27 – 33 yrs"),
          age_flexible: formData.pref_age_flexible !== undefined ? formData.pref_age_flexible : (profile?.partnerPreferencesDetails?.age_flexible || "flexible"),
          height: formData.pref_height !== undefined ? formData.pref_height : (profile?.partnerPreferencesDetails?.height || "5'7\" and above"),
          marital_status: formData.pref_marital_status !== undefined ? formData.pref_marital_status : (profile?.partnerPreferencesDetails?.marital_status || "Never Married preferred"),
          diet: formData.pref_diet !== undefined ? formData.pref_diet : (profile?.partnerPreferencesDetails?.diet || "Vegetarian only"),
          smoking: formData.pref_smoking !== undefined ? formData.pref_smoking : (profile?.partnerPreferencesDetails?.smoking || "Non-Smoker"),
          drinking: formData.pref_drinking !== undefined ? formData.pref_drinking : (profile?.partnerPreferencesDetails?.drinking || "Non-Drinker preferred"),
          drinking_flexible: formData.pref_drinking_flexible !== undefined ? formData.pref_drinking_flexible : (profile?.partnerPreferencesDetails?.drinking_flexible || "flexible"),
          education: formData.pref_education !== undefined ? formData.pref_education : (profile?.partnerPreferencesDetails?.education || "Graduate & above"),
          occupation: formData.pref_occupation !== undefined ? formData.pref_occupation : (profile?.partnerPreferencesDetails?.occupation || "Any professional field"),
          income: formData.pref_income !== undefined ? formData.pref_income : (profile?.partnerPreferencesDetails?.income || "₹8L+ per year"),
          religion: formData.pref_religion !== undefined ? formData.pref_religion : (profile?.partnerPreferencesDetails?.religion || "Hindu preferred"),
          caste: formData.pref_caste !== undefined ? formData.pref_caste : (profile?.partnerPreferencesDetails?.caste || "Tamil Brahmin preferred"),
          caste_open: formData.pref_caste_open !== undefined ? formData.pref_caste_open : (profile?.partnerPreferencesDetails?.caste_open || "open"),
          location: formData.pref_location !== undefined ? formData.pref_location : (profile?.partnerPreferencesDetails?.location || "Tamil Nadu or willing to relocate"),
          living_setup: formData.pref_living_setup !== undefined ? formData.pref_living_setup : (profile?.partnerPreferencesDetails?.living_setup || "Open to joint or nuclear family"),
          values: formData.pref_values !== undefined ? formData.pref_values : (profile?.partnerPreferencesDetails?.values || "Family-oriented, respectful, grounded"),
          personality: formData.pref_personality !== undefined ? formData.pref_personality : (profile?.partnerPreferencesDetails?.personality || "Honest, emotionally mature, ambitious"),
          overview: formData.pref_overview !== undefined ? formData.pref_overview : (profile?.partnerPreferencesDetails?.overview || profile?.partner_preference || ""),
        },
        partner_preference: formData.pref_overview !== undefined ? formData.pref_overview : (profile?.partner_preference || ""),
        keycloakId: profile?.keycloakId || keycloak?.tokenParsed?.sub,
        customer_id: profile?.customer_id,
        _id: profile?._id,
      };

      const res = await fetch(`${apiUrl}/api/customer_edit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        showToast("Profile changes saved successfully! ✨", "success");
        setIsEditing(false);
        refreshProfile();
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  const firstName = profile?.first_name || profile?.firstName || "";
  const lastName = profile?.last_name || profile?.lastName || "";
  const nameKit = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Profile";

  const defaultImgObj = Array.isArray(profile?.image)
    ? profile.image.find((img: any) => img.default) || profile.image[0]
    : null;
  const avatarUrl =
    (typeof defaultImgObj === "string" ? defaultImgObj : defaultImgObj?.url) ||
    (typeof profile?.image === "string" ? profile.image : null) ||
    (Array.isArray(profile?.photos) && profile.photos[0]) ||
    profile?.photo ||
    null;

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(profile?.dob);
  const ageDisplay = calculatedAge ? `${calculatedAge} years` : (profile?.dob || "N/A");

  const locationParts = [profile?.taluk_town, profile?.district, profile?.state].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : "Tamil Nadu";

  const customerId = profile?.customer_id || (profile?._id ? `cid_${profile._id}` : "SC-TN-CUSTOMER");
  console.log('Profile----1,', profile);

  // Page load anim trigger
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Action / State Toggles
  const [isLiked, setIsLiked] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("about");

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
  };

  // Completeness & Uploader States
  const [horoscopeUploaded, setHoroscopeUploaded] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);
  const [casualPhotos, setCasualPhotos] = useState<string[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<string[]>([]);
  const [horoscopeFileName, setHoroscopeFileName] = useState("");

  // Calculations
  const completeness =
    78 +
    (horoscopeUploaded ? 10 : 0) +
    (casualPhotos.length > 0 ? 6 : 0) +
    (voiceNoteRecorded ? 6 : 0);

  // References for inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const familyPhotoInputRef = useRef<HTMLInputElement>(null);
  const horoInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording Modal State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Employment Verification Mock
  const [employmentStatus, setEmploymentStatus] = useState<
    "pending" | "submitted" | "verified"
  >("pending");

  // Email and Phone Inline Verification states
  const [verifyingType, setVerifyingType] = useState<"email" | "phone" | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleStartVerify = (type: "email" | "phone") => {
    setVerifyingType(type);
    setOtpSent(false);
    setOtpCode("");
  };

  const handleSendOtp = async () => {
    if (!profile?.email || !verifyingType) return;
    setSendingOtp(true);
    try {
      const apiUrl = configUrls?.apiUrl || "http://localhost:3000";
      const payload: any = {
        email: profile.email,
        type: verifyingType,
      };

      if (verifyingType === "phone") {
        payload.phone_number = profile.phone_number;
        payload.phone_code = profile.phone_code || "+91";
      }

      const res = await fetch(`${apiUrl}/api/public/verification/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send code");
      }

      const data = await res.json();
      setOtpSent(true);
      if (verifyingType === "phone" && data.otp) {
        showToast(`OTP Code sent (simulated): ${data.otp}`, "success");
      } else {
        showToast("Verification code sent successfully!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to send verification code", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!profile?.email || !verifyingType || !otpCode) return;
    setVerifyingOtp(true);
    try {
      const apiUrl = configUrls?.apiUrl || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/public/verification/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          type: verifyingType,
          otp: otpCode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Verification failed");
      }

      showToast(`${verifyingType === "email" ? "Email" : "Phone number"} verified successfully!`, "success");
      setVerifyingType(null);
      setOtpSent(false);
      setOtpCode("");
      
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Invalid or expired code", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const renderInlineVerification = (type: "email" | "phone") => {
    return (
      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 w-full">
        <div className="text-xs text-slate-500 font-medium">
          {otpSent 
            ? `We sent a 6-digit code to your ${type === "email" ? "email address" : "phone number"}.` 
            : `Click "Send Code" to verify your ${type === "email" ? "email" : "phone number"}.`}
        </div>
        
        {otpSent ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-violet-500 font-mono tracking-widest text-center"
            />
            <button
              onClick={handleConfirmOtp}
              disabled={verifyingOtp || otpCode.length !== 6}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifyingOtp ? "Verifying..." : "Confirm"}
            </button>
            <button
              onClick={() => {
                setVerifyingType(null);
                setOtpSent(false);
                setOtpCode("");
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {sendingOtp ? "Sending..." : "Send Code"}
            </button>
            <button
              onClick={() => setVerifyingType(null)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  // Interaction handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    showToast(
      isLiked
        ? "Removed profile from your liked list"
        : "Added profile to your liked list! ♥",
      isLiked ? "info" : "success",
    );
  };

  const handleShortlist = () => {
    setIsShortlisted(!isShortlisted);
    showToast(
      isShortlisted
        ? "Removed profile from shortlist"
        : "Profile shortlisted! ★",
      isShortlisted ? "info" : "success",
    );
  };

  const handleSendInterest = () => {
    if (interestSent) return;
    setInterestSent(true);
    showToast(
      "Connection interest sent successfully! Priya will be notified.",
      "success",
    );
  };

  const handleSendMessage = () => {
    showToast("Message sent to Priya Krishnamurthy! ✉", "success");
    setMessageSent(true);
  };

  const triggerPhotoUpload = () => {
    photoInputRef.current?.click();
  };

  const triggerFamilyPhotoUpload = () => {
    familyPhotoInputRef.current?.click();
  };

  const triggerHoroUpload = () => {
    horoInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (casualPhotos.length >= 5) {
        showToast("Maximum of 5 profile photos allowed", "error");
        return;
      }
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCasualPhotos((prev) => [...prev, base64String]);
        showToast("Profile photo uploaded! Click 'Save Changes' or 'Save Photos' to save.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetDefaultPhoto = (index: number) => {
    if (index === 0) return;
    setCasualPhotos((prev) => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
    showToast("Default photo updated! Click 'Save Photo Changes' to apply.", "success");
  };

  const handleFamilyPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFamilyPhotos([base64String]);
        showToast("Family photo added successfully! Click Save Changes to apply.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUploadTip = () => {
    setActiveTab("photos");
    showToast("Redirected to Photos tab!", "info");
    // Trigger upload after short delay
    setTimeout(() => {
      triggerPhotoUpload();
    }, 300);
  };

  const handleHoroUploadTip = () => {
    setActiveTab("horoscope");
    showToast("Redirected to Horoscope tab!", "info");
    // Trigger upload after short delay
    setTimeout(() => {
      triggerHoroUpload();
    }, 300);
  };

  const handleHoroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setHoroscopeFileName(file.name);
      setHoroscopeUploaded(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const token = keycloak?.token;
          const apiUrl = configUrls?.apiUrl || "http://localhost:3000";
          const res = await fetch(`${apiUrl}/api/customer_edit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              ...profile,
              horoscopeDetails: {
                ...(profile?.horoscopeDetails || {}),
                jathagam: {
                  url: base64String,
                  name: file.name,
                  type: file.type,
                },
              },
              keycloakId: profile?.keycloakId || keycloak?.tokenParsed?.sub,
              customer_id: profile?.customer_id,
              _id: profile?._id,
            }),
          });

          const data = await res.json();
          if (res.ok && !data.error) {
            showToast("Jathagam / Birth Chart saved to local uploads! ✨", "success");
            if (refreshProfile) await refreshProfile();
          } else {
            showToast(data.error || "Failed to upload Jathagam", "error");
          }
        } catch (err: any) {
          console.error("Error uploading Jathagam:", err);
          showToast(err.message || "Failed to upload Jathagam", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice note mock
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setVoiceNoteRecorded(true);
    setShowVoiceModal(false);
    showToast("Voice introduction saved successfully!", "success");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Switch tabs helper
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Modal actions
  const handleVerifyEmployment = () => {
    setEmploymentStatus("submitted");
    showToast(
      "Verification documents submitted. Approval pending within 24 hours.",
      "info",
    );
  };

  return (
    <div className="page-wrapper">
      {/* HERO BANNER */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-pattern"></div>
        <button
          className="profile-back-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/portal");
            }
          }}
        >
          ← Browse Profiles
        </button>
        <div className="profile-hero-actions">
          {isCustomer && (
            !isEditing ? (
              <button
                className="hero-action-btn font-semibold flex items-center gap-1.5 px-3.5 !w-auto !rounded-full text-xs hover:bg-white/30 transition-all shadow-sm"
                title="Edit Profile"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="hero-action-btn font-semibold flex items-center gap-1.5 px-3.5 !w-auto !rounded-full text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                  title="Save Changes"
                  onClick={handleSaveInlineProfile}
                >
                  <Check className="h-3.5 w-3.5" /> Save Changes
                </button>
                <button
                  className="hero-action-btn font-semibold flex items-center gap-1.5 px-3.5 !w-auto !rounded-full text-xs bg-slate-800/80 text-white hover:bg-slate-900 transition-all shadow-sm"
                  title="Cancel Editing"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) setFormData({ ...profile });
                  }}
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            )
          )}
          <button
            className="hero-action-btn"
            title="Share"
            onClick={() =>
              showToast("Profile link copied to clipboard!", "info")
            }
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="hero-action-btn"
            title="Report"
            onClick={() =>
              showToast(
                "Feedback request sent. Our safety team will review.",
                "info",
              )
            }
          >
            <Flag className="h-4 w-4" />
          </button>
          <button
            className="hero-action-btn"
            title="More"
            onClick={() =>
              showToast("Additional action menu triggered.", "info")
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="profile-layout">
        {/* LEFT COLUMN */}
        <div className="profile-left">
          {/* Main Card */}
          <div className={`profile-card reveal ${isLoaded ? "visible" : ""}`}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar relative flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nameKit}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{firstName ? firstName[0].toUpperCase() : "P"}</span>
                )}
                {profile?.public_verify && <div className="avatar-verified">✓</div>}
              </div>
              {!isEditing ? (
                <div className="flex items-center justify-center gap-2 mt-3.5">
                  <div className="profile-name !mt-0">{nameKit}</div>
                  {isCustomer && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-full hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 items-center mt-3.5 w-full max-w-[260px]">
                  <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                    Editing Name
                  </div>
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.first_name || ""}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                      className="w-1/2 px-2.5 py-1 text-xs font-semibold bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 text-center"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.last_name || ""}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                      className="w-1/2 px-2.5 py-1 text-xs font-semibold bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 text-center"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                {profile?.subscription_type && (
                  <div className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {profile.subscription_type} Plan
                  </div>
                )}
                {profile?.public_verify ? (
                  <div className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span>✓</span> Publicly Verified
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <span>⏳</span> Verification Pending
                  </div>
                )}
                {profile?.approvalStatus && (
                  <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {profile.approvalStatus}
                  </div>
                )}
              </div>
              {!isEditing ? (
                <div className="profile-tagline">
                  {profile?.about_self ||
                    "Looking for a partner equally at home with traditional values and modern growth."}
                </div>
              ) : (
                <div className="w-full max-w-[260px] my-2 text-center">
                  <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">
                    Headline / Summary
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Short Headline / About self..."
                    value={formData.about_self || ""}
                    onChange={(e) => handleChange("about_self", e.target.value)}
                    className="w-full p-2 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 text-center"
                  />
                </div>
              )}
              <div className="profile-location">📍 {locationStr}</div>
              <div className="profile-id">{customerId}</div>
            </div>

            {/* Compatibility Score */}
            <div className="match-score-wrap">
              <div
                className="match-score-ring"
                style={{
                  background: `conic-gradient(var(--rose) 0% 88%, var(--plum-light) 88% 100%)`,
                }}
              >
                <div className="match-score-inner">
                  <div className="match-score-num">88</div>
                  <div className="match-score-pct">%</div>
                </div>
              </div>
              <div className="match-score-info">
                <h4>Strong Compatibility</h4>
                <p>Values, lifestyle & horoscope alignment</p>
                <span className="match-label">✦ Top 5% Match</span>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              {isCustomer ? (
                !isEditing ? (
                  <button
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: "linear-gradient(135deg, var(--rose), var(--plum))",
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      className="btn-primary"
                      onClick={handleSaveInlineProfile}
                      style={{
                        background: "linear-gradient(135deg, #059669, #0D9488)",
                      }}
                    >
                      <Check className="h-4 w-4 mr-1.5" /> Save Changes
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) setFormData({ ...profile });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )
              ) : (
                <>
                  <button
                    className="btn-primary"
                    onClick={handleSendInterest}
                    style={{
                      background: interestSent
                        ? "linear-gradient(135deg, var(--sage), var(--teal))"
                        : "",
                    }}
                  >
                    {interestSent ? "✓ Interest Sent" : "💬 Send Interest"}
                  </button>
                  <button className="btn-secondary" onClick={handleSendMessage}>
                    ✉ Send Message
                  </button>
                  <div className="btn-row">
                    <button
                      className="btn-like"
                      onClick={handleLike}
                      style={{
                        backgroundColor: isLiked ? "var(--rose-light)" : "white",
                        borderColor: isLiked ? "var(--rose)" : "",
                        fontWeight: isLiked ? "700" : "500",
                      }}
                    >
                      {isLiked ? "♥ Liked" : "♡ Like"}
                    </button>
                    <button
                      className="btn-shortlist"
                      onClick={handleShortlist}
                      style={{
                        backgroundColor: isShortlisted
                          ? "var(--amber-light)"
                          : "white",
                        borderColor: isShortlisted ? "var(--amber)" : "",
                        fontWeight: isShortlisted ? "700" : "500",
                      }}
                    >
                      {isShortlisted ? "★ Shortlisted" : "★ Shortlist"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick Facts */}
            <div className="quick-facts">
              <div className="quick-facts-title">Quick Snapshot</div>
              <div className="fact-row">
                <div className="fact-icon">🎂</div>
                <div className="fact-label">Age / DOB</div>
                <div className="fact-value">
                  {!isEditing ? (
                    ageDisplay
                  ) : (
                    <input
                      type="date"
                      value={formData.dob || ""}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">📏</div>
                <div className="fact-label">Height</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.height || "N/A"
                  ) : (
                    <input
                      type="text"
                      placeholder="Height (e.g. 5'8&quot;)"
                      value={formData.height || ""}
                      onChange={(e) => handleChange("height", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🛕</div>
                <div className="fact-label">Religion / Caste</div>
                <div className="fact-value">
                  {!isEditing ? (
                    `${profile?.religion || "N/A"}${profile?.caste ? ` (${profile.caste})` : ""}`
                  ) : (
                    <div className="flex gap-1 w-full">
                      <input
                        type="text"
                        placeholder="Religion"
                        value={formData.religion || ""}
                        onChange={(e) => handleChange("religion", e.target.value)}
                        className="w-1/2 px-1.5 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Caste"
                        value={formData.caste || ""}
                        onChange={(e) => handleChange("caste", e.target.value)}
                        className="w-1/2 px-1.5 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">💼</div>
                <div className="fact-label">Profession</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.profession || "N/A"
                  ) : (
                    <input
                      type="text"
                      placeholder="Profession"
                      value={formData.profession || ""}
                      onChange={(e) => handleChange("profession", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🎓</div>
                <div className="fact-label">Education</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.education || "N/A"
                  ) : (
                    <input
                      type="text"
                      placeholder="Education"
                      value={formData.education || ""}
                      onChange={(e) => handleChange("education", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">💰</div>
                <div className="fact-label">Income</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.annual_income || "N/A"
                  ) : (
                    <input
                      type="text"
                      placeholder="Annual Income"
                      value={formData.annual_income || ""}
                      onChange={(e) => handleChange("annual_income", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">📍</div>
                <div className="fact-label">District</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.district || "N/A"
                  ) : (
                    <input
                      type="text"
                      placeholder="District"
                      value={formData.district || ""}
                      onChange={(e) => handleChange("district", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🌐</div>
                <div className="fact-label">Languages</div>
                <div className="fact-value">
                  {!isEditing ? (
                    profile?.mother_tongue || "Tamil"
                  ) : (
                    <input
                      type="text"
                      placeholder="Mother Tongue / Languages"
                      value={formData.mother_tongue || ""}
                      onChange={(e) => handleChange("mother_tongue", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completeness Card */}
          <div
            className={`completeness-bar reveal ${isLoaded ? "visible" : ""}`}
            style={{ transitionDelay: ".1s" }}
          >
            <div className="completeness-header">
              <span>Profile Completeness</span>
              <span className="completeness-pct">{completeness}%</span>
            </div>
            <div className="c-track">
              <div
                className="c-fill"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <div className="completeness-tips">
              <div
                className={`c-tip ${horoscopeUploaded ? "completed" : ""}`}
                onClick={handleHoroUploadTip}
              >
                {horoscopeUploaded
                  ? "Horoscope chart added"
                  : "Add horoscope chart (jathagam)"}
              </div>
              <div
                className={`c-tip ${casualPhotos.length > 0 ? "completed" : ""}`}
                onClick={handlePhotoUploadTip}
              >
                {casualPhotos.length > 0
                  ? "Photos uploaded"
                  : "Upload 2 more photos to attract matches"}
              </div>
              <div
                className={`c-tip ${voiceNoteRecorded ? "completed" : ""}`}
                onClick={() => {
                  if (!voiceNoteRecorded) {
                    setShowVoiceModal(true);
                  }
                }}
              >
                {voiceNoteRecorded
                  ? "Voice note introduction saved"
                  : "Record a voice note introduction"}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right">
          {/* INLINE EDIT MODE BANNER */}
          {isCustomer && isEditing && (
            <div className="mb-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✏️</span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                      Profile Editing Mode Active
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Update your details directly on the page below and click Save Changes when finished.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleSaveInlineProfile}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition"
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) setFormData({ ...profile });
                    }}
                    className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl border border-slate-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Bar */}
          <div
            className={`profile-tabs-bar reveal ${isLoaded ? "visible" : ""}`}
          >
            <button
              className={`ptab ${activeTab === "about" ? "active" : ""}`}
              onClick={() => handleTabClick("about")}
            >
              About
            </button>
            <button
              className={`ptab ${activeTab === "details" ? "active" : ""}`}
              onClick={() => handleTabClick("details")}
            >
              Details
            </button>
            <button
              className={`ptab ${activeTab === "family" ? "active" : ""}`}
              onClick={() => handleTabClick("family")}
            >
              Family
            </button>
            <button
              className={`ptab ${activeTab === "partner" ? "active" : ""}`}
              onClick={() => handleTabClick("partner")}
            >
              Partner Prefs
            </button>
            <button
              className={`ptab ${activeTab === "photos" ? "active" : ""}`}
              onClick={() => handleTabClick("photos")}
            >
              Photos
            </button>
            <button
              className={`ptab ${activeTab === "horoscope" ? "active" : ""}`}
              onClick={() => handleTabClick("horoscope")}
            >
              Horoscope
            </button>
          </div>

          {/* ABOUT TAB PANEL */}
          <div className={`tab-panel ${activeTab === "about" ? "active" : ""}`}>
            <div className={`content-card reveal ${isLoaded ? "visible" : ""}`}>
              <div className="content-card-title flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="ctitle-icon">✍</div>About Me
                </div>
                {isCustomer && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-lg transition"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              {!isEditing ? (
                <p className="about-text">
                  {profile?.about_self ||
                    "Welcome to my profile! I am looking for a partner with shared values and mutual respect to build a meaningful life together."}
                </p>
              ) : (
                <div className="mt-1">
                  <label className="block text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">
                    Edit About Yourself:
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about_self || ""}
                    onChange={(e) => handleChange("about_self", e.target.value)}
                    className="w-full p-3 text-sm bg-violet-50/70 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 leading-relaxed font-sans"
                    placeholder="Write a warm description about your values, personality, and hobbies..."
                  />
                </div>
              )}
              {profile?.identity_proff?.url && (
                <div className="mt-4 p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">Identity Proof Document</div>
                      <div className="text-[11px] text-slate-500">Verified document uploaded</div>
                    </div>
                  </div>
                  <a
                    href={profile.identity_proff.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline"
                  >
                    View Document ↗
                  </a>
                </div>
              )}
            </div>

            {/* Ambition */}
            {(!isEditing ? profile?.ambition : true) && (
              <div
                className={`content-card reveal ${isLoaded ? "visible" : ""}`}
                style={{ transitionDelay: ".05s" }}
              >
                <div className="content-card-title">
                  <div className="ctitle-icon">🎯</div>Ambition
                </div>
                {!isEditing ? (
                  <p className="about-text">{profile?.ambition}</p>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">
                      Edit Ambition / Goals:
                    </label>
                    <textarea
                      rows={3}
                      value={formData.ambition || ""}
                      onChange={(e) => handleChange("ambition", e.target.value)}
                      className="w-full p-3 text-sm bg-violet-50/70 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 leading-relaxed font-sans"
                      placeholder="Describe your personal or career goals..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Health & Medical Report */}
            {(!isEditing ? (profile?.health_report || profile?.blood_group || profile?.additional_report_info) : true) && (
              <div
                className={`content-card reveal ${isLoaded ? "visible" : ""}`}
                style={{ transitionDelay: ".07s" }}
              >
                <div className="content-card-title">
                  <div className="ctitle-icon">🏥</div>Health & Medical Report
                </div>
                
                <div className="space-y-4 text-sm mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Blood Group:</span>
                    {!isEditing ? (
                      <span className="font-semibold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-xs border border-rose-100">
                        {profile?.blood_group || "N/A"}
                      </span>
                    ) : (
                      <select
                        value={formData.blood_group || profile?.blood_group || ""}
                        onChange={(e) => handleChange("blood_group", e.target.value)}
                        className="px-2.5 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800"
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {(!isEditing ? profile?.additional_report_info : true) && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-semibold text-slate-800 text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Additional Report Info
                      </h4>
                      {!isEditing ? (
                        <p className="text-slate-600 leading-relaxed">
                          {profile?.additional_report_info}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          value={formData.additional_report_info || ""}
                          onChange={(e) => handleChange("additional_report_info", e.target.value)}
                          className="w-full p-2.5 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800"
                          placeholder="Additional health details..."
                        />
                      )}
                    </div>
                  )}

                  {profile?.health_report?.url && (
                    <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <div className="font-semibold text-xs text-slate-800">Medical Report Document</div>
                          <div className="text-[11px] text-slate-500">Verified document uploaded</div>
                        </div>
                      </div>
                      <a
                        href={profile.health_report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline"
                      >
                        View Document ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">✦</div>Interests & Hobbies
              </div>
              <div className="tags-wrap">
                <span className="tag rose">🎨 UX Design</span>
                <span className="tag plum">📚 Historical Fiction</span>
                <span className="tag sage">🏞️ Hiking</span>
                <span className="tag rose">🍳 Cooking</span>
                <span className="tag amber">🎵 Carnatic Music</span>
                <span className="tag plum">🧘 Yoga</span>
                <span className="tag sage">📷 Photography</span>
                <span className="tag rose">🛕 Temple Visits</span>
                <span className="tag amber">✈️ Travel</span>
                <span className="tag plum">🌿 Sustainable Living</span>
              </div>
            </div> */}

            {/* <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💫</div>Personality Vibe
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Introvert</span>
                  <span>76%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "76%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Traditional Values</span>
                  <span>82%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "82%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Career-Driven</span>
                  <span>88%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Family-Oriented</span>
                  <span>94%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "94%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Adventure Seeker</span>
                  <span>61%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "61%" }}></div>
                </div>
              </div>
            </div> */}

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".3s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🛡</div>Verification Status
              </div>
              <div className="verify-badges">
                <div className={`vbadge ${profile?.phone_verified ? "" : "pending"}`}>
                  <div className="vbadge-icon">📱</div>
                  <div className="vbadge-text">
                    <strong>Mobile</strong>
                    <small className={profile?.phone_verified ? "text-sage" : "text-amber"}>
                      {profile?.phone_verified ? "✓ Verified" : "⏳ Pending verification"}
                    </small>
                  </div>
                </div>
                <div className={`vbadge ${profile?.email_verified ? "" : "pending"}`}>
                  <div className="vbadge-icon">✉️</div>
                  <div className="vbadge-text">
                    <strong>Email</strong>
                    <small className={profile?.email_verified ? "text-sage" : "text-amber"}>
                      {profile?.email_verified ? "✓ Verified" : "⏳ Pending verification"}
                    </small>
                  </div>
                </div>
                <div className="vbadge">
                  <div className="vbadge-icon">🪪</div>
                  <div className="vbadge-text">
                    <strong>Aadhaar</strong>
                    <small>✓ Verified</small>
                  </div>
                </div>
                <div className="vbadge">
                  <div className="vbadge-icon">🎓</div>
                  <div className="vbadge-text">
                    <strong>Education</strong>
                    <small>✓ Verified</small>
                  </div>
                </div>
                {employmentStatus === "pending" && (
                  <div className="vbadge pending flex flex-row items-center gap-3">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small
                        className="cursor-pointer hover:underline text-amber"
                        onClick={handleVerifyEmployment}
                      >
                        ⏳ Pending - Click to verify
                      </small>
                    </div>
                  </div>
                )}
                {employmentStatus === "submitted" && (
                  <div className="vbadge pending">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small className="text-amber">
                        ⏳ Documents Submitted
                      </small>
                    </div>
                  </div>
                )}
                {employmentStatus === "verified" && (
                  <div className="vbadge">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small className="text-sage">✓ Verified</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".4s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💞</div>Profiles You May Like
              </div>
              <div className="similar-grid">
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Ananya's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#F2688C,#7C3AED)",
                    }}
                  >
                    A
                  </div>
                  <div className="sim-name">Ananya, 26</div>
                  <div className="sim-info">Chennai · Software Eng.</div>
                  <div className="sim-match">✓ 94% match</div>
                </div>
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Deepika's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#059669,#0D9488)",
                    }}
                  >
                    D
                  </div>
                  <div className="sim-name">Deepika, 28</div>
                  <div className="sim-info">Coimbatore · Doctor</div>
                  <div className="sim-match">✓ 90% match</div>
                </div>
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Ranjani's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#F59E0B,#D97706)",
                    }}
                  >
                    R
                  </div>
                  <div className="sim-name">Ranjani, 25</div>
                  <div className="sim-info">Madurai · Architect</div>
                  <div className="sim-match">✓ 87% match</div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "details" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="ctitle-icon">👤</div>Personal Details
                </div>
                {isCustomer && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-lg transition"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      nameKit
                    ) : (
                      <div className="flex gap-1.5 w-full">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={formData.first_name || ""}
                          onChange={(e) => handleChange("first_name", e.target.value)}
                          className="w-1/2 px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={formData.last_name || ""}
                          onChange={(e) => handleChange("last_name", e.target.value)}
                          className="w-1/2 px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date of Birth</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.dob || "N/A"
                    ) : (
                      <input
                        type="date"
                        value={formData.dob || ""}
                        onChange={(e) => handleChange("dob", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Age</div>
                  <div className="detail-value">{ageDisplay}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Gender</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.gender || "N/A"
                    ) : (
                      <select
                        value={formData.gender || ""}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Height</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.height || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.height || ""}
                        onChange={(e) => handleChange("height", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Marital Status</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.maritial_status || profile?.marital_status || "N/A"
                    ) : (
                      <select
                        value={formData.maritial_status || ""}
                        onChange={(e) => handleChange("maritial_status", e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      >
                        <option value="">Select Status</option>
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Mother Tongue</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.mother_tongue || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.mother_tongue || ""}
                        onChange={(e) => handleChange("mother_tongue", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item relative">
                  <div className="detail-label">Email</div>
                  <div className="detail-value flex flex-wrap items-center gap-2 justify-between">
                    <span>{profile?.email || "N/A"}</span>
                    {profile?.email && (
                      profile.email_verified ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartVerify("email")}
                          className="inline-flex items-center text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200 transition-colors cursor-pointer"
                        >
                          Verify Now
                        </button>
                      )
                    )}
                  </div>
                  {verifyingType === "email" && renderInlineVerification("email")}
                </div>
                <div className="detail-item relative">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value flex flex-wrap items-center gap-2 justify-between">
                    <span>
                      {profile?.phone_code || "+91"} {profile?.phone_number || "N/A"}
                    </span>
                    {profile?.phone_number && (
                      profile.phone_verified ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartVerify("phone")}
                          className="inline-flex items-center text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200 transition-colors cursor-pointer"
                        >
                          Verify Now
                        </button>
                      )
                    )}
                  </div>
                  {verifyingType === "phone" && renderInlineVerification("phone")}
                </div>
                <div className="detail-item">
                  <div className="detail-label">District</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.district || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.district || ""}
                        onChange={(e) => handleChange("district", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Taluk / Town</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.taluk_town || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.taluk_town || ""}
                        onChange={(e) => handleChange("taluk_town", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">State / Zipcode</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      `${profile?.state || "N/A"} ${profile?.zipcode ? `(${profile.zipcode})` : ""}`
                    ) : (
                      <div className="flex gap-1 w-full">
                        <input
                          type="text"
                          placeholder="State"
                          value={formData.state || ""}
                          onChange={(e) => handleChange("state", e.target.value)}
                          className="w-2/3 px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Zipcode"
                          value={formData.zipcode || ""}
                          onChange={(e) => handleChange("zipcode", e.target.value)}
                          className="w-1/3 px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🎓</div>Education & Career
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Highest Degree / Education</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.education || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.education || ""}
                        onChange={(e) => handleChange("education", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Occupation / Profession</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.profession || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.profession || ""}
                        onChange={(e) => handleChange("profession", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Annual Income</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.annual_income || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.annual_income || ""}
                        onChange={(e) => handleChange("annual_income", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Work Location</div>
                  <div className="detail-value">{locationStr}</div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🛕</div>Religious & Community
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Religion</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.religion || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.religion || ""}
                        onChange={(e) => handleChange("religion", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Caste</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.caste || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.caste || ""}
                        onChange={(e) => handleChange("caste", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Mother Tongue</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.mother_tongue || "N/A"
                    ) : (
                      <input
                        type="text"
                        value={formData.mother_tongue || ""}
                        onChange={(e) => handleChange("mother_tongue", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".3s" }}
            >
              <div className="content-card-title !flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="ctitle-icon">🌿</div>Lifestyle
                </div>
                {profile?.public_verify ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    ⏳ Verification Pending
                  </span>
                )}
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Diet</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.diet || profile?.diet || "Strict Vegetarian"
                    ) : (
                      <input
                        type="text"
                        value={formData.diet || ""}
                        onChange={(e) => handleChange("diet", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Smoking</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.smoking || profile?.smoking || "Non-Smoker"
                    ) : (
                      <input
                        type="text"
                        value={formData.smoking || ""}
                        onChange={(e) => handleChange("smoking", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Drinking</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.drinking || profile?.drinking || "Non-Drinker"
                    ) : (
                      <input
                        type="text"
                        value={formData.drinking || ""}
                        onChange={(e) => handleChange("drinking", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Living With</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.living_with || profile?.living_with || "With Family"
                    ) : (
                      <input
                        type="text"
                        value={formData.living_with || ""}
                        onChange={(e) => handleChange("living_with", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Willing to Relocate</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.willing_to_relocate || profile?.willing_to_relocate || "Yes, TN preferred"
                    ) : (
                      <input
                        type="text"
                        value={formData.willing_to_relocate || ""}
                        onChange={(e) => handleChange("willing_to_relocate", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Interests</div>
                  <div className="detail-value">
                    {!isEditing ? (
                      profile?.lifeStyle?.interests || profile?.interests || "Yoga, Cooking, Trekking"
                    ) : (
                      <input
                        type="text"
                        value={formData.interests || ""}
                        onChange={(e) => handleChange("interests", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAMILY TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "family" ? "active" : ""}`}
          >
            {(() => {
              const fam = profile?.familyBackground || {};
              const fatherName = fam.father_name || profile?.father_name || "Dr. R. Krishnamurthy";
              const fatherOcc = fam.father_occupation || profile?.father_occupation || "Retired · IIT Madras Professor";
              const motherName = fam.mother_name || profile?.mother_name || "Smt. Meenakshi K.";
              const motherOcc = fam.mother_occupation || profile?.mother_occupation || "Homemaker";
              const siblings = fam.siblings || profile?.siblings || "1 Elder Brother";
              const siblingsDetails = fam.siblings_details || profile?.siblings_details || "Married · Software Engineer, Bengaluru";
              const famType = fam.family_type || profile?.family_type || "Nuclear Family";
              const famTypeDetails = fam.family_type_details || profile?.family_type_details || "Extended family in Mylapore";
              const famStatus = fam.family_status || profile?.family_status || "Upper Middle Class";
              const famStatusDetails = fam.family_status_details || fam.family_address || profile?.family_status_details || profile?.family_address || "Own house in Mylapore, Chennai";
              const famValues = fam.family_values || profile?.family_values || "Traditional";
              const famValuesDetails = fam.family_values_details || profile?.family_values_details || "Conservative with modern outlook";

              return (
                <div className="content-card reveal visible">
                  <div className="content-card-title">
                    <div className="ctitle-icon">🏠</div>Family Background
                  </div>
                  <div className="family-grid">
                    <div className="family-item">
                      <div className="family-item-icon">👨</div>
                      <div className="family-item-label">FATHER</div>
                      <div className="family-item-value">{fatherName}</div>
                      <div className="family-item-sub">{fatherOcc}</div>
                    </div>
                    <div className="family-item">
                      <div className="family-item-icon">👩</div>
                      <div className="family-item-label">MOTHER</div>
                      <div className="family-item-value">{motherName}</div>
                      <div className="family-item-sub">{motherOcc}</div>
                    </div>
                    <div className="family-item">
                      <div className="family-item-icon">👦</div>
                      <div className="family-item-label">SIBLINGS</div>
                      <div className="family-item-value">{siblings}</div>
                      <div className="family-item-sub">{siblingsDetails}</div>
                    </div>
                    <div className="family-item">
                      <div className="family-item-icon">🏡</div>
                      <div className="family-item-label">FAMILY TYPE</div>
                      <div className="family-item-value">{famType}</div>
                      <div className="family-item-sub">{famTypeDetails}</div>
                    </div>
                    <div className="family-item">
                      <div className="family-item-icon">💎</div>
                      <div className="family-item-label">FAMILY STATUS</div>
                      <div className="family-item-value">{famStatus}</div>
                      <div className="family-item-sub">{famStatusDetails}</div>
                    </div>
                    <div className="family-item">
                      <div className="family-item-icon">🙏</div>
                      <div className="family-item-label">FAMILY VALUES</div>
                      <div className="family-item-value">{famValues}</div>
                      <div className="family-item-sub">{famValuesDetails}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">📍</div>Location & Native
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Native Place</div>
                  <div className="detail-value">Kumbakonam, Thanjavur</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Current City</div>
                  <div className="detail-value">Chennai, Tamil Nadu</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Native (Tamil)</div>
                  <div
                    className="detail-value"
                    style={{ fontFamily: "var(--font-tamil)" }}
                  >
                    கும்பகோணம், தஞ்சாவூர்
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Grew Up In</div>
                  <div className="detail-value">Mylapore, Chennai</div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💌</div>About the Family
              </div>
              <p className="about-text">
                We are a close-knit Tamil Brahmin family from Kumbakonam, now
                settled in Mylapore, Chennai. My father was a professor at IIT
                Madras; my brother is an engineer in Bengaluru. We believe in
                education, simplicity, and respect — both for each other and for
                our traditions. The family actively participates in community
                and temple events.
              </p>
              <p className="about-text-tamil">
                எங்கள் குடும்பம் தஞ்சாவூர் மாவட்டத்தை சார்ந்தது. தற்போது சென்னை
                மயிலாப்பூரில் குடியிருக்கிறோம். கல்வி மற்றும் ஆன்மீகம் எங்கள்
                குடும்பத்தின் முக்கிய மதிப்புகள்.
              </p>
            </div>
          </div>

          {/* PARTNER PREFS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "partner" ? "active" : ""}`}
          >
            {(() => {
              const pref = profile?.partnerPreferencesDetails || {};
              const ageRange = pref.age_range || profile?.pref_age_range || "27 – 33 yrs";
              const ageFlex = pref.age_flexible || profile?.pref_age_flexible || "flexible";
              const height = pref.height || profile?.pref_height || "5'7\" and above";
              const marital = pref.marital_status || profile?.pref_marital_status || "Never Married preferred";
              const diet = pref.diet || profile?.pref_diet || "Vegetarian only";
              const smoking = pref.smoking || profile?.pref_smoking || "Non-Smoker";
              const drinking = pref.drinking || profile?.pref_drinking || "Non-Drinker preferred";
              const drinkingFlex = pref.drinking_flexible || profile?.pref_drinking_flexible || "flexible";
              const edu = pref.education || profile?.pref_education || "Graduate & above";
              const occ = pref.occupation || profile?.pref_occupation || "Any professional field";
              const income = pref.income || profile?.pref_income || "₹8L+ per year";
              const religion = pref.religion || profile?.pref_religion || "Hindu preferred";
              const caste = pref.caste || profile?.pref_caste || "Tamil Brahmin preferred";
              const casteOpen = pref.caste_open || profile?.pref_caste_open || "open";
              const location = pref.location || profile?.pref_location || "Tamil Nadu or willing to relocate";
              const livingSetup = pref.living_setup || profile?.pref_living_setup || "Open to joint or nuclear family";
              const values = pref.values || profile?.pref_values || "Family-oriented, respectful, grounded";
              const personality = pref.personality || profile?.pref_personality || "Honest, emotionally mature, ambitious";
              const overview = pref.overview || profile?.partnerPreferencesDetails?.overview || profile?.partner_preference || "Like we mentioned before, your values often inform your dating preferences – someone religious isn't likely to want to date an atheist, for instance";

              return (
                <>
                  <div className="content-card reveal visible">
                    <div className="content-card-title">
                      <div className="ctitle-icon">💖</div>Partner Preferences
                    </div>

                    <div className="pref-section-label">Basic Expectations</div>
                    <div className="pref-row">
                      <div className="pref-icon">🎂</div>
                      <div className="pref-label">Age Range</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          <>
                            <span className="pref-pill">{ageRange}</span>
                            {ageFlex && <span className="pref-flex">{ageFlex}</span>}
                          </>
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_age_range || ""}
                            onChange={(e) => handleChange("pref_age_range", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">📏</div>
                      <div className="pref-label">Height</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          <span className="pref-pill">{height}</span>
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_height || ""}
                            onChange={(e) => handleChange("pref_height", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">💒</div>
                      <div className="pref-label">Marital Status</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          marital
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_marital_status || ""}
                            onChange={(e) => handleChange("pref_marital_status", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">🍃</div>
                      <div className="pref-label">Diet</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          diet
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_diet || ""}
                            onChange={(e) => handleChange("pref_diet", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">🚬</div>
                      <div className="pref-label">Smoking</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          smoking
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_smoking || ""}
                            onChange={(e) => handleChange("pref_smoking", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">🍷</div>
                      <div className="pref-label">Drinking</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          <>
                            {drinking}{" "}
                            {drinkingFlex && <span className="pref-flex">{drinkingFlex}</span>}
                          </>
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_drinking || ""}
                            onChange={(e) => handleChange("pref_drinking", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="pref-section-label">Education & Career</div>
                    <div className="pref-row">
                      <div className="pref-icon">🎓</div>
                      <div className="pref-label">Education</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          edu
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_education || ""}
                            onChange={(e) => handleChange("pref_education", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">💼</div>
                      <div className="pref-label">Occupation</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          occ
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_occupation || ""}
                            onChange={(e) => handleChange("pref_occupation", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">💰</div>
                      <div className="pref-label">Income</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          <span className="pref-pill">{income}</span>
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_income || ""}
                            onChange={(e) => handleChange("pref_income", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="pref-section-label">Religion & Community</div>
                    <div className="pref-row">
                      <div className="pref-icon">🛕</div>
                      <div className="pref-label">Religion</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          religion
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_religion || ""}
                            onChange={(e) => handleChange("pref_religion", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">🌐</div>
                      <div className="pref-label">Caste</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          <>
                            {caste}{" "}
                            {casteOpen && <span className="pref-flex">{casteOpen}</span>}
                          </>
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_caste || ""}
                            onChange={(e) => handleChange("pref_caste", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">🌍</div>
                      <div className="pref-label">Location</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          location
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_location || ""}
                            onChange={(e) => handleChange("pref_location", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="pref-section-label">Personality & Lifestyle</div>
                    <div className="pref-row">
                      <div className="pref-icon">🏠</div>
                      <div className="pref-label">Living Setup</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          livingSetup
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_living_setup || ""}
                            onChange={(e) => handleChange("pref_living_setup", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">💡</div>
                      <div className="pref-label">Values</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          values
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_values || ""}
                            onChange={(e) => handleChange("pref_values", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="pref-row">
                      <div className="pref-icon">✨</div>
                      <div className="pref-label">Personality</div>
                      <div className="pref-value">
                        {!isEditing ? (
                          personality
                        ) : (
                          <input
                            type="text"
                            value={formData.pref_personality || ""}
                            onChange={(e) => handleChange("pref_personality", e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-medium bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="content-card reveal visible"
                    style={{ transitionDelay: ".1s" }}
                  >
                    <div className="content-card-title flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="ctitle-icon">💬</div>Partner Preferences Overview
                      </div>
                      {isCustomer && !isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-lg transition"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      )}
                    </div>
                    {!isEditing ? (
                      <p className="about-text">
                        "{overview}"
                      </p>
                    ) : (
                      <div className="mt-1">
                        <label className="block text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">
                          Edit Partner Preferences Description:
                        </label>
                        <textarea
                          rows={4}
                          value={formData.pref_overview !== undefined ? formData.pref_overview : overview}
                          onChange={(e) => {
                            handleChange("pref_overview", e.target.value);
                            handleChange("partner_preference", e.target.value);
                          }}
                          className="w-full p-3 text-sm bg-violet-50/70 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 leading-relaxed font-sans"
                          placeholder="Describe what qualities and expectations you have in a partner..."
                        />
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* PHOTOS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "photos" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="ctitle-icon">📷</div>Profile Photos
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Max 5 photos</span>
                  <button
                    onClick={handleSaveInlineProfile}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-95 transition flex items-center gap-1.5"
                  >
                    <span>Save Photo Changes</span>
                  </button>
                </div>
              </div>

              {/* Photo Upload Form */}
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <div className="photos-grid">
                {casualPhotos.map((url, idx) => (
                  <div key={idx} className="photo-slot relative group overflow-hidden border border-slate-200 shadow-sm rounded-xl">
                    <img
                      src={url}
                      alt={`Profile photo ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white text-white" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultPhoto(idx);
                        }}
                        className="absolute top-2 left-2 bg-black/60 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow opacity-90 hover:opacity-100 transition flex items-center gap-1"
                        title="Set as Default Profile Photo"
                      >
                        <Star className="h-3 w-3" /> Set Default
                      </button>
                    )}
                    <button
                      className="absolute bottom-2 right-2 bg-rose-600 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCasualPhotos((prev) =>
                          prev.filter((_, i) => i !== idx),
                        );
                        showToast("Photo removed. Click Save Photo Changes to apply.", "info");
                      }}
                      title="Delete Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button Slot - Up to 5 photos max */}
                {casualPhotos.length < 5 && (
                  <div
                    className="photo-slot photo-slot-add border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/50 hover:bg-violet-50 transition cursor-pointer"
                    onClick={triggerPhotoUpload}
                  >
                    <div className="photo-av text-violet-600">＋</div>
                    <div className="photo-label text-violet-700 font-semibold">Add Photo</div>
                  </div>
                )}
              </div>

              <div className="photos-note">
                <div className="photos-note-icon">💡</div>
                <p>
                  You can upload up to 5 profile photos. High quality photos get 3× more connection requests. Click <strong>Save Photo Changes</strong> after uploading.
                </p>
              </div>
            </div>
            <div className="content-card reveal visible">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center font-semibold">
                    <Users size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">
                    Family Photos
                  </h4>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Max 1 photo
                </span>
              </div>

              {/* Photo Upload Form */}
              <input
                type="file"
                ref={familyPhotoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFamilyPhotoChange}
              />

              <div className="flex flex-wrap gap-4">
                {/* Uploaded Family Photo */}
                {familyPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-44 h-60 rounded-2xl border-2 border-slate-200 overflow-hidden group bg-slate-50 shadow-sm">
                    <img
                      src={url}
                      alt={`Family photo ${idx + 1}`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-rose text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFamilyPhotos([]);
                        showToast("Family photo deleted", "info");
                      }}
                      title="Delete Family Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button Slot - Only allowed 1 photo */}
                {familyPhotos.length < 1 && (
                  <label
                    className="w-44 h-60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-500 flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 cursor-pointer transition-all bg-slate-50/50 hover:bg-violet-50/20 group"
                    onClick={triggerFamilyPhotoUpload}
                  >
                    <Plus
                      size={28}
                      className="mb-2 text-slate-400 group-hover:text-violet-600 transition-colors"
                    />
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">
                      Add Family Photo
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Video Intro Card */}
            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🎥</div>Video Introduction
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg,var(--plum-light),var(--rose-light))",
                  borderRadius: "var(--radius-sm)",
                  padding: "40px 24px",
                  textAlign: "center",
                  border: "2px dashed rgba(124,58,237,.2)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                  🎬
                </div>
                <div
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 600,
                    color: "var(--plum-dark)",
                    marginBottom: "6px",
                  }}
                >
                  Add a 60-second Video Introduction
                </div>
                <div
                  style={{
                    fontSize: ".78rem",
                    color: "var(--plum)",
                    marginBottom: "16px",
                  }}
                >
                  Profiles with a video get 5× more views
                </div>
                <button
                  className="btn-secondary"
                  style={{ display: "inline-flex", margin: "0 auto" }}
                  onClick={() =>
                    showToast("Video recorder interface loading...", "info")
                  }
                >
                  ▶ Record Now
                </button>
              </div>
            </div>
          </div>

          {/* HOROSCOPE TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "horoscope" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="ctitle-icon">⭐</div>Horoscope Details
                </div>
                {isCustomer && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-lg transition"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              <div className="horoscope-grid">
                <div className="horo-item">
                  <div className="horo-label">Star (Nakshatra)</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "star") || "-"}
                      </div>
                      {getStarTamil(getHoroVal(profile, formData, "star")) && (
                        <div className="horo-value-tamil">
                          {getStarTamil(getHoroVal(profile, formData, "star"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <select
                      value={formData.star !== undefined ? formData.star : (profile?.horoscopeDetails?.star || profile?.star || "")}
                      onChange={(e) => handleChange("star", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                    >
                      <option value="">Select Star (Nakshatra)</option>
                      {NAKSHATRAS.map((star) => (
                        <option key={star} value={star}>
                          {star}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Rasi (Moon Sign)</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "rasi") || "-"}
                      </div>
                      {getRasiTamil(getHoroVal(profile, formData, "rasi")) && (
                        <div className="horo-value-tamil">
                          {getRasiTamil(getHoroVal(profile, formData, "rasi"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <select
                      value={formData.rasi !== undefined ? formData.rasi : (profile?.horoscopeDetails?.rasi || profile?.rasi || "")}
                      onChange={(e) => handleChange("rasi", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                    >
                      <option value="">Select Rasi (Moon Sign)</option>
                      {RASIS.map((rasi) => (
                        <option key={rasi} value={rasi}>
                          {rasi}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Lagnam (Ascendant)</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "lagnam") || "-"}
                      </div>
                      {getRasiTamil(getHoroVal(profile, formData, "lagnam")) && (
                        <div className="horo-value-tamil">
                          {getRasiTamil(getHoroVal(profile, formData, "lagnam"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <select
                      value={formData.lagnam !== undefined ? formData.lagnam : (profile?.horoscopeDetails?.lagnam || profile?.lagnam || "")}
                      onChange={(e) => handleChange("lagnam", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                    >
                      <option value="">Select Lagnam (Ascendant)</option>
                      {LAGNAMS.map((lagnam) => (
                        <option key={lagnam} value={lagnam}>
                          {lagnam}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Gothram</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "gothram") || "-"}
                      </div>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.gothram !== undefined ? formData.gothram : (profile?.horoscopeDetails?.gothram || profile?.gothram || "")}
                      onChange={(e) => handleChange("gothram", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                      placeholder="Gothram"
                    />
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Date of Birth</div>
                  {!isEditing ? (
                    <div className="horo-value">
                      {getHoroVal(profile, formData, "dob") || "-"}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={formData.dob !== undefined ? formData.dob : (profile?.horoscopeDetails?.dob || profile?.dob || "")}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                    />
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Time of Birth</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "tob") || "-"}
                      </div>
                      {getTobTamil(getHoroVal(profile, formData, "tob")) && (
                        <div className="horo-value-tamil">
                          {getTobTamil(getHoroVal(profile, formData, "tob"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.tob !== undefined ? formData.tob : (profile?.horoscopeDetails?.tob || profile?.tob || "")}
                      onChange={(e) => handleChange("tob", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                      placeholder="e.g. 06:34 AM"
                    />
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Place of Birth</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value">
                        {getHoroVal(profile, formData, "pob") || "-"}
                      </div>
                      {getPobTamil(getHoroVal(profile, formData, "pob")) && (
                        <div className="horo-value-tamil">
                          {getPobTamil(getHoroVal(profile, formData, "pob"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.pob !== undefined ? formData.pob : (profile?.horoscopeDetails?.pob || profile?.pob || "")}
                      onChange={(e) => handleChange("pob", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                      placeholder="Place of Birth"
                    />
                  )}
                </div>
                <div className="horo-item">
                  <div className="horo-label">Dosham</div>
                  {!isEditing ? (
                    <>
                      <div className="horo-value" style={{ color: "var(--sage)" }}>
                        {getHoroVal(profile, formData, "dosham", "No Dosham") || "No Dosham"}
                      </div>
                      {getDoshamTamil(getHoroVal(profile, formData, "dosham")) && (
                        <div
                          className="horo-value-tamil"
                          style={{ color: "var(--sage)" }}
                        >
                          {getDoshamTamil(getHoroVal(profile, formData, "dosham"))}
                        </div>
                      )}
                    </>
                  ) : (
                    <select
                      value={formData.dosham !== undefined ? formData.dosham : (profile?.horoscopeDetails?.dosham || profile?.dosham || "")}
                      onChange={(e) => handleChange("dosham", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-violet-50/80 border border-violet-300 rounded-lg focus:outline-none mt-1 font-semibold"
                    >
                      <option value="">Select Dosham</option>
                      <option value="No Dosham">No Dosham</option>
                      <option value="Chevvai Dosham">Chevvai Dosham</option>
                      <option value="Rahu-Ketu Dosham">Rahu-Ketu Dosham</option>
                      <option value="Naga Dosham">Naga Dosham</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="horo-badge-wrap">
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--sage)" }}
                  ></div>
                  Manglik: {profile?.horoscopeDetails?.manglik || profile?.manglik || "No"}
                </div>
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--plum)" }}
                  ></div>
                  Chevvai Dosham: {profile?.horoscopeDetails?.chevvai_dosham || profile?.chevvai_dosham || "No"}
                </div>
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--rose)" }}
                  ></div>
                  Rahu-Ketu: {profile?.horoscopeDetails?.rahu_ketu_dosham || profile?.rahu_ketu_dosham || "Neutral"}
                </div>
              </div>
            </div>

            {/* JATHAGAM (BIRTH CHART) CARD */}
            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">📄</div>Jathagam (Birth Chart)
              </div>

              <input
                type="file"
                ref={horoInputRef}
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleHoroChange}
              />

              {(() => {
                const jathObj = profile?.horoscopeDetails?.jathagam || profile?.jathagam;
                const rawJathUrl = typeof jathObj === "string" ? jathObj : jathObj?.url;
                const jathagamUrl = rawJathUrl
                  ? rawJathUrl.startsWith("http") || rawJathUrl.startsWith("data:")
                    ? rawJathUrl
                    : `${configUrls?.apiUrl || "http://localhost:3000"}/${rawJathUrl.replace(/^\//, "")}`
                  : null;
                const isUploaded = horoscopeUploaded || !!jathagamUrl;

                if (!isUploaded) {
                  return (
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg,var(--saffron-light),var(--amber-light))",
                        borderRadius: "var(--radius-sm)",
                        padding: "32px 24px",
                        textAlign: "center",
                        border: "1px solid rgba(245,158,11,.2)",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                        📜
                      </div>
                      <div
                        style={{
                          fontSize: ".9rem",
                          fontWeight: 600,
                          color: "var(--amber)",
                          marginBottom: "6px",
                        }}
                      >
                        Jathagam / Birth Chart Not Uploaded
                      </div>
                      <p
                        style={{
                          fontSize: ".78rem",
                          color: "var(--ink-60)",
                          marginBottom: "18px",
                          maxWidth: "400px",
                          margin: "0 auto 18px",
                        }}
                      >
                        Add your horoscope chart to calculate detailed planetary
                        compatibility percentages with matching profiles.
                      </p>
                      <button
                        className="btn-secondary"
                        style={{
                          display: "inline-flex",
                          borderColor: "var(--amber)",
                          color: "var(--amber)",
                        }}
                        onClick={triggerHoroUpload}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload Jathagam (PDF /
                        Image)
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    className="p-6 rounded-2xl border border-emerald-100"
                    style={{
                      background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-full">
                          <Check className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            Birth Chart (Jathagam) Verified
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            File: {horoscopeFileName || (typeof jathObj === "object" ? jathObj?.name : null) || "jathagam_document.pdf"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {jathagamUrl ? (
                          <a
                            href={jathagamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-700 transition inline-flex items-center gap-1"
                          >
                            View / Download Chart
                          </a>
                        ) : (
                          <button
                            className="text-xs bg-white text-slate-700 font-medium px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                            onClick={triggerHoroUpload}
                          >
                            Change File
                          </button>
                        )}
                        <button
                          className="text-xs bg-rose-600 text-white font-medium p-2 rounded-xl hover:bg-rose-700 transition"
                          onClick={() => {
                            setHoroscopeUploaded(false);
                            setHoroscopeFileName("");
                            showToast("Horoscope chart deleted", "info");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* VOICE RECORDING MODAL */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
              Record Voice Note
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Introduce yourself, talk about your interests, and what values you
              look for in a partner.
            </p>

            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              {isRecording ? (
                <>
                  <div className="relative mb-4 flex items-center justify-center">
                    <span className="absolute h-10 w-10 animate-ping rounded-full bg-rose/20"></span>
                    <div className="relative h-12 w-12 rounded-full bg-rose flex items-center justify-center text-white">
                      <Mic className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-xl font-bold font-display text-slate-800 animate-pulse">
                    {formatTime(recordingSeconds)}
                  </span>
                  <span className="text-xs text-rose font-medium mt-1 uppercase tracking-widest">
                    Recording...
                  </span>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-4">
                    <Mic className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold font-display text-slate-400">
                    0:00
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1">
                    Ready to Record
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition"
                onClick={() => {
                  if (isRecording) {
                    if (recordingTimerRef.current)
                      clearInterval(recordingTimerRef.current);
                  }
                  setShowVoiceModal(false);
                }}
              >
                Cancel
              </button>
              {!isRecording ? (
                <button
                  className="flex-1 text-sm font-semibold text-white bg-rose hover:bg-rose-dark py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  onClick={startRecording}
                >
                  <Play className="h-4 w-4 fill-white" /> Start
                </button>
              ) : (
                <button
                  className="flex-1 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 fill-white" /> Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
