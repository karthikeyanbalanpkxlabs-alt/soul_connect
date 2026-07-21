"use client";

import { useKeycloak } from "@/providers/KeycloakProvider";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { profile, loadingProfile, profileError, refreshProfile } =
    useKeycloak();

  const fullName =
    [
      profile?.first_name || profile?.firstName,
      profile?.last_name || profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "User Profile";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Image */}
            <div className="relative">
              {profile?.photos && profile.photos.length > 0 ? (
                <img
                  src={profile.photos[0]}
                  alt={fullName}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-pink-50 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-4xl font-bold border-4 border-pink-50 shadow-md">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}

              {profile?.public_verify && (
                <div
                  className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-md"
                  title="Verified Profile"
                >
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Profile Brief */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {fullName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {profile?.customer_id ? `ID: ${profile.customer_id}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => refreshProfile()}
                  disabled={loadingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all self-center md:self-auto cursor-pointer"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingProfile ? "animate-spin" : ""}`}
                  />
                  {loadingProfile ? "Syncing..." : "Sync Profile"}
                </button>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                {profile?.public_verify ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        {loadingProfile ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-100">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500 mb-3" />
            Loading profile details from backend...
          </div>
        ) : profileError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
            <p className="font-semibold">{profileError}</p>
            <button
              onClick={() => refreshProfile()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
                <User className="w-5 h-5 text-pink-500" /> Personal Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.gender || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium text-gray-900">
                    {profile?.age ? `${profile.age} Yrs` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date of Birth:</span>
                  <span className="font-medium text-gray-900">
                    {profile?.dob || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Marital Status:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.marital_status || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Height:</span>
                  <span className="font-medium text-gray-900">
                    {profile?.height || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
                <Mail className="w-5 h-5 text-pink-500" /> Contact & Location
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" /> Email:
                  </span>
                  <span className="font-medium text-gray-900 truncate max-w-[200px]">
                    {profile?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" /> Phone:
                  </span>
                  <span className="font-medium text-gray-900">
                    {profile?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" /> District:
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.district || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" /> City:
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.city || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Career & Religion */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 md:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
                <Briefcase className="w-5 h-5 text-pink-500" /> Career & Religion
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Occupation</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.occupation || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Education</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.education || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Religion</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.religion || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Caste</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {profile?.caste || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Identity Verification Details */}
            {profile?.identity_proff && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 md:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Identity Verification Document
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  {typeof profile.identity_proff === "object" && profile.identity_proff?.url ? (
                    <a
                      href={profile.identity_proff.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition cursor-pointer"
                    >
                      View Uploaded ID Proof Document ↗
                    </a>
                  ) : typeof profile.identity_proff === "string" ? (
                    <a
                      href={profile.identity_proff}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition cursor-pointer"
                    >
                      View Uploaded ID Proof Document ↗
                    </a>
                  ) : (
                    <span className="text-gray-500">ID Proof Document Submitted</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
