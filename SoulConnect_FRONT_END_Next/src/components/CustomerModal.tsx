import React, { useState, useEffect } from "react";
import { X, Upload, Users, Plus, Trash2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import configUrls from "../../configUrls";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  subscriptionList?: any[];
}

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

const defaultFormData = {
  customer_id: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "customer_g",
  dob: "",
  gender: "",
  phone_number: "",
  phone_code: "",
  district: "",
  taluk_town: "",
  state: "",
  zipcode: "",
  religion: "",
  caste: "",
  mother_tongue: "",
  maritial_status: "",
  education: "",
  profession: "",
  annual_income: "",
  height: "",
  about_self: "",
  partner_preference: "",
  ambition: "",
  health_report: "" as any,
  blood_group: "",
  additional_report_info: "",
  subscription_type: "",
  subscription_view_access: 10000,
  image: [] as any[],
  family_photos: [] as any[],
  video: "" as any,
  identity_proff: "" as any,
  horoscopeDetails: {
    star: "",
    rasi: "",
    lagnam: "",
    gothram: "",
    dob: "",
    tob: "",
    pob: "",
    dosham: "No Dosham",
    manglik: "No",
    chevvai_dosham: "No",
    rahu_ketu_dosham: "Neutral",
    jathagam: null as any,
  },
  familyBackground: {
    father_name: "",
    father_occupation: "",
    mother_name: "",
    mother_occupation: "",
    siblings: "",
    siblings_details: "",
    family_type: "",
    family_type_details: "",
    family_status: "",
    family_status_details: "",
    family_address: "",
    family_values: "",
    family_values_details: "",
    about_family: "",
    about_family_tamil: "",
  },
  lifeStyle: {
    diet: "",
    smoking: "",
    drinking: "",
    living_with: "",
    willing_to_relocate: "",
    interests: "",
  },
  partnerPreferencesDetails: {
    age_range: "",
    age_flexible: "",
    height: "",
    marital_status: "",
    diet: "",
    smoking: "",
    drinking: "",
    drinking_flexible: "",
    education: "",
    occupation: "",
    income: "",
    religion: "",
    caste: "",
    caste_open: "",
    location: "",
    living_setup: "",
    values: "",
    personality: "",
    overview: "",
  },
  transaction: [],
  public_verify: true,
  public_verify_command_helper: "",
};

const customerValidationSchema = Yup.object().shape({
  first_name: Yup.string().trim().required("First name is required"),
  last_name: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),
  phone_code: Yup.string().trim().required("Phone code is required"),
  phone_number: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(/^[0-9+\s-]{7,15}$/, "Invalid phone number format"),
  dob: Yup.string()
    .required("Date of birth is required")
    .test("is-valid-date", "Invalid Date of Birth", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime()) && date <= new Date();
    })
    .test("is-adult", "Customer must be at least 18 years old", (value) => {
      if (!value) return false;
      const dob = new Date(value);
      if (isNaN(dob.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  gender: Yup.string().required("Gender is required"),
  maritial_status: Yup.string().required("Marital status is required"),
  district: Yup.string().trim().required("District is required"),
  taluk_town: Yup.string().trim().required("Taluk/Town is required"),
  state: Yup.string().trim().required("State is required"),
  zipcode: Yup.string().trim().required("Zipcode is required"),
  religion: Yup.string().trim().required("Religion is required"),
  caste: Yup.string().trim().required("Caste is required"),
  mother_tongue: Yup.string().trim().required("Mother tongue is required"),
  education: Yup.string().trim().required("Education is required"),
  profession: Yup.string().trim().required("Profession is required"),
  annual_income: Yup.string().trim().required("Annual income is required"),
  height: Yup.string().trim().required("Height is required"),
  subscription_type: Yup.string().required("Subscription type is required"),
  about_self: Yup.string().trim().required("About self is required"),
  partner_preference: Yup.string()
    .trim()
    .required("Partner preference is required"),
  ambition: Yup.string().trim(),
  blood_group: Yup.string().trim(),
  additional_report_info: Yup.string().trim(),
  image: Yup.array()
    .of(Yup.object())
    .min(1, "At least 1 profile image is required")
    .max(5, "Maximum 5 profile images allowed"),
  family_photos: Yup.array()
    .of(Yup.object())
    .min(1, "Family photo is required")
    .max(1, "Maximum 1 family photo allowed")
    .required("Family photo is required"),
  public_verify_command_helper: Yup.string().trim(),
});

export default function CustomerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  subscriptionList,
}: CustomerModalProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>(
    subscriptionList || [],
  );

  useEffect(() => {
    if (subscriptionList && subscriptionList.length > 0) {
      setSubscriptions(subscriptionList);
    } else if (isOpen) {
      const baseUrl = configUrls?.apiUrl || "http://localhost:3000";
      fetch(`${baseUrl}/api/public/subscriptions`)
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setSubscriptions(list);
        })
        .catch((err) =>
          console.error("Error fetching subscription list:", err),
        );
    }
  }, [isOpen, subscriptionList]);

  const formik = useFormik({
    initialValues: initialData
      ? {
          ...defaultFormData,
          ...initialData,
          horoscopeDetails: {
            ...defaultFormData.horoscopeDetails,
            ...(initialData.horoscopeDetails || {}),
            star: initialData.horoscopeDetails?.star || initialData.star || "",
            rasi: initialData.horoscopeDetails?.rasi || initialData.rasi || "",
            lagnam: initialData.horoscopeDetails?.lagnam || initialData.lagnam || "",
            gothram: initialData.horoscopeDetails?.gothram || initialData.gothram || "",
            dob: initialData.horoscopeDetails?.dob || initialData.dob || "",
            tob: initialData.horoscopeDetails?.tob || initialData.tob || "",
            pob: initialData.horoscopeDetails?.pob || initialData.pob || "",
            dosham: initialData.horoscopeDetails?.dosham || initialData.dosham || "No Dosham",
            manglik: initialData.horoscopeDetails?.manglik || initialData.manglik || "No",
            chevvai_dosham: initialData.horoscopeDetails?.chevvai_dosham || initialData.chevvai_dosham || "No",
            rahu_ketu_dosham: initialData.horoscopeDetails?.rahu_ketu_dosham || initialData.rahu_ketu_dosham || "Neutral",
            jathagam: initialData.horoscopeDetails?.jathagam || initialData.jathagam || null,
          },
          familyBackground: {
            ...defaultFormData.familyBackground,
            ...(initialData.familyBackground || {}),
            father_name: initialData.familyBackground?.father_name || initialData.father_name || "",
            father_occupation: initialData.familyBackground?.father_occupation || initialData.father_occupation || "",
            mother_name: initialData.familyBackground?.mother_name || initialData.mother_name || "",
            mother_occupation: initialData.familyBackground?.mother_occupation || initialData.mother_occupation || "",
            siblings: initialData.familyBackground?.siblings || initialData.siblings || "",
            siblings_details: initialData.familyBackground?.siblings_details || initialData.siblings_details || "",
            family_type: initialData.familyBackground?.family_type || initialData.family_type || "",
            family_type_details: initialData.familyBackground?.family_type_details || initialData.family_type_details || "",
            family_status: initialData.familyBackground?.family_status || initialData.family_status || "",
            family_status_details: initialData.familyBackground?.family_status_details || initialData.family_status_details || "",
            family_address: initialData.familyBackground?.family_address || initialData.family_address || "",
            family_values: initialData.familyBackground?.family_values || initialData.family_values || "",
            family_values_details: initialData.familyBackground?.family_values_details || initialData.family_values_details || "",
            about_family: initialData.familyBackground?.about_family || initialData.about_family || "",
            about_family_tamil: initialData.familyBackground?.about_family_tamil || initialData.about_family_tamil || "",
          },
          lifeStyle: {
            ...defaultFormData.lifeStyle,
            ...(initialData.lifeStyle || {}),
            diet: initialData.lifeStyle?.diet || initialData.diet || "",
            smoking: initialData.lifeStyle?.smoking || initialData.smoking || "",
            drinking: initialData.lifeStyle?.drinking || initialData.drinking || "",
            living_with: initialData.lifeStyle?.living_with || initialData.living_with || "",
            willing_to_relocate: initialData.lifeStyle?.willing_to_relocate || initialData.willing_to_relocate || "",
            interests: initialData.lifeStyle?.interests || initialData.interests || "",
          },
          partnerPreferencesDetails: {
            ...defaultFormData.partnerPreferencesDetails,
            ...(initialData.partnerPreferencesDetails || {}),
            overview: initialData.partnerPreferencesDetails?.overview || initialData.partner_preference || "",
          },
          role: initialData.role || "customer_g",
        }
      : defaultFormData,
    enableReinitialize: true,
    validationSchema: customerValidationSchema,
    onSubmit: (values) => {
      onSave({
        ...values,
        role: values.role || "customer_g",
      });
    },
  });

  if (!isOpen) return null;

  const getInputClassName = (fieldName: keyof typeof defaultFormData) => {
    const isInvalid =
      formik.touched[fieldName] && Boolean(formik.errors[fieldName]);
    return `w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white ${
      isInvalid
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-violet-500"
    }`;
  };

  const renderFieldError = (fieldName: keyof typeof defaultFormData) => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1">
          {formik.errors[fieldName] as string}
        </p>
      );
    }
    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentImages = Array.isArray(formik.values.image)
        ? formik.values.image
        : [];
      const validImages = currentImages.filter((img: any) => img.url);
      if (validImages.length >= 5) {
        alert("Maximum 5 images allowed.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload valid image files (JPEG, PNG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const isFirst = validImages.length === 0;
        const newImages = [
          ...validImages,
          { url: base64String, default: isFirst },
        ];
        formik.setFieldValue("image", newImages);
        formik.setFieldTouched("image", true, true);
      };
      reader.readAsDataURL(file);
    }
  };

  const setAsDefaultImage = (index: number) => {
    const currentImages = Array.isArray(formik.values.image)
      ? formik.values.image
      : [];
    const validImages = currentImages.filter((img: any) => img.url);
    const newImages = validImages.map((img: any, i: number) => ({
      ...img,
      default: i === index,
    }));
    formik.setFieldValue("image", newImages);
    formik.setFieldTouched("image", true, true);
  };

  const removeImage = (index: number) => {
    const currentImages = Array.isArray(formik.values.image)
      ? formik.values.image
      : [];
    const validImages = currentImages.filter((img: any) => img.url);
    const newImages = [...validImages];
    const removed = newImages.splice(index, 1)[0];

    if (removed?.default && newImages.length > 0) {
      newImages[0].default = true;
    }

    formik.setFieldValue("image", newImages);
    formik.setFieldTouched("image", true, true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isMp4 =
        file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
      if (!isMp4) {
        alert("Please upload only MP4 video files.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("video", { url: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    formik.setFieldValue("video", "");
  };

  const handleIdentityProofUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".pdf") ||
        /\.(jpg|jpeg|png|gif)$/i.test(file.name);

      if (!isAllowed) {
        alert("Please upload only Image or PDF files.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("identity_proff", {
          url: base64String,
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIdentityProof = () => {
    formik.setFieldValue("identity_proff", "");
  };

  const handleHealthReportUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".pdf") ||
        /\.(jpg|jpeg|png|gif)$/i.test(file.name);

      if (!isAllowed) {
        alert("Please upload only Image or PDF files.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("health_report", {
          url: base64String,
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeHealthReport = () => {
    formik.setFieldValue("health_report", "");
  };

  const handleJathagamUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".pdf") ||
        /\.(jpg|jpeg|png|gif)$/i.test(file.name);

      if (!isAllowed) {
        alert("Please upload only Image or PDF files.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("horoscopeDetails.jathagam", {
          url: base64String,
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeJathagam = () => {
    formik.setFieldValue("horoscopeDetails.jathagam", null);
  };

  const handleFamilyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (JPEG, PNG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("family_photos", [{ url: base64String }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFamilyPhoto = () => {
    formik.setFieldValue("family_photos", []);
  };

  const images = Array.isArray(formik.values.image) ? formik.values.image : [];
  const validImages = images.filter((img: any) => img.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] xl:max-w-[92vw] 2xl:max-w-[85vw] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Customer" : "Create Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            id="customer-form"
            onSubmit={formik.handleSubmit}
            className="space-y-6"
          >
            {/* Image Upload */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Profile Images (Max 5, Click star to set default){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {validImages.map((img: any, index: number) => (
                  <div
                    key={index}
                    className={`relative w-28 h-28 rounded-xl border-4 overflow-hidden group bg-gray-100 ${
                      img.default ? "border-amber-400" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setAsDefaultImage(index)}
                        className={`text-xs px-2 py-1 rounded text-white font-medium transition-colors ${
                          img.default
                            ? "bg-amber-500"
                            : "bg-gray-700 hover:bg-amber-500"
                        }`}
                      >
                        {img.default ? "★ Default" : "Set Default"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {validImages.length < 5 && (
                  <label className="w-28 h-28 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload size={24} className="mb-1" />
                    <span className="text-xs font-medium">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              {renderFieldError("image")}
            </div>

            {/* Family Photos Upload Card */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center font-semibold">
                    <Users size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">
                    Family Photos <span className="text-red-500">*</span>
                  </h4>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Max 1 photo
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {(() => {
                  const fpList = Array.isArray(formik.values.family_photos)
                    ? formik.values.family_photos
                    : (formik.values as any).family_photo
                    ? [(formik.values as any).family_photo]
                    : [];
                  const validFP = fpList.filter((img: any) =>
                    typeof img === "string" ? img : img?.url,
                  );
                  const firstFP = validFP[0];
                  const fpUrl =
                    typeof firstFP === "string" ? firstFP : firstFP?.url;

                  if (fpUrl) {
                    return (
                      <div className="relative w-44 h-60 rounded-2xl border-2 border-slate-200 overflow-hidden group bg-slate-50 shadow-sm">
                        <img
                          src={fpUrl}
                          alt="Family Photo"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={removeFamilyPhoto}
                            className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-semibold shadow transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Remove Photo
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <label className="w-44 h-60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-500 flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 cursor-pointer transition-all bg-slate-50/50 hover:bg-violet-50/20 group">
                      <Plus
                        size={28}
                        className="mb-2 text-slate-400 group-hover:text-violet-600 transition-colors"
                      />
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">
                        Add Family Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFamilyPhotoUpload}
                      />
                    </label>
                  );
                })()}
              </div>
              {renderFieldError("family_photos" as any)}
            </div>

            {/* Video Upload */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Profile Video (Max 1 MP4)
              </label>
              <div className="flex flex-wrap gap-4">
                {formik.values.video &&
                (typeof formik.values.video === "string"
                  ? formik.values.video
                  : formik.values.video.url) ? (
                  <div className="relative w-64 h-40 rounded-xl border-4 border-violet-500 overflow-hidden group bg-black">
                    <video
                      src={
                        typeof formik.values.video === "string"
                          ? formik.values.video
                          : formik.values.video.url
                      }
                      className="w-full h-full object-contain"
                      controls
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-64 h-40 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload size={28} className="mb-2" />
                    <span className="text-sm font-medium">
                      Upload MP4 Video
                    </span>
                    <input
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Identity Proof Upload */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Identity Proof (Image or PDF)
              </label>
              <div className="flex flex-wrap gap-4">
                {formik.values.identity_proff &&
                (typeof formik.values.identity_proff === "string"
                  ? formik.values.identity_proff
                  : formik.values.identity_proff.url) ? (
                  (() => {
                    const proof = formik.values.identity_proff;
                    const url = typeof proof === "string" ? proof : proof.url;
                    const name =
                      typeof proof === "string"
                        ? "Identity Proof"
                        : proof.name || "Identity Proof";
                    const isPdf =
                      url?.includes("application/pdf") ||
                      url?.endsWith(".pdf") ||
                      proof.type === "application/pdf";

                    return (
                      <div className="relative w-48 h-32 rounded-xl border-4 border-violet-500 overflow-hidden group bg-gray-100 flex flex-col items-center justify-center p-2">
                        {isPdf ? (
                          <div className="flex flex-col items-center text-gray-600">
                            <span className="text-3xl mb-1">📄</span>
                            <span className="text-xs font-semibold text-center truncate max-w-full">
                              {name}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt="Identity Proof"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                          {url.startsWith("http") && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs bg-violet-600 text-white px-2 py-1 rounded hover:bg-violet-700 transition-colors text-center"
                            >
                              View Document
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={removeIdentityProof}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <label className="w-48 h-32 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-medium">
                      Add Image or PDF
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleIdentityProofUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Ambition */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Ambition
              </label>
              <textarea
                name="ambition"
                rows={3}
                value={formik.values.ambition}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={getInputClassName("ambition")}
                placeholder="Enter ambition (Optional)"
              />
              {renderFieldError("ambition")}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
              {/* Basic Details */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("first_name")}
                />
                {renderFieldError("first_name")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("last_name")}
                />
                {renderFieldError("last_name")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("email")}
                />
                {renderFieldError("email")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_code"
                  value={formik.values.phone_code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="+91"
                  className={getInputClassName("phone_code")}
                />
                {renderFieldError("phone_code")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("phone_number")}
                />
                {renderFieldError("phone_number")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  max={new Date().toISOString().split("T")[0]}
                  value={
                    formik.values.dob &&
                    /^\d{2}-\d{2}-\d{4}$/.test(formik.values.dob)
                      ? `${formik.values.dob.split("-")[2]}-${formik.values.dob.split("-")[1]}-${formik.values.dob.split("-")[0]}`
                      : formik.values.dob || ""
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("dob")}
                />
                {renderFieldError("dob")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={
                    formik.values.gender
                      ? ["Male", "Female", "Other"].find(
                          (g) =>
                            g.toLowerCase() ===
                            formik.values.gender.toLowerCase(),
                        ) || formik.values.gender
                      : ""
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("gender")}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  {formik.values.gender &&
                    !["Male", "Female", "Other"].some(
                      (g) =>
                        g.toLowerCase() === formik.values.gender.toLowerCase(),
                    ) && (
                      <option value={formik.values.gender}>
                        {formik.values.gender}
                      </option>
                    )}
                </select>
                {renderFieldError("gender")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritial_status"
                  value={
                    [
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Separated",
                      "Engaged",
                      "In a Domestic Partnership",
                      "Civil Union",
                      "Prefer Not to Say",
                    ].find(
                      (opt) =>
                        opt.toLowerCase() ===
                        formik.values.maritial_status?.toLowerCase(),
                    ) ||
                    formik.values.maritial_status ||
                    ""
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("maritial_status")}
                >
                  <option value="">Select Marital Status</option>
                  {[
                    "Single",
                    "Married",
                    "Divorced",
                    "Widowed",
                    "Separated",
                    "Engaged",
                    "In a Domestic Partnership",
                    "Civil Union",
                    "Prefer Not to Say",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                  {formik.values.maritial_status &&
                    ![
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Separated",
                      "Engaged",
                      "In a Domestic Partnership",
                      "Civil Union",
                      "Prefer Not to Say",
                    ].some(
                      (opt) =>
                        opt.toLowerCase() ===
                        formik.values.maritial_status?.toLowerCase(),
                    ) && (
                      <option value={formik.values.maritial_status}>
                        {formik.values.maritial_status}
                      </option>
                    )}
                </select>
                {renderFieldError("maritial_status")}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("district")}
                />
                {renderFieldError("district")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Taluk/Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taluk_town"
                  value={formik.values.taluk_town}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("taluk_town")}
                />
                {renderFieldError("taluk_town")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("state")}
                />
                {renderFieldError("state")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Zipcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipcode"
                  value={formik.values.zipcode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("zipcode")}
                />
                {renderFieldError("zipcode")}
              </div>

              {/* Personal Details */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Religion <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="religion"
                  value={formik.values.religion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("religion")}
                />
                {renderFieldError("religion")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Caste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="caste"
                  value={formik.values.caste}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("caste")}
                />
                {renderFieldError("caste")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Mother Tongue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mother_tongue"
                  value={formik.values.mother_tongue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("mother_tongue")}
                />
                {renderFieldError("mother_tongue")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="education"
                  value={formik.values.education}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("education")}
                />
                {renderFieldError("education")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Profession <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formik.values.profession}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("profession")}
                />
                {renderFieldError("profession")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Annual Income <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="annual_income"
                  value={formik.values.annual_income}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("annual_income")}
                />
                {renderFieldError("annual_income")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Height <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="height"
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("height")}
                />
                {renderFieldError("height")}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Subscription Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="subscription_type"
                  value={formik.values.subscription_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("subscription_type")}
                >
                  <option value="">Select Subscription Type</option>
                  {subscriptions.map((sub: any, index: number) => {
                    const subName = sub.name || sub.type || "";
                    return (
                      <option
                        key={sub._id?.toString?.() || sub._id || index}
                        value={subName}
                      >
                        {subName}
                      </option>
                    );
                  })}
                  {!subscriptions.some(
                    (s: any) => (s.name || s.type) === "guest",
                  ) && <option value="guest">guest</option>}
                  {formik.values.subscription_type &&
                    formik.values.subscription_type !== "guest" &&
                    !subscriptions.some(
                      (s: any) =>
                        (s.name || s.type) === formik.values.subscription_type,
                    ) && (
                      <option value={formik.values.subscription_type}>
                        {formik.values.subscription_type}
                      </option>
                    )}
                </select>
                {renderFieldError("subscription_type")}
              </div>

              <div className="space-y-1 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <label className="text-sm font-medium text-gray-700">
                  About Self <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="about_self"
                  rows={3}
                  value={formik.values.about_self}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("about_self")}
                />
                {renderFieldError("about_self")}
              </div>

              <div className="space-y-1 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <label className="text-sm font-medium text-gray-700">
                  Partner Preference <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="partner_preference"
                  rows={3}
                  value={formik.values.partner_preference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("partner_preference")}
                />
                {renderFieldError("partner_preference")}
              </div>

              {/* Health Report Section */}
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5 border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Health Report</h3>
                <div className="space-y-6">
                  {/* Blood Group Dropdown */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Blood Group</label>
                    <select
                      name="blood_group"
                      value={formik.values.blood_group}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputClassName("blood_group")}
                    >
                      <option value="">Select Blood Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                    {renderFieldError("blood_group")}
                  </div>

                  {/* Health Report File Upload */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Health Report (Image or PDF)
                    </label>
                    <div className="flex items-center gap-4">
                      {formik.values.health_report &&
                      (typeof formik.values.health_report === "string"
                        ? formik.values.health_report
                        : formik.values.health_report.url) ? (
                        (() => {
                          const report = formik.values.health_report;
                          const url = typeof report === "string" ? report : report.url;
                          const name =
                            typeof report === "string"
                              ? "Health Report"
                              : report.name || "Health Report";
                          const isPdf =
                            url?.includes("application/pdf") ||
                            url?.endsWith(".pdf") ||
                            report.type === "application/pdf";

                          return (
                            <div className="relative w-48 h-24 rounded-lg border-2 border-violet-500 overflow-hidden group bg-gray-50 flex flex-col items-center justify-center p-2">
                              {isPdf ? (
                                <div className="flex flex-col items-center text-gray-600">
                                  <span className="text-xl mb-1">📄</span>
                                  <span className="text-[10px] font-semibold text-center truncate max-w-full">
                                    {name}
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={url}
                                  alt="Health Report"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1 transition-opacity">
                                {url.startsWith("http") && (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded hover:bg-violet-700 transition-colors"
                                  >
                                    View
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={removeHealthReport}
                                  className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <label className="w-48 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                          <Upload size={18} className="mb-1 animate-pulse" />
                          <span className="text-[10px] font-medium">Add Health Report (Image/PDF)</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleHealthReportUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Additional Report Information Textarea */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Additional Report Information</label>
                    <textarea
                      name="additional_report_info"
                      rows={3}
                      value={formik.values.additional_report_info}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={getInputClassName("additional_report_info")}
                      placeholder="Enter any additional details about the health report (Optional)"
                    />
                    {renderFieldError("additional_report_info")}
                  </div>
                </div>
              </div>

              {/* Horoscope & Birth Chart Details Section */}
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5 border-t pt-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center font-semibold text-lg">
                    ⭐
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Horoscope & Birth Chart Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Star / Nakshatra */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Star (Nakshatra)</label>
                    <select
                      name="horoscopeDetails.star"
                      value={formik.values.horoscopeDetails?.star || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="">Select Star (Nakshatra)</option>
                      {NAKSHATRAS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rasi / Moon Sign */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Rasi (Moon Sign)</label>
                    <select
                      name="horoscopeDetails.rasi"
                      value={formik.values.horoscopeDetails?.rasi || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="">Select Rasi (Moon Sign)</option>
                      {RASIS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lagnam / Ascendant */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Lagnam (Ascendant)</label>
                    <select
                      name="horoscopeDetails.lagnam"
                      value={formik.values.horoscopeDetails?.lagnam || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="">Select Lagnam (Ascendant)</option>
                      {LAGNAMS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gothram */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Gothram</label>
                    <input
                      type="text"
                      name="horoscopeDetails.gothram"
                      value={formik.values.horoscopeDetails?.gothram || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                      placeholder="e.g. Vatsa Gothram"
                    />
                  </div>

                  {/* Time of Birth */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Time of Birth</label>
                    <input
                      type="text"
                      name="horoscopeDetails.tob"
                      value={formik.values.horoscopeDetails?.tob || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                      placeholder="e.g. 06:34 AM"
                    />
                  </div>

                  {/* Place of Birth */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Place of Birth</label>
                    <input
                      type="text"
                      name="horoscopeDetails.pob"
                      value={formik.values.horoscopeDetails?.pob || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                      placeholder="e.g. Kumbakonam"
                    />
                  </div>

                  {/* Dosham */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Dosham</label>
                    <select
                      name="horoscopeDetails.dosham"
                      value={formik.values.horoscopeDetails?.dosham || "No Dosham"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="No Dosham">No Dosham</option>
                      <option value="Chevvai Dosham">Chevvai Dosham</option>
                      <option value="Rahu-Ketu Dosham">Rahu-Ketu Dosham</option>
                      <option value="Naga Dosham">Naga Dosham</option>
                    </select>
                  </div>

                  {/* Manglik Status */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Manglik Status</label>
                    <select
                      name="horoscopeDetails.manglik"
                      value={formik.values.horoscopeDetails?.manglik || "No"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>

                  {/* Chevvai Dosham Status */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Chevvai Dosham Status</label>
                    <select
                      name="horoscopeDetails.chevvai_dosham"
                      value={formik.values.horoscopeDetails?.chevvai_dosham || "No"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Rahu-Ketu Status */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Rahu-Ketu Status</label>
                    <select
                      name="horoscopeDetails.rahu_ketu_dosham"
                      value={formik.values.horoscopeDetails?.rahu_ketu_dosham || "Neutral"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border rounded-sm outline-none transition-colors bg-gray-50 focus:bg-white border-gray-300 focus:border-violet-500 text-sm"
                    >
                      <option value="Neutral">Neutral</option>
                      <option value="Dosham Present">Dosham Present</option>
                      <option value="No Dosham">No Dosham</option>
                    </select>
                  </div>
                </div>

                {/* Jathagam / Birth Chart File Upload */}
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Jathagam / Birth Chart (PDF or Image)
                  </label>
                  <div className="flex items-center gap-4">
                    {formik.values.horoscopeDetails?.jathagam &&
                    (typeof formik.values.horoscopeDetails.jathagam === "string"
                      ? formik.values.horoscopeDetails.jathagam
                      : formik.values.horoscopeDetails.jathagam.url) ? (
                      (() => {
                        const jathagam = formik.values.horoscopeDetails.jathagam;
                        const url = typeof jathagam === "string" ? jathagam : jathagam.url;
                        const name =
                          typeof jathagam === "string"
                            ? "Jathagam Document"
                            : jathagam.name || "Jathagam Document";
                        const isPdf =
                          url?.includes("application/pdf") ||
                          url?.endsWith(".pdf") ||
                          jathagam.type === "application/pdf";

                        return (
                          <div className="relative w-48 h-24 rounded-lg border-2 border-amber-500 overflow-hidden group bg-amber-50/50 flex flex-col items-center justify-center p-2">
                            {isPdf ? (
                              <div className="flex flex-col items-center text-amber-900">
                                <span className="text-xl mb-1">📜</span>
                                <span className="text-[10px] font-semibold text-center truncate max-w-full">
                                  {name}
                                </span>
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt="Jathagam"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1 transition-opacity">
                              {url.startsWith("http") && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded hover:bg-amber-700 transition-colors"
                                >
                                  View
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={removeJathagam}
                                className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <label className="w-48 h-24 rounded-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-amber-600 hover:text-amber-700 hover:border-amber-500 cursor-pointer transition-colors bg-amber-50/40">
                        <Upload size={18} className="mb-1 animate-pulse" />
                        <span className="text-[10px] font-medium">Add Jathagam (PDF/Image)</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleJathagamUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 🏠 Family Background Details Section */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xl">🏠</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Family Background Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Father, Mother, Siblings, Family Status, Values & Address details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Father Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Father Name
                    </label>
                    <input
                      type="text"
                      name="familyBackground.father_name"
                      value={formik.values.familyBackground?.father_name || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Dr. R. Krishnamurthy"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Father Occupation */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Father Occupation / Details
                    </label>
                    <input
                      type="text"
                      name="familyBackground.father_occupation"
                      value={formik.values.familyBackground?.father_occupation || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Retired Professor"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Mother Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mother Name
                    </label>
                    <input
                      type="text"
                      name="familyBackground.mother_name"
                      value={formik.values.familyBackground?.mother_name || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Smt. Meenakshi K."
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Mother Occupation */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mother Occupation / Details
                    </label>
                    <input
                      type="text"
                      name="familyBackground.mother_occupation"
                      value={formik.values.familyBackground?.mother_occupation || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Homemaker"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Siblings */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Siblings Summary
                    </label>
                    <input
                      type="text"
                      name="familyBackground.siblings"
                      value={formik.values.familyBackground?.siblings || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 1 Elder Brother"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Siblings Details */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Siblings Occupation & Location
                    </label>
                    <input
                      type="text"
                      name="familyBackground.siblings_details"
                      value={formik.values.familyBackground?.siblings_details || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Married · Software Engineer"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Family Type
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_type"
                      value={formik.values.familyBackground?.family_type || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Nuclear Family"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Type Details */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Family Type Info
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_type_details"
                      value={formik.values.familyBackground?.family_type_details || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Extended family in Mylapore"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Family Status
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_status"
                      value={formik.values.familyBackground?.family_status || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Upper Middle Class"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Status Details */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Status Details / Property
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_status_details"
                      value={formik.values.familyBackground?.family_status_details || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Own house in Mylapore, Chennai"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Family Address / Location
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_address"
                      value={formik.values.familyBackground?.family_address || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Mylapore, Chennai, Tamil Nadu"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Values */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Family Values
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_values"
                      value={formik.values.familyBackground?.family_values || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Traditional"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Family Values Details */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Values Info
                    </label>
                    <input
                      type="text"
                      name="familyBackground.family_values_details"
                      value={formik.values.familyBackground?.family_values_details || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Conservative with modern outlook"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* About Family */}
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      About Family Description
                    </label>
                    <textarea
                      name="familyBackground.about_family"
                      rows={2}
                      value={formik.values.familyBackground?.about_family || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Write brief description about the family..."
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lifestyle Details */}
              <div className="mt-8 pt-6 border-t border-gray-100 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🌿</span> Lifestyle Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Diet */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Diet
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.diet"
                      value={formik.values.lifeStyle?.diet || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Strict Vegetarian / Non-Vegetarian"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Smoking */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Smoking
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.smoking"
                      value={formik.values.lifeStyle?.smoking || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Non-Smoker / Occasional"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Drinking */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Drinking
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.drinking"
                      value={formik.values.lifeStyle?.drinking || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Non-Drinker / Social Drinker"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Living With */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Living With
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.living_with"
                      value={formik.values.lifeStyle?.living_with || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. With Family / Alone"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Willing to Relocate */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Willing to Relocate
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.willing_to_relocate"
                      value={formik.values.lifeStyle?.willing_to_relocate || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Yes, TN preferred"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Interests & Hobbies
                    </label>
                    <input
                      type="text"
                      name="lifeStyle.interests"
                      value={formik.values.lifeStyle?.interests || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Yoga, Cooking, Trekking"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Preferences Details */}
              <div className="mt-8 pt-6 border-t border-gray-100 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">💖</span> Partner Preferences Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Age Range */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Age Range
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.age_range"
                      value={formik.values.partnerPreferencesDetails?.age_range || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 27 – 33 yrs"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Height Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.height"
                      value={formik.values.partnerPreferencesDetails?.height || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 5'7&quot; and above"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Marital Status Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.marital_status"
                      value={formik.values.partnerPreferencesDetails?.marital_status || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Never Married preferred"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Diet Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Diet Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.diet"
                      value={formik.values.partnerPreferencesDetails?.diet || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Vegetarian only"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Education Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Education Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.education"
                      value={formik.values.partnerPreferencesDetails?.education || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Graduate & above"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Occupation Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Occupation Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.occupation"
                      value={formik.values.partnerPreferencesDetails?.occupation || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Any professional field"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Income Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Income Expectation
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.income"
                      value={formik.values.partnerPreferencesDetails?.income || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. ₹8L+ per year"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Religion Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Religion Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.religion"
                      value={formik.values.partnerPreferencesDetails?.religion || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Hindu preferred"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Caste Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Caste Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.caste"
                      value={formik.values.partnerPreferencesDetails?.caste || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Tamil Brahmin preferred"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Location Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Location Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.location"
                      value={formik.values.partnerPreferencesDetails?.location || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Tamil Nadu or willing to relocate"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Living Setup */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Living Setup Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.living_setup"
                      value={formik.values.partnerPreferencesDetails?.living_setup || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Open to joint or nuclear family"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Values & Personality */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Values Preference
                    </label>
                    <input
                      type="text"
                      name="partnerPreferencesDetails.values"
                      value={formik.values.partnerPreferencesDetails?.values || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Family-oriented, respectful"
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Overview */}
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Partner Preferences Overview / Summary
                    </label>
                    <textarea
                      name="partnerPreferencesDetails.overview"
                      rows={2}
                      value={formik.values.partnerPreferencesDetails?.overview || ""}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue("partner_preference", e.target.value);
                      }}
                      onBlur={formik.handleBlur}
                      placeholder="Describe what qualities and expectations you have in a partner..."
                      className="w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Booleans/Misc */}
              <div className="space-y-4 flex flex-col mt-6 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="public_verify"
                    checked={formik.values.public_verify}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-5 h-5 accent-violet-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Publicly Verified
                  </span>
                </label>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Publicly Verified Command Helper
                  </label>
                  <textarea
                    name="public_verify_command_helper"
                    rows={3}
                    value={formik.values.public_verify_command_helper}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("public_verify_command_helper")}
                    placeholder="Enter command helper instructions for verification (Optional)"
                  />
                  {renderFieldError("public_verify_command_helper")}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            form="customer-form"
            type="submit"
            className="px-6 py-2 bg-violet-600 rounded-sm text-white font-medium hover:bg-violet-700 transition-colors"
          >
            {initialData ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
