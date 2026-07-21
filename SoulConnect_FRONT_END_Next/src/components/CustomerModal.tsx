import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
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
  subscription_type: "",
  subscription_view_access: 10000,
  image: [] as any[],
  video: "" as any,
  identity_proff: "" as any,
  transaction: [],
  public_verify: false,
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
  dob: Yup.string().required("Date of birth is required"),
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
  partner_preference: Yup.string().trim().required("Partner preference is required"),
  image: Yup.array()
    .of(Yup.object())
    .min(1, "At least 1 profile image is required")
    .max(5, "Maximum 5 profile images allowed"),
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
        .catch((err) => console.error("Error fetching subscription list:", err));
    }
  }, [isOpen, subscriptionList]);

  const formik = useFormik({
    initialValues: initialData
      ? {
          ...defaultFormData,
          ...initialData,
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

  const images = Array.isArray(formik.values.image) ? formik.values.image : [];
  const validImages = images.filter((img: any) => img.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                Profile Images (Max 5, Click star to set default) <span className="text-red-500">*</span>
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
                    <span className="text-sm font-medium">Upload MP4 Video</span>
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
                    const name = typeof proof === "string" ? "Identity Proof" : proof.name || "Identity Proof";
                    const isPdf = url?.includes("application/pdf") || url?.endsWith(".pdf") || proof.type === "application/pdf";

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <input
                  type="text"
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
                      <option key={sub._id?.toString?.() || sub._id || index} value={subName}>
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

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">
                  About Self <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="about_self"
                  rows={3}
                  value={formik.values.about_self}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("about_self")}
                />
                {renderFieldError("about_self")}
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">
                  Partner Preference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="partner_preference"
                  rows={3}
                  value={formik.values.partner_preference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("partner_preference")}
                />
                {renderFieldError("partner_preference")}
              </div>

              {/* Booleans/Misc */}
              <div className="space-y-1 flex flex-col justify-center mt-6">
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
