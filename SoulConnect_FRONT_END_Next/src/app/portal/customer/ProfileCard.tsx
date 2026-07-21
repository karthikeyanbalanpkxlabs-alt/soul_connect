import React from "react";
import { Heart, User, Pencil, Trash2 } from "lucide-react";

interface ProfileCardProps {
  customer: any;
  onEdit?: (customer: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  canDelete?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  customer,
  onEdit,
  onDelete,
  onView,
  canDelete,
}) => {
  // Extract data with fallbacks
  const imageUrl =
    customer?.image?.[0]?.url ||
    "https://via.placeholder.com/250x300?text=No+Image";
  const name =
    `${customer?.first_name || "Unknown"} ${customer?.last_name || ""}`.trim();
  const age = "27 Yrs"; // Mocking age as we only have dob string like "02-12-1999"
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

  return (
    <div className="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-100 last:border-b-0">
      {/* Left: Image */}
      <div className="w-full md:w-64 h-80 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-pink-500 cursor-pointer hover:fill-pink-500 transition-colors" />
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
            // onClick={() => onView?.(customer._id)}
            onClick={() => onView?.(customer._id)}
            className="bg-[#15203c] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#0d1428] transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" /> View Full Profile
          </button>

          {canDelete && (
            <button
              onClick={() => onEdit?.(customer)}
              className="border border-violet-200 text-violet-600 hover:bg-violet-50 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
              title="Edit Customer"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete?.(customer._id)}
              className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
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

          {/* <button 
            onClick={() => onView?.(customer._id)}
            className="bg-[#c28b70] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#b07d64] transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" /> View Detail
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
