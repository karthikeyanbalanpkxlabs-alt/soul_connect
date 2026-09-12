"use client";

import React, { useEffect, useState } from "react";
import { useKeycloak } from "@/providers/KeycloakProvider";
import configUrls from "../../../../configUrls";
import ProfileCard from "../customer/ProfileCard";
import { Heart, Loader2, User, UserCheck, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InterestedPage() {
  const { profile, refreshProfile } = useKeycloak();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [loading, setLoading] = useState(true);
  const [sentInterests, setSentInterests] = useState<any[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<any[]>([]);

  const fetchInterestedList = async () => {
    setLoading(true);
    try {
      const apiUrl = configUrls?.apiUrl || "";
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("token") || localStorage.getItem("token")
          : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        keycloakId: profile?.keycloakId,
        email: profile?.email,
        customer_id: profile?.customer_id || profile?._id,
      };

      const res = await fetch(`${apiUrl}/api/interested_list`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setSentInterests(data.sentInterests || []);
        setReceivedInterests(data.receivedInterests || []);
      } else {
        // Fallback to public endpoint
        const pubRes = await fetch(`${apiUrl}/api/public/interested_list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (pubRes && pubRes.ok) {
          const pubData = await pubRes.json();
          setSentInterests(pubData.sentInterests || []);
          setReceivedInterests(pubData.receivedInterests || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch interested list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestedList();
  }, [profile]);

  const handleInterestChanged = async () => {
    if (refreshProfile) {
      await refreshProfile().catch(() => null);
    }
    fetchInterestedList();
  };

  const handleView = (id: string) => {
    router.push(`/portal/customer_detail?id=${id}`);
  };

  const displayedRows = activeTab === "sent" ? sentInterests : receivedInterests;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-serif text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
            Interested Profiles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage profiles you have liked and see members who showed interest in you.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sent"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                activeTab === "sent" ? "fill-rose-600 text-rose-600" : ""
              }`}
            />
            <span>Profiles You Liked ({sentInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("received")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "received"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Who Liked You ({receivedInterests.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
          <p className="text-slate-500 text-sm">Loading interested profiles...</p>
        </div>
      ) : displayedRows.length > 0 ? (
        <div className="flex flex-col gap-6">
          {displayedRows.map((row: any) => (
            <ProfileCard
              key={row._id || row.id || row.customer_id}
              customer={row}
              onView={handleView}
              onSendInterest={handleInterestChanged}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {activeTab === "sent"
              ? "No Liked Profiles Yet"
              : "No Interests Received Yet"}
          </h3>
          <p className="text-slate-500 text-sm max-w-md">
            {activeTab === "sent"
              ? "Browse matches and click the 'Send Interest' button to save profiles here."
              : "Complete your profile details to increase visibility and receive interests from prospective matches."}
          </p>
          {activeTab === "sent" && (
            <button
              onClick={() => router.push("/portal/customer")}
              className="mt-6 bg-[#c28b70] hover:bg-[#b07d64] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md"
            >
              Explore Matches
            </button>
          )}
        </div>
      )}
    </div>
  );
}
