"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, User, Trash2, Camera, Shield, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  subscriptionList?: any[];
}

export const ROLE_OPTIONS = [
  { displayName: "Manager", id: "manager_g" },
  { displayName: "Assit", id: "assit_g" },
];

const defaultUserFormData = {
  customer_id: "",
  role: "manager_g",
  first_name: "",
  last_name: "",
  email: "",
  phone_code: "+91",
  phone_number: "",
  gender: "male",
  dob: "",
  status: "Active",
  district: "",
  state: "",
  zipcode: "",
  image: [] as any[],
};

const userValidationSchema = Yup.object().shape({
  role: Yup.string().required("Role is required"),
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
  gender: Yup.string().required("Gender is required"),
  dob: Yup.string().nullable(),
  status: Yup.string().nullable(),
  district: Yup.string().trim().nullable(),
  state: Yup.string().trim().nullable(),
  zipcode: Yup.string().trim().nullable(),
});

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: UserModalProps) {
  const isEdit = Boolean(initialData);

  const getInitialValues = () => {
    if (!initialData) return defaultUserFormData;

    let initialImages: any[] = [];
    if (Array.isArray(initialData.image)) {
      initialImages = initialData.image;
    } else if (typeof initialData.image === "string" && initialData.image) {
      initialImages = [{ url: initialData.image, default: true }];
    }

    return {
      customer_id: initialData.customer_id || "",
      role: initialData.role || "manager_g",
      first_name: initialData.first_name || initialData.firstName || "",
      last_name: initialData.last_name || initialData.lastName || "",
      email: initialData.email || "",
      phone_code: initialData.phone_code || "+91",
      phone_number: initialData.phone_number || "",
      gender: (initialData.gender || "male").toLowerCase(),
      dob: initialData.dob || "",
      status: initialData.status || (initialData.public_verify === false ? "Inactive" : "Active"),
      district: initialData.district || "",
      state: initialData.state || "",
      zipcode: initialData.zipcode || "",
      image: initialImages,
    };
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      const payload = {
        ...values,
        _id: initialData?._id,
        id: initialData?._id || initialData?.id,
        customer_id: initialData?.customer_id || values.customer_id,
        keycloakId: initialData?.keycloakId,
        firstName: values.first_name,
        lastName: values.last_name,
        whoiam_register: "For myself",
        profile_created_for: "For myself",
      };
      onSave(payload);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (PNG, JPG, JPEG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("image", [{ url: base64String, default: true }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", []);
  };

  if (!isOpen) return null;

  const getInputClassName = (fieldName: keyof typeof defaultUserFormData) => {
    const isInvalid = formik.touched[fieldName] && Boolean(formik.errors[fieldName]);
    return `w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
      isInvalid
        ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-200"
    }`;
  };

  const renderFieldError = (fieldName: keyof typeof defaultUserFormData) => {
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return (
        <p className="text-xs text-rose-600 mt-1 font-medium">
          {formik.errors[fieldName] as string}
        </p>
      );
    }
    return null;
  };

  const currentImage = Array.isArray(formik.values.image) && formik.values.image[0]?.url
    ? formik.values.image[0].url
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit User" : "Create New User"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? "Update user credentials, role permissions, and profile details."
                  : "Fill in the required information to create a portal user."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="user-form" onSubmit={formik.handleSubmit} className="space-y-6">

            {/* Profile Avatar & Role Summary Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {formik.values.first_name ? formik.values.first_name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Profile Picture
                  </span>
                  {currentImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Upload a clean JPG, PNG, or WebP photo up to 5MB (Optional).
                </p>
              </div>

              {/* Role Quick Selector */}
              <div className="w-full sm:w-auto shrink-0 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full sm:w-40 appearance-none px-3 py-2 rounded-xl border border-violet-200 bg-violet-50/60 font-semibold text-xs text-violet-800 outline-none focus:ring-2 focus:ring-violet-300 transition-all cursor-pointer pr-8"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.displayName}
                      </option>
                    ))}
                  </select>
                  <Shield size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none" />
                </div>
                {renderFieldError("role")}
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Enter first name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("first_name")}
                  />
                  {renderFieldError("first_name")}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Enter last name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("last_name")}
                  />
                  {renderFieldError("last_name")}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    <span>Email Address</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="user@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("email")}
                  />
                  {renderFieldError("email")}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" />
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="phone_code"
                      value={formik.values.phone_code}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-center outline-none focus:border-violet-600"
                      placeholder="+91"
                    />
                    <input
                      type="text"
                      name="phone_number"
                      placeholder="9876543210"
                      value={formik.values.phone_number}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`flex-1 ${getInputClassName("phone_number")}`}
                    />
                  </div>
                  {renderFieldError("phone_number")}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("gender")}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {renderFieldError("gender")}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("dob")}
                  />
                  {renderFieldError("dob")}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Location (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    District / City
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="e.g. Coimbatore"
                    value={formik.values.district}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("district")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Tamil Nadu"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("state")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="e.g. 641001"
                    value={formik.values.zipcode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getInputClassName("zipcode")}
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            form="user-form"
            type="submit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg transition-all text-xs cursor-pointer"
          >
            <User size={14} />
            <span>{isEdit ? "Save Changes" : "Create User"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
