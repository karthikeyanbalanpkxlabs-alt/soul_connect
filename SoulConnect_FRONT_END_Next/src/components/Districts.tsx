"use client";

import { useState } from "react";
import { districts, District } from "@/data/districts";

interface DistrictsProps {
  selectedDistrict: string;
  onSelectDistrict: (name: string) => void;
}

export default function Districts({ selectedDistrict, onSelectDistrict }: DistrictsProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filterDistricts = (region: string) => {
    setActiveTab(region);
  };

  const filteredDistricts = districts.filter((d) => {
    if (activeTab === "all") return true;
    return d.regions.includes(activeTab);
  });

  const getDistrictEmoji = (name: string, regions: string[]) => {
    if (regions.includes("hills")) return "⛰️";
    if (regions.includes("coastal") && name !== "Chennai") return "🌊";
    if (name === "Chennai" || name === "Kancheepuram") return "🏛️";
    if (regions.includes("central")) return "🌾";
    if (regions.includes("west")) return "🏭";
    return "📍";
  };

  return (
    <section id="districts" className="districts-section">
      <div className="eyebrow">All of Tamil Nadu</div>
      <h2 className="section-title">Every district, every community</h2>
      <p className="section-sub">
        From Kanyakumari to Nilgiris, from Chennai to the Cauvery delta — Soul Connect covers all 38 districts of Tamil Nadu.
      </p>
      
      <div className="districts-wrapper reveal visible">
        <div className="districts-tabs">
          <button
            className={`dtab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => filterDistricts("all")}
          >
            All Districts
          </button>
          <button
            className={`dtab ${activeTab === "north" ? "active" : ""}`}
            onClick={() => filterDistricts("north")}
          >
            North TN
          </button>
          <button
            className={`dtab ${activeTab === "south" ? "active" : ""}`}
            onClick={() => filterDistricts("south")}
          >
            South TN
          </button>
          <button
            className={`dtab ${activeTab === "central" ? "active" : ""}`}
            onClick={() => filterDistricts("central")}
          >
            Central TN
          </button>
          <button
            className={`dtab ${activeTab === "west" ? "active" : ""}`}
            onClick={() => filterDistricts("west")}
          >
            Western TN
          </button>
          <button
            className={`dtab ${activeTab === "coastal" ? "active" : ""}`}
            onClick={() => filterDistricts("coastal")}
          >
            Coastal TN
          </button>
          <button
            className={`dtab ${activeTab === "hills" ? "active" : ""}`}
            onClick={() => filterDistricts("hills")}
          >
            Hill Districts
          </button>
        </div>

        <div className="districts-grid" id="districtsGrid">
          {filteredDistricts.map((district) => {
            const isSelected = selectedDistrict === district.name;
            return (
              <div
                key={district.id}
                className={`district-card ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectDistrict(district.name)}
              >
                <div className="d-icon">
                  {getDistrictEmoji(district.name, district.regions)}
                </div>
                <div className="d-info">
                  <div className="d-name">{district.name}</div>
                  <div className="d-name-tamil">{district.tamil}</div>
                  <div className="d-count">{district.count} profiles</div>
                </div>
                <div className="d-check">✓</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}