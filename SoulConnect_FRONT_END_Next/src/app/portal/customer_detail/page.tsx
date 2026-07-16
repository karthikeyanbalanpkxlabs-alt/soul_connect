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
} from "lucide-react";

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
          `http://localhost:3000/api/customer_detail/${id}`,
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-violet-700 transition"
      >
        <ArrowLeft size={20} /> Back to Customers
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
