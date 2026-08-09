"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import keycloak from "../../../lib/keycloak";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import configUrls from "../../../../configUrls";
function CustomerDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        const token = keycloak?.token;
        const res = await fetch(
          `${configUrls?.apiUrl}/api/customer_detail/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch customer details");
        }

        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-red-500">
          Error Loading Profile
        </h2>
        <p className="mt-2 text-gray-600">{error || "Customer not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-lg bg-violet-600 px-6 py-2 text-white hover:bg-violet-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = customer.image || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const minSwipeDistance = 50;

  const onTouchStartEvent = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveEvent = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      nextImage();
    }
    if (isRightSwipe && hasMultipleImages) {
      prevImage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 mt-16 md:p-12">
      <button
        onClick={() => router.back()}
        className="cursor-pointer mb-6 flex items-center gap-2 text-slate-500 hover:text-violet-700 transition"
      >
        <ArrowLeft size={20} /> Back to Profile
      </button>

      <div className="mx-auto overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        {/* Header Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-violet-500 to-fuchsia-600"></div>

        <div className="flex flex-col md:flex-row px-8 pb-12">
          {/* Profile Image Carousel & Quick Info */}
          <div className="-mt-24 mb-8 flex flex-col items-center md:mb-0 md:mr-10 md:w-1/2">
            {/* Image Slider */}
            <div
              className="relative w-full overflow-hidden rounded-2xl border-4 border-white bg-gray-200 shadow-xl"
              onTouchStart={onTouchStartEvent}
              onTouchMove={onTouchMoveEvent}
              onTouchEnd={onTouchEndEvent}
            >
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex].url}
                  alt={`${customer.first_name || ""} ${customer.last_name || ""}`}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              ) : (
                <img
                  src="https://via.placeholder.com/400x500?text=No+Image"
                  alt="Placeholder"
                  className="h-full w-full object-cover"
                />
              )}

              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow hover:bg-white hover:text-violet-600 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow hover:bg-white hover:text-violet-600 transition"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "w-6 bg-violet-600"
                            : "bg-white/80 hover:bg-white cursor-pointer"
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <h1
              style={{ maxWidth: "100%", wordWrap: "break-word" }}
              className="mt-6 text-3xl font-bold text-slate-800 capitalize text-center"
            >
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="mt-1 text-lg font-medium text-violet-600 text-center">
              {customer.customer_id}
            </p>

            <div className="mt-6 w-full rounded-2xl bg-slate-50 p-6 shadow-sm border border-slate-100">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Quick Contact
              </h3>

              <div className="mb-3 flex items-center gap-3 text-slate-700">
                <Phone size={18} className="text-violet-500" />
                <span>
                  {customer.phone_code}{" "}
                  {customer.phone_number || "Not provided"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700 break-all">
                <FileText size={18} className="text-violet-500" />
                <span>{customer.email}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="md:w-2/2 md:pt-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Personal Info */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <User size={22} className="text-fuchsia-500" />
                  <h2 className="text-xl font-bold text-slate-800">
                    Personal Info
                  </h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-medium text-slate-800">
                      {customer.dob || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.gender || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Height</span>
                    <span className="font-medium text-slate-800">
                      {customer.height ? `${customer.height} ft` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Marital Status</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.maritial_status || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Religious Background */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Heart size={22} className="text-fuchsia-500" />
                  <h2 className="text-xl font-bold text-slate-800">
                    Background
                  </h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Religion</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.religion || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Caste</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.caste || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mother Tongue</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.mother_tongue || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={22} className="text-fuchsia-500" />
                  <h2 className="text-xl font-bold text-slate-800">Location</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">District</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.district || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taluk/Town</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.taluk_town || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">State</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.state || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zipcode</span>
                    <span className="font-medium text-slate-800">
                      {customer.zipcode || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase size={22} className="text-fuchsia-500" />
                  <h2 className="text-xl font-bold text-slate-800">Career</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Education</span>
                    <span className="font-medium uppercase text-slate-800">
                      {customer.education || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profession</span>
                    <span className="font-medium capitalize text-slate-800">
                      {customer.profession || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Income</span>
                    <span className="font-medium text-slate-800">
                      ₹{customer.annual_income || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Self */}
            <div className="mt-8 rounded-2xl border border-slate-100 bg-violet-50 p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-violet-900">
                About {customer.first_name}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {customer.about_self || "No description provided."}
              </p>
            </div>

            {/* Partner Preference */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-fuchsia-50 p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-fuchsia-900">
                Partner Preferences
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {customer.partner_preference || "No preferences specified."}
              </p>
            </div>

            {/* Ambition */}
            {customer.ambition && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-emerald-50 p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-bold text-emerald-900">
                  Ambition
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  {customer.ambition}
                </p>
              </div>
            )}

            {/* Profile Video */}
            {customer.video &&
              (customer.video.url || typeof customer.video === "string") && (
                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold text-slate-800">
                    Profile Video
                  </h2>
                  <div className="overflow-hidden rounded-xl bg-black flex justify-center">
                    <video
                      controls
                      className="max-h-96 w-full object-contain"
                      src={
                        typeof customer.video === "string"
                          ? customer.video
                          : customer.video.url
                      }
                    />
                  </div>
                </div>
              )}

            {/* Identity Proof Document */}
            {customer.identity_proff &&
              (customer.identity_proff.url ||
                typeof customer.identity_proff === "string") &&
              (() => {
                const url =
                  typeof customer.identity_proff === "string"
                    ? customer.identity_proff
                    : customer.identity_proff.url;
                const isPdf =
                  url.startsWith("data:application/pdf") ||
                  url.toLowerCase().endsWith(".pdf") ||
                  (url.includes("id_") && url.toLowerCase().endsWith(".pdf"));

                return (
                  <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-slate-800">
                      Identity Proof
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      {isPdf ? (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-2xl">
                          PDF
                        </div>
                      ) : (
                        <div className="h-32 w-48 overflow-hidden rounded-lg bg-black border border-slate-200">
                          <img
                            src={url}
                            alt="Identity Proof"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-slate-800">
                          Identity Document
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {isPdf ? "PDF Document File" : "Image File"}
                        </p>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Health & Medical Report Block */}
            {(customer.health_report ||
              customer.blood_group ||
              customer.additional_report_info) && (
              <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-800">
                  Health & Medical Report
                </h2>

                <div className="space-y-4">
                  {customer.blood_group && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm">
                        Blood Group:
                      </span>
                      <span className="font-semibold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-xs border border-rose-100">
                        {customer.blood_group}
                      </span>
                    </div>
                  )}

                  {customer.additional_report_info && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-1">
                        Additional Report Info
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {customer.additional_report_info}
                      </p>
                    </div>
                  )}

                  {customer.health_report &&
                    (customer.health_report.url ||
                      typeof customer.health_report === "string") &&
                    (() => {
                      const url =
                        typeof customer.health_report === "string"
                          ? customer.health_report
                          : customer.health_report.url;
                      const isPdf =
                        url.startsWith("data:application/pdf") ||
                        url.toLowerCase().endsWith(".pdf") ||
                        (url.includes("health_") &&
                          url.toLowerCase().endsWith(".pdf"));

                      return (
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                          {isPdf ? (
                            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-2xl">
                              PDF
                            </div>
                          ) : (
                            <div className="h-32 w-48 overflow-hidden rounded-lg bg-black border border-slate-200">
                              <img
                                src={url}
                                alt="Health Report"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-semibold text-slate-800">
                              Medical Report Document
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {isPdf ? "PDF Document File" : "Image File"}
                            </p>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            )}
            {/* Lifestyle Details Block */}
            {(() => {
              const life = customer.lifeStyle || {};
              const dietVal = life.diet || customer.diet || "Strict Vegetarian";
              const smokingVal =
                life.smoking || customer.smoking || "Non-Smoker";
              const drinkingVal =
                life.drinking || customer.drinking || "Non-Drinker";
              const livingWithVal =
                life.living_with || customer.living_with || "With Family";
              const relocateVal =
                life.willing_to_relocate ||
                customer.willing_to_relocate ||
                "Yes, TN preferred";
              const interestsVal =
                life.interests ||
                customer.interests ||
                "Yoga, Cooking, Trekking";

              return (
                <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
                        🌿
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Lifestyle
                        </h2>
                        <p className="text-xs text-slate-400">
                          Personal habits, living arrangements and interests
                        </p>
                      </div>
                    </div>
                    {customer.public_verify ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                        ⏳ Verification Pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DIET
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {dietVal}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        SMOKING
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {smokingVal}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DRINKING
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {drinkingVal}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        LIVING WITH
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {livingWithVal}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        WILLING TO RELOCATE
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {relocateVal}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        INTERESTS
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">
                        {interestsVal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Family Background Details Block */}
            {(() => {
              const fam = customer.familyBackground || {};
              const fatherName =
                fam.father_name ||
                customer.father_name ||
                "Dr. R. Krishnamurthy";
              const fatherOcc =
                fam.father_occupation ||
                customer.father_occupation ||
                "Retired · IIT Madras Professor";
              const motherName =
                fam.mother_name || customer.mother_name || "Smt. Meenakshi K.";
              const motherOcc =
                fam.mother_occupation ||
                customer.mother_occupation ||
                "Homemaker";
              const siblings =
                fam.siblings || customer.siblings || "1 Elder Brother";
              const siblingsDetails =
                fam.siblings_details ||
                customer.siblings_details ||
                "Married · Software Engineer, Bengaluru";
              const famType =
                fam.family_type || customer.family_type || "Nuclear Family";
              const famTypeDetails =
                fam.family_type_details ||
                customer.family_type_details ||
                "Extended family in Mylapore";
              const famStatus =
                fam.family_status ||
                customer.family_status ||
                "Upper Middle Class";
              const famStatusDetails =
                fam.family_status_details ||
                fam.family_address ||
                customer.family_status_details ||
                customer.family_address ||
                "Own house in Mylapore, Chennai";
              const famValues =
                fam.family_values || customer.family_values || "Traditional";
              const famValuesDetails =
                fam.family_values_details ||
                customer.family_values_details ||
                "Conservative with modern outlook";

              return (
                <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
                      🏠
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        Family Background
                      </h2>
                      <p className="text-xs text-slate-400">
                        Family structure, status, values and address information
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">👨</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        FATHER
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {fatherName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fatherOcc}
                      </p>
                    </div>

                    {/* Mother */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">👩</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        MOTHER
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {motherName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {motherOcc}
                      </p>
                    </div>

                    {/* Siblings */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">👦</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        SIBLINGS
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {siblings}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {siblingsDetails}
                      </p>
                    </div>

                    {/* Family Type */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">🏡</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        FAMILY TYPE
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {famType}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {famTypeDetails}
                      </p>
                    </div>

                    {/* Family Status & Address */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">💎</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        FAMILY STATUS
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {famStatus}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {famStatusDetails}
                      </p>
                    </div>

                    {/* Family Values */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="text-2xl mb-1">🙏</div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        FAMILY VALUES
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {famValues}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {famValuesDetails}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Family Photos Block */}
            {(() => {
              const familyPhotosList = Array.isArray(customer.family_photos)
                ? customer.family_photos
                : typeof customer.family_photos === "string" &&
                    customer.family_photos
                  ? [{ url: customer.family_photos }]
                  : customer.family_photo
                    ? [
                        typeof customer.family_photo === "string"
                          ? { url: customer.family_photo }
                          : customer.family_photo,
                      ]
                    : [];
              if (familyPhotosList.length === 0) return null;

              return (
                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Users size={22} className="text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-800">
                      Family Photo
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {familyPhotosList.map((fp: any, idx: number) => {
                      const url = typeof fp === "string" ? fp : fp?.url;
                      if (!url) return null;
                      return (
                        <div
                          key={idx}
                          className="relative w-64 h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm"
                        >
                          <img
                            src={url}
                            alt={`Family Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                            <p className="text-xs font-bold">
                              Family Photo Uploaded
                            </p>
                            <p className="text-[10px] text-emerald-400 font-semibold">
                              ✓ Verified
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Horoscope & Birth Chart Details Block */}
            {(() => {
              const horoObj = customer.horoscopeDetails || {};
              const starVal =
                horoObj.star || customer.star || customer.nakshatra || "Rohini";
              const rasiVal =
                horoObj.rasi ||
                customer.rasi ||
                customer.moon_sign ||
                "Rishabam (Taurus)";
              const lagnamVal =
                horoObj.lagnam ||
                customer.lagnam ||
                customer.ascendant ||
                "Mithunam (Gemini)";
              const gothramVal =
                horoObj.gothram || customer.gothram || "Vatsa Gothram";
              const dobVal = horoObj.dob || customer.dob || "1989-02-22";
              const tobVal =
                horoObj.tob ||
                customer.tob ||
                customer.time_of_birth ||
                "06:34 AM";
              const pobVal =
                horoObj.pob ||
                customer.pob ||
                customer.place_of_birth ||
                "Kumbakonam";
              const doshamVal =
                horoObj.dosham || customer.dosham || "No Dosham";
              const manglikVal = horoObj.manglik || customer.manglik || "No";
              const chevvaiVal =
                horoObj.chevvai_dosham || customer.chevvai_dosham || "No";
              const rahuKetuVal =
                horoObj.rahu_ketu_dosham ||
                customer.rahu_ketu_dosham ||
                "Neutral";
              const jathagam = horoObj.jathagam || customer.jathagam;
              const rawJathUrl =
                typeof jathagam === "string" ? jathagam : jathagam?.url;
              const jathagamUrl = rawJathUrl
                ? rawJathUrl.startsWith("http") ||
                  rawJathUrl.startsWith("data:")
                  ? rawJathUrl
                  : `${configUrls?.apiUrl || "http://localhost:3000"}/${rawJathUrl.replace(/^\//, "")}`
                : null;

              return (
                <div className="mt-8 rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600">
                        ⭐
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Horoscope & Birth Chart Details
                        </h2>
                        <p className="text-xs text-slate-400">
                          Astrological nakshatra, rasi, lagnam and birth chart
                          information
                        </p>
                      </div>
                    </div>
                    {customer.public_verify ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                        ⏳ Verification Pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        STAR (NAKSHATRA)
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {starVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        RASI (MOON SIGN)
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {rasiVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        LAGNAM (ASCENDANT)
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {lagnamVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        GOTHRAM
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {gothramVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DATE OF BIRTH
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {dobVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        TIME OF BIRTH
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {tobVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        PLACE OF BIRTH
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        {pobVal || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DOSHAM
                      </span>
                      <span className="text-sm font-bold text-emerald-600 block mt-0.5">
                        {doshamVal}
                      </span>
                    </div>
                  </div>

                  {/* Dosham Badges */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Manglik: {manglikVal}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Chevvai Dosham: {chevvaiVal}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Rahu-Ketu: {rahuKetuVal}
                    </span>
                  </div>

                  {/* Jathagam Attachment */}
                  {jathagamUrl &&
                    (() => {
                      const isPdf =
                        jathagamUrl.startsWith("data:application/pdf") ||
                        jathagamUrl.toLowerCase().endsWith(".pdf") ||
                        jathagamUrl.includes(".pdf");

                      return (
                        <div className="mt-6 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                          <h4 className="font-bold text-amber-950 text-sm mb-3 flex items-center gap-2">
                            <span>📜</span> Jathagam / Birth Chart Document
                          </h4>
                          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                            {isPdf ? (
                              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl bg-amber-100/90 text-amber-900 font-bold p-2 text-center">
                                <span className="text-2xl mb-1">📜</span>
                                <span className="text-[10px] uppercase font-bold text-amber-800">
                                  PDF File
                                </span>
                              </div>
                            ) : (
                              <div className="h-36 w-48 overflow-hidden rounded-xl bg-black border border-slate-200 shadow-sm">
                                <img
                                  src={jathagamUrl}
                                  alt="Jathagam Birth Chart"
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="font-bold text-slate-800 text-base">
                                {jathagam?.name || "Jathagam (Birth Chart)"}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {isPdf
                                  ? "Uploaded PDF Document"
                                  : "Uploaded Image File"}
                              </p>
                              <a
                                href={jathagamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition shadow-sm active:scale-95"
                              >
                                <span>View / Download Jathagam</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              );
            })()}

            {/* Partner Preferences Details Block */}
            {(() => {
              const pref = customer.partnerPreferencesDetails || {};
              const ageRange = pref.age_range || "27 – 33 yrs";
              const ageFlex = pref.age_flexible || "flexible";
              const height = pref.height || "5'7\" and above";
              const marital = pref.marital_status || "Never Married preferred";
              const diet = pref.diet || "Vegetarian only";
              const smoking = pref.smoking || "Non-Smoker";
              const drinking = pref.drinking || "Non-Drinker preferred";
              const drinkingFlex = pref.drinking_flexible || "flexible";
              const edu = pref.education || "Graduate & above";
              const occ = pref.occupation || "Any professional field";
              const income = pref.income || "₹8L+ per year";
              const religion = pref.religion || "Hindu preferred";
              const caste = pref.caste || "Tamil Brahmin preferred";
              const casteOpen = pref.caste_open || "open";
              const location =
                pref.location || "Tamil Nadu or willing to relocate";
              const livingSetup =
                pref.living_setup || "Open to joint or nuclear family";
              const values =
                pref.values || "Family-oriented, respectful, grounded";
              const personality =
                pref.personality || "Honest, emotionally mature, ambitious";
              const overview =
                pref.overview ||
                customer.partner_preference ||
                "Like we mentioned before, your values often inform your dating preferences – someone religious isn't likely to want to date an atheist, for instance";

              return (
                <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
                        💖
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Partner Preferences
                        </h2>
                        <p className="text-xs text-slate-400">
                          Expectations, career, community and lifestyle
                          preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BASIC EXPECTATIONS */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-purple-600 uppercase mb-3">
                      BASIC EXPECTATIONS
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🎂</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Age Range
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                            {ageRange}
                          </span>
                          {ageFlex && (
                            <span className="text-emerald-600 text-xs font-semibold">
                              {ageFlex}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📏</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Height
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {height}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💒</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Marital Status
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {marital}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🍃</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Diet
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {diet}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚬</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Smoking
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {smoking}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🍷</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Drinking
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {drinking}
                          </span>
                          {drinkingFlex && (
                            <span className="text-emerald-600 text-xs font-semibold">
                              {drinkingFlex}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EDUCATION & CAREER */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-purple-600 uppercase mb-3">
                      EDUCATION & CAREER
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🎓</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Education
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {edu}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💼</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Occupation
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {occ}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💰</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Income
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {income}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RELIGION & COMMUNITY */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-purple-600 uppercase mb-3">
                      RELIGION & COMMUNITY
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🛕</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Religion
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {religion}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌐</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Caste
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {caste}
                          </span>
                          {casteOpen && (
                            <span className="text-emerald-600 text-xs font-semibold">
                              {casteOpen}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌍</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Location
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PERSONALITY & LIFESTYLE */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-purple-600 uppercase mb-3">
                      PERSONALITY & LIFESTYLE
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏠</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Living Setup
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {livingSetup}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💡</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Values
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {values}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">✨</span>
                          <span className="text-xs font-semibold text-slate-600">
                            Personality
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {personality}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OVERVIEW */}
                  <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                      <span>💬</span> Partner Preferences Overview
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{overview}"
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
        </div>
      }
    >
      <CustomerDetailContent />
    </Suspense>
  );
}
