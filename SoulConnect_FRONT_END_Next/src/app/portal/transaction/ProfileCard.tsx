import React, { useState, useEffect } from "react";
import { Heart, User, Pencil, Trash2, Loader2 } from "lucide-react";
import configUrls from "../../../../configUrls";

interface ProfileCardProps {
  customer: any;
  onEdit?: (customer: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onSendInterest?: (customer: any) => void;
  canDelete?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  customer,
  onEdit,
  onDelete,
  onView,
  onSendInterest,
  canDelete,
}) => {
  const customerId = customer?._id || customer?.id || customer?.customer_id;
  const [isInterested, setIsInterested] = useState(false);
  const [isSavingInterest, setIsSavingInterest] = useState(false);

  useEffect(() => {
    let initialInterested =
      customer?.interestSent === true ||
      customer?.isInterested === true ||
      customer?.interest_sent === true;

    if (!initialInterested && typeof window !== "undefined" && customerId) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("interested_profile_ids") || "[]"
        );
        if (Array.isArray(stored) && stored.includes(String(customerId))) {
          initialInterested = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsInterested(initialInterested);
  }, [customer, customerId]);

  const handleInterestClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSavingInterest) return;

    const newState = !isInterested;
    setIsInterested(newState);
    setIsSavingInterest(true);

    // Save to localStorage for instant local persistence
    if (typeof window !== "undefined" && customerId) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("interested_profile_ids") || "[]"
        );
        let updated = Array.isArray(stored) ? [...stored] : [];
        const cidStr = String(customerId);
        if (newState) {
          if (!updated.includes(cidStr)) updated.push(cidStr);
        } else {
          updated = updated.filter((id: string) => id !== cidStr);
        }
        localStorage.setItem("interested_profile_ids", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save interest to localStorage", err);
      }
    }

    // Persist to backend database via API
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
        customer_id: customerId,
        target_customer_id: customerId,
        isInterested: newState,
        interestSent: newState,
        interest_sent: newState,
        status: newState ? "Interested" : "Not Interested",
      };

      // Primary call to /api/send_interest
      const res = await fetch(`${apiUrl}/api/send_interest`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch(() => null);

      // Fallback call to /api/customer_edit if /api/send_interest is not available
      if (!res || !res.ok) {
        await fetch(`${apiUrl}/api/customer_edit`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            _id: customerId,
            customer_id: customerId,
            isInterested: newState,
            interestSent: newState,
            interest_sent: newState,
          }),
        }).catch(() => null);
      }
    } catch (error) {
      console.error("Error storing interest in database:", error);
    } finally {
      setIsSavingInterest(false);
      if (onSendInterest) {
        onSendInterest(customer);
      }
    }
  };

  // Extract data with fallbacks
  const imageUrl =
    customer?.image?.[0]?.url ||
    "https://via.placeholder.com/250x300?text=No+Image";
  const name =
    `${customer?.first_name || "Unknown"} ${customer?.last_name || ""}`.trim();
  const calculateAge = (dobStr?: string) => {
    if (!dobStr) return "N/A";
    let day = 0, month = 0, year = 0;
    if (dobStr.includes("-")) {
      const parts = dobStr.split("-");
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else if (dobStr.includes("/")) {
      const parts = dobStr.split("/");
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else return "N/A";

    if (isNaN(day) || isNaN(month) || isNaN(year)) return "N/A";
    const birthDate = new Date(year, month, day);
    const today = new Date();
    let ageVal = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageVal--;
    }
    return ageVal > 0 ? `${ageVal} Yrs` : "N/A";
  };
  const age = calculateAge(customer?.dob);
  const height = customer?.height ? `${customer.height} Ft` : "5 Ft 4 In";
  const religion = customer?.religion || "N/A";
  const caste = customer?.caste || "N/A";
  const location =
    `${customer?.district || ""}${customer?.state ? `, ${customer.state}` : ""}`.trim() ||
    "N/A";
  const education = customer?.education || "N/A";
  const profession = customer?.profession || "N/A";
  const income = customer?.annual_income
    ? `${customer.annual_income} Lakhs`
    : "N/A";

  const description =
    customer?.about_self && customer.about_self !== "NA"
      ? customer.about_self
      : "Integer non nisl elit in ac tempor ante, eget iaculis augue. Nuncekon dolor mi, accumsan quis ante id, eleifend suscipit purus. Praesent augue eros, consectetur eu eleifend inno, eget condimentum auctor, libero ipsum viverra nisi, at vulputate ex mi suscipit nunc ut dui malesuada ornare ut id tellus.";

  const DEFAULT_PLACEHOLDER =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = DEFAULT_PLACEHOLDER;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-100 last:border-b-0">
      {/* Left: Image */}
      <div className="w-full md:w-64 h-80 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Heart
              onClick={handleInterestClick}
              className={`w-5 h-5 cursor-pointer transition-colors ${isInterested
                  ? "fill-pink-500 text-pink-500"
                  : "text-pink-500 hover:fill-pink-500"
                }`}
            />
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong className="text-gray-800">Age:</strong> {age}{" "}
              <span className="mx-1"></span>{" "}
              <strong className="text-gray-800">Height:</strong> {height}
            </p>
            <p>
              <strong className="text-gray-800">Religion:</strong> {religion}
            </p>
            <p>
              <strong className="text-gray-800">Caste:</strong> {caste}
            </p>
            <p>
              <strong className="text-gray-800">Location:</strong> {location}
            </p>
            <p>
              <strong className="text-gray-800">Education:</strong> {education}
            </p>
            <p>
              <strong className="text-gray-800">Profession:</strong>{" "}
              {profession}
            </p>
            <p>
              <strong className="text-gray-800">Annual Income:</strong> {income}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onView?.(customer._id || customer.id)}
            className="bg-[#15203c] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#0d1428] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" /> View Full Profile
          </button>

          <button
            onClick={handleInterestClick}
            className={`px-5 py-2.5 rounded text-sm font-medium transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 ${isInterested
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              }`}
            title={isInterested ? "Interest Sent" : "Send Interest to this profile"}
          >
            <Heart
              className={`w-4 h-4 ${isInterested
                  ? "fill-rose-600 text-rose-600"
                  : "fill-white text-white"
                }`}
            />
            <span>{isInterested ? "Interest Sent" : "Send Interest"}</span>
          </button>

          {canDelete && (
            <button
              onClick={() => onEdit?.(customer)}
              className="border border-violet-200 text-violet-600 hover:bg-violet-50 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              title="Edit Customer"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete?.(customer._id || customer.id)}
              className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Right: Description & Socials */}
      <div className="w-full md:w-72 flex-shrink-0 flex flex-col justify-between">
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {description}
        </p>

        <div>
          <div className="flex gap-2 mb-6">
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              f
            </a>
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded font-bold text-xs hover:bg-green-700 transition-colors"
            >
              ig
            </a>
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded font-bold text-xs hover:bg-yellow-600 transition-colors"
            >
              in
            </a>
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center bg-cyan-400 text-white rounded font-bold text-xs hover:bg-cyan-500 transition-colors"
            >
              t
            </a>
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded font-bold text-xs hover:bg-red-700 transition-colors"
            >
              yt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
