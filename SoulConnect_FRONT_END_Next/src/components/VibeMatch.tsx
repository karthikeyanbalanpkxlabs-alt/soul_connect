"use client";

import { useState } from "react";
import { Sliders, HelpCircle, ShieldAlert, Key, EyeOff, Check, Heart, Smile } from "lucide-react";

interface VibeMatchProps {
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function VibeMatch({ showToast }: VibeMatchProps) {
  // Simulator range sliders states
  const [values, setValues] = useState(85);
  const [comm, setComm] = useState(90);
  const [lifestyle, setLifestyle] = useState(78);
  const [family, setFamily] = useState(88);

  // Overall compatibility score formula
  const overallScore = Math.round((values + comm + lifestyle + family) / 4);

  // Color mappings based on score strength
  const getScoreColor = (score: number) => {
    if (score >= 90) return "linear-gradient(135deg, #059669, #0D9488)"; // Green/teal
    if (score >= 80) return "linear-gradient(135deg, var(--rose), var(--plum))"; // Premium Purple/rose
    return "linear-gradient(135deg, var(--amber), var(--saffron))"; // Amber/yellow
  };

  const handleSliderChange = (type: string, val: number) => {
    if (type === "values") setValues(val);
    if (type === "comm") setComm(val);
    if (type === "lifestyle") setLifestyle(val);
    if (type === "family") setFamily(val);
  };

  const savePreferences = () => {
    showToast(`Compatibility preferences saved! Match threshold set to ${overallScore}%.`, "success");
  };

  return (
    <>
      {/* VIBE MATCH SECTION */}
      <section className="vibe-section">
        <div className="eyebrow">Psychology Matching</div>
        <h2 className="section-title text-white">Find partners who share your frequency</h2>
        <p className="section-sub">
          Our compatibility engine analyses values, communication channels, lifestyle choices, 
          and family expectations to find optimal matches.
        </p>

        <div className="vibe-layout">
          {/* LEFT: INTERACTIVE SIMULATOR CARD */}
          <div className="vibe-card">
            <div className="vibe-header">
              <div className="vibe-names">
                <h3>You & Priya S.</h3>
                <p>25 · Doctor · Madurai Candidate</p>
              </div>
              <div className="vibe-score" style={{ background: getScoreColor(overallScore) }}>
                <span className="vs-num">{overallScore}%</span>
                <span className="vs-lbl">VIBE SCORE</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              {/* Range Slider 1 */}
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Shared Values (Modern vs Traditional)</span>
                  <span>{values}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={values}
                    onChange={(e) => handleSliderChange("values", parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-pink-500"
                  />
                </div>
              </div>

              {/* Range Slider 2 */}
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Communication (Expressive vs Quiet)</span>
                  <span>{comm}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={comm}
                    onChange={(e) => handleSliderChange("comm", parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-pink-500"
                  />
                </div>
              </div>

              {/* Range Slider 3 */}
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Lifestyle Alignment (Active vs Relaxed)</span>
                  <span>{lifestyle}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={lifestyle}
                    onChange={(e) => handleSliderChange("lifestyle", parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-pink-500"
                  />
                </div>
              </div>

              {/* Range Slider 4 */}
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Family Outlook (Joint vs Independent)</span>
                  <span>{family}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={family}
                    onChange={(e) => handleSliderChange("family", parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-pink-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={savePreferences}
              className="w-full py-3 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
            >
              Lock Compatibility Filters
            </button>
          </div>

          {/* RIGHT: COMPATIBILITY ATTRIBUTES */}
          <div className="vibe-feats">
            <div className="vibe-feat">
              <div className="vf-icon">🧠</div>
              <div className="vf-text">
                <h4>Core Alignment Indexes</h4>
                <p>
                  Evaluates fundamental beliefs including religious outlook, social values, 
                  work-life priorities, and ethical benchmarks.
                </p>
              </div>
            </div>

            <div className="vibe-feat">
              <div className="vf-icon">💬</div>
              <div className="vf-text">
                <h4>Communication Dynamics</h4>
                <p>
                  Compares conflict resolution styles, expressiveness, introverted vs extroverted 
                  ratios, and conversational frequency preferences.
                </p>
              </div>
            </div>

            <div className="vibe-feat">
              <div className="vf-icon">🌱</div>
              <div className="vf-text">
                <h4>Lifestyle Synergy Indicators</h4>
                <p>
                  Maps shared dietary values (Veg/Non-veg), leisure hobbies, financial goals, 
                  fitness routines, and travel choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY & ACCOUNT SECURITY */}
      <section style={{ backgroundColor: "var(--surface)" }}>
        <div className="eyebrow">Safety Guidelines</div>
        <h2 className="section-title">Your safety is our absolute priority</h2>
        <p className="section-sub">
          We combine cutting-edge technology with manual checks to ensure a secure matchmaking environment.
        </p>

        <div className="safety-grid">
          <div className="safety-card">
            <div className="safety-icon" style={{ color: "#F2688C" }}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4>Screenshot Protection</h4>
              <p>Our mobile app blocks screen recording and screenshots on profile galleries to keep your images private.</p>
            </div>
          </div>

          <div className="safety-card">
            <div className="safety-icon" style={{ color: "#7C3AED" }}>
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h4>Anti-Fraud Analytics</h4>
              <p>Our systems monitor real-time message logs to flag solicitations, suspicious links, and profile impostors.</p>
            </div>
          </div>

          <div className="safety-card">
            <div className="safety-icon" style={{ color: "#0D9488" }}>
              <EyeOff className="h-5 w-5" />
            </div>
            <div>
              <h4>Name & Photo Blur Options</h4>
              <p>You control who views your photos. Choose to blur photos until you accept a connection request.</p>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY PATH TIMELINE */}
      <section className="journey-section">
        <div className="eyebrow">Your Journey</div>
        <h2 className="section-title text-white">How your path unfolds</h2>
        <p className="section-sub text-white/50">
          A traditional, family-assisted pathway supported by advanced psychology benchmarks.
        </p>

        <div className="journey-grid">
          <div className="j-step done">
            <div className="j-check">
              <Check className="h-3 w-3" />
            </div>
            <span className="j-icon">📝</span>
            <h4>Profile Setup</h4>
            <p>Aadhaar Verified</p>
          </div>

          <div className="j-step active">
            <div className="j-dot"></div>
            <span className="j-icon">🔍</span>
            <h4>Compatibility Analysis</h4>
            <p>Vibe Matching Active</p>
          </div>

          <div className="j-step">
            <div className="j-dot-g"></div>
            <span className="j-icon">💬</span>
            <h4>Safe Connect</h4>
            <p>Ice-breakers & Chat</p>
          </div>

          <div className="j-step">
            <div className="j-dot-g"></div>
            <span className="j-icon">👨‍👩‍👧‍👦</span>
            <h4>Family Alignment</h4>
            <p>Virtual Meet & Greet</p>
          </div>

          <div className="j-step">
            <div className="j-dot-g"></div>
            <span className="j-icon">💍</span>
            <h4>Wedding Bells</h4>
            <p>Happily Ever After</p>
          </div>
        </div>
      </section>
    </>
  );
}