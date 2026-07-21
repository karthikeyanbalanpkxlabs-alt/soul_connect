import React, { useState } from "react";
import { Check, ChevronRight, Minus, Play, Plus, Star } from "lucide-react";

interface FilterSidebarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters = {},
  onFilterChange,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string>("district");

  const minAgeLimit = 18;
  const maxAgeLimit = 100;
  const minVal = parseInt(filters["min_age"] || "18", 10);
  const maxVal = parseInt(filters["max_age"] || "80", 10);

  const minPercent =
    ((minVal - minAgeLimit) / (maxAgeLimit - minAgeLimit)) * 100;
  const maxPercent =
    ((maxVal - minAgeLimit) / (maxAgeLimit - minAgeLimit)) * 100;

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev: string) => (prev === name ? "" : name));
  };

  const districts = [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Trichy",
    "Tiruppur",
    "Erode",
    "Vellore",
    "Thanjavur",
    "Tirunelveli",
  ];

  const horoscopes = [
    "Kundali Matching",
    "Tamil Kundali",
    "Telugu Kundali",
    "Malayalam Kundali",
    "Marathi Kundali",
    "Gujarati Kundali",
    "Kannada Kundali",
    "Bihari Kundali",
    "Bengali Kundali",
  ];

  const services = [
    { name: "Marathi Shaadi", count: "09" },
    { name: "Assamese Shaadi", count: "07" },
    { name: "Bengali Shaadi", count: "13" },
    { name: "Hindi Shaadi", count: "11" },
    { name: "Jain Shaadi", count: "17" },
    { name: "Kannada Shaadi", count: "19" },
    { name: "Telugu Shaadi", count: "08" },
  ];

  const tags = [
    "Wedding",
    "Matrimony",
    "Client",
    "Hindu",
    "Event",
    "Lorem",
    "Porta",
    "Bengali",
    "Eget",
    "Nulla",
    "Marathi",
  ];

  return (
    <div className="w-full lg:w-72 flex-shrink-0 mr-8 flex flex-col gap-8 text-[#555]">
      {/* Search Filters Section */}
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-md shadow-sm">
        <h3 className="font-serif text-2xl text-gray-800 mb-4 pb-1 border-b border-gray-200">
          Search Filters
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">
              First Name
            </label>
            <input
              type="text"
              value={filters["first_name"] || ""}
              placeholder="Search First Name"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("first_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={filters["last_name"] || ""}
              placeholder="Search Last Name"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("last_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">
              Email
            </label>
            <input
              type="text"
              value={filters["email"] || ""}
              placeholder="Search Email"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">
              Subscription Type
            </label>
            <input
              type="text"
              value={filters["subscription_type"] || ""}
              placeholder="Search Subscription Type"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) =>
                onFilterChange("subscription_type", e.target.value)
              }
            />
          </div>
          <div>
            <style>{`
              .dual-slider-container {
                position: relative;
                width: 100%;
                height: 24px;
                display: flex;
                align-items: center;
              }
              .dual-slider-track {
                position: absolute;
                width: 100%;
                height: 6px;
                background-color: #e5e7eb;
                border-radius: 3px;
                z-index: 1;
              }
              .dual-slider-range {
                position: absolute;
                height: 6px;
                background-color: #00a82d; /* Vibrant Green */
                border-radius: 3px;
                z-index: 2;
              }
              input[type="range"].dual-slider-input {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 6px;
                background: transparent;
                position: absolute;
                pointer-events: none;
                outline: none;
                margin: 0;
                z-index: 3;
              }
              input[type="range"].dual-slider-input::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background-color: #4b5563; /* Dark gray */
                border: 2px solid #00a82d; /* Green accent border */
                cursor: pointer;
                pointer-events: auto;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                transition: transform 0.1s ease;
              }
              input[type="range"].dual-slider-input::-webkit-slider-thumb:hover {
                transform: scale(1.1);
              }
              input[type="range"].dual-slider-input::-moz-range-thumb {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background-color: #4b5563;
                border: 2px solid #00a82d;
                cursor: pointer;
                pointer-events: auto;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                transition: transform 0.1s ease;
              }
              input[type="range"].dual-slider-input::-moz-range-thumb:hover {
                transform: scale(1.1);
              }
            `}</style>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-500 font-semibold block">
                Age Range
              </label>
              <span className="text-xs text-[#c28b70] font-bold">
                {minVal} - {maxVal} Yrs
              </span>
            </div>
            <div className="bg-white p-4 border border-gray-200 rounded-md">
              <div className="dual-slider-container">
                <div className="dual-slider-track" />
                <div
                  className="dual-slider-range"
                  style={{
                    left: `${minPercent}%`,
                    width: `${maxPercent - minPercent}%`,
                  }}
                />
                <input
                  type="range"
                  min={minAgeLimit}
                  max={maxAgeLimit}
                  value={minVal}
                  className="dual-slider-input"
                  onChange={(e) => {
                    const val = Math.min(
                      parseInt(e.target.value, 10),
                      maxVal - 1,
                    );
                    onFilterChange("min_age", String(val));
                  }}
                />
                <input
                  type="range"
                  min={minAgeLimit}
                  max={maxAgeLimit}
                  value={maxVal}
                  className="dual-slider-input"
                  onChange={(e) => {
                    const val = Math.max(
                      parseInt(e.target.value, 10),
                      minVal + 1,
                    );
                    onFilterChange("max_age", String(val));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Profiles Section */}
      <div>
        <h2 className="text-3xl font-serif italic text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Filter Profiles
        </h2>

        {/* District Accordion */}
        <div className="mb-2">
          <button
            onClick={() => toggleAccordion("district")}
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
              openAccordion === "district"
                ? "bg-[#c28b70] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>District</span>
            </div>
            {openAccordion === "district" ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
          {openAccordion === "district" && (
            <div className="p-4 bg-white border border-gray-100 border-t-0">
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {districts.map((district, idx) => {
                  const isSelected =
                    filters["district"]?.toLowerCase() ===
                    district.toLowerCase();
                  return (
                    <li
                      key={idx}
                      onClick={() =>
                        onFilterChange("district", isSelected ? "" : district)
                      }
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors text-sm ${
                        isSelected
                          ? "bg-[#c28b70]/10 text-[#c28b70] font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Check
                        className={`w-4 h-4 ${isSelected ? "text-[#c28b70] opacity-100" : "opacity-20 text-gray-300"}`}
                      />
                      <span>{district}</span>
                    </li>
                  );
                })}
              </ul>
              {filters["district"] && (
                <button
                  onClick={() => onFilterChange("district", "")}
                  className="mt-4 bg-gray-100 text-gray-600 px-4 py-2 rounded text-sm w-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>

        {/* Marital Status Accordion */}
        <div className="mb-2">
          <button
            disabled
            onClick={() => toggleAccordion("marital")}
            className={`opacity-60 w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
              openAccordion === "marital"
                ? "bg-[#c28b70] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gray-400" />
              <span>Marrital Status</span>
            </div>
            {openAccordion === "marital" ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Religion Accordion */}
        <div className="mb-2">
          <button
            disabled
            onClick={() => toggleAccordion("religion")}
            className={`opacity-60 w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
              openAccordion === "religion"
                ? "bg-[#c28b70] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gray-400" />
              <span>Religion</span>
            </div>
            {openAccordion === "religion" ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Horoscope Section */}
      {/* <div>
        <h2 className="text-3xl font-serif italic text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Horoscope
        </h2>
        <div className="bg-white border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {horoscopes.map((horoscope, idx) => (
              <li
                key={idx}
                className="flex items-center gap-6 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-gray-400" />
                <span className="text-sm">{horoscope}</span>
              </li>
            ))}
          </ul>
        </div>
      </div> */}

      {/* Our Services Section */}
      {/* <div>
        <h2 className="text-3xl font-serif italic text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Our Services
        </h2>
        <ul className="divide-y divide-gray-100">
          {services.map((service, idx) => (
            <li key={idx} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span className="text-sm font-medium text-gray-700">
                  {service.name}
                </span>
              </div>
              <span className="bg-[#c28b70] text-white text-xs px-2 py-1 rounded font-bold">
                {service.count}
              </span>
            </li>
          ))}
        </ul>
      </div> */}

      {/* Tags Section */}
      <div>
        <h2 className="text-3xl font-serif italic text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-4 py-2 border border-gray-200 text-xs text-gray-600 rounded hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
