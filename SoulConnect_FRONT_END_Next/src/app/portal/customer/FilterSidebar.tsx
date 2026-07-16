import React, { useState } from "react";
import { Check, ChevronRight, Minus, Play, Plus, Star } from "lucide-react";

interface FilterSidebarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters = {}, onFilterChange }) => {
  const [openAccordion, setOpenAccordion] = useState<string>("country");

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev: string) => (prev === name ? "" : name));
  };

  const countries = [
    "India Matrimony",
    "China Matrimony",
    "Nepali Matrimony",
    "Germany Matrimony",
    "Pakistan Matrimony",
    "Bangladesh Matrimony",
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
        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-1 border-b border-gray-200">
          Search Filters
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">First Name</label>
            <input
              type="text"
              value={filters["first_name"] || ""}
              placeholder="Search First Name"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("first_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">Last Name</label>
            <input
              type="text"
              value={filters["last_name"] || ""}
              placeholder="Search Last Name"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("last_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">Email</label>
            <input
              type="text"
              value={filters["email"] || ""}
              placeholder="Search Email"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold block mb-1">Subscription Type</label>
            <input
              type="text"
              value={filters["subscription_type"] || ""}
              placeholder="Search Subscription Type"
              className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c28b70] transition-colors"
              onChange={(e) => onFilterChange("subscription_type", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Profiles Section */}
      <div>
        <h2 className="text-3xl font-serif italic text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Filter Profiles
        </h2>

        {/* Country Accordion */}
        <div className="mb-2">
          <button
            onClick={() => toggleAccordion("country")}
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
              openAccordion === "country"
                ? "bg-[#c28b70] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Country</span>
            </div>
            {openAccordion === "country" ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
          {openAccordion === "country" && (
            <div className="p-4 bg-white border border-gray-100 border-t-0">
              <ul className="space-y-3">
                {countries.map((country, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-pink-500" />
                    <span>{country}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 bg-[#c28b70] text-white px-4 py-2 rounded text-sm w-full md:w-auto flex items-center justify-center gap-2 transition-colors hover:bg-[#b07d64]">
                More Countries <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Marital Status Accordion */}
        <div className="mb-2">
          <button
            onClick={() => toggleAccordion("marital")}
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
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
            onClick={() => toggleAccordion("religion")}
            className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
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
      <div>
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
      </div>

      {/* Our Services Section */}
      <div>
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
      </div>

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
