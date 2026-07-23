"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import {
  ArrowLeft,
  Share2,
  Flag,
  MoreHorizontal,
  Lock,
  Unlock,
  Upload,
  Camera,
  Check,
  Mic,
  Volume2,
  Trash2,
  Play,
  Square,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useKeycloak } from "@/providers/KeycloakProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loadingProfile, profileError, refreshProfile } =
    useKeycloak();

  const firstName = profile?.first_name || profile?.firstName || "";
  const lastName = profile?.last_name || profile?.lastName || "";
  const nameKit = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Profile";

  const defaultImgObj = Array.isArray(profile?.image)
    ? profile.image.find((img: any) => img.default) || profile.image[0]
    : null;
  const avatarUrl = defaultImgObj?.url;

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(profile?.dob);
  const ageDisplay = calculatedAge ? `${calculatedAge} years` : (profile?.dob || "N/A");

  const locationParts = [profile?.taluk_town, profile?.district, profile?.state].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : "Tamil Nadu";

  const customerId = profile?.customer_id || (profile?._id ? `cid_${profile._id}` : "SC-TN-CUSTOMER");
  console.log('Profile----1,', profile);

  // Page load anim trigger
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Action / State Toggles
  const [isLiked, setIsLiked] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("about");

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
  };

  // Completeness & Uploader States
  const [horoscopeUploaded, setHoroscopeUploaded] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);
  const [casualPhotos, setCasualPhotos] = useState<string[]>([]);
  const [horoscopeFileName, setHoroscopeFileName] = useState("");

  // Calculations
  const completeness =
    78 +
    (horoscopeUploaded ? 10 : 0) +
    (casualPhotos.length > 0 ? 6 : 0) +
    (voiceNoteRecorded ? 6 : 0);

  // References for inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const horoInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording Modal State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Employment Verification Mock
  const [employmentStatus, setEmploymentStatus] = useState<
    "pending" | "submitted" | "verified"
  >("pending");

  // Interaction handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    showToast(
      isLiked
        ? "Removed profile from your liked list"
        : "Added profile to your liked list! ♥",
      isLiked ? "info" : "success",
    );
  };

  const handleShortlist = () => {
    setIsShortlisted(!isShortlisted);
    showToast(
      isShortlisted
        ? "Removed profile from shortlist"
        : "Profile shortlisted! ★",
      isShortlisted ? "info" : "success",
    );
  };

  const handleSendInterest = () => {
    if (interestSent) return;
    setInterestSent(true);
    showToast(
      "Connection interest sent successfully! Priya will be notified.",
      "success",
    );
  };

  const handleSendMessage = () => {
    showToast("Message sent to Priya Krishnamurthy! ✉", "success");
    setMessageSent(true);
  };

  const triggerPhotoUpload = () => {
    photoInputRef.current?.click();
  };

  const triggerHoroUpload = () => {
    horoInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCasualPhotos((prev) => [...prev, imageUrl]);
      showToast("Casual photo uploaded successfully!", "success");
    }
  };

  const handlePhotoUploadTip = () => {
    setActiveTab("photos");
    showToast("Redirected to Photos tab!", "info");
    // Trigger upload after short delay
    setTimeout(() => {
      triggerPhotoUpload();
    }, 300);
  };

  const handleHoroUploadTip = () => {
    setActiveTab("horoscope");
    showToast("Redirected to Horoscope tab!", "info");
    // Trigger upload after short delay
    setTimeout(() => {
      triggerHoroUpload();
    }, 300);
  };

  const handleHoroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setHoroscopeFileName(file.name);
      setHoroscopeUploaded(true);
      showToast("Jathagam / Birth Chart uploaded successfully!", "success");
    }
  };

  // Voice note mock
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setVoiceNoteRecorded(true);
    setShowVoiceModal(false);
    showToast("Voice introduction saved successfully!", "success");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Switch tabs helper
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Modal actions
  const handleVerifyEmployment = () => {
    setEmploymentStatus("submitted");
    showToast(
      "Verification documents submitted. Approval pending within 24 hours.",
      "info",
    );
  };

  return (
    <div className="page-wrapper">
      {/* HERO BANNER */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-pattern"></div>
        <button className="profile-back-btn" onClick={() => router.back()}>
          ← Browse Profiles
        </button>
        <div className="profile-hero-actions">
          <button
            className="hero-action-btn"
            title="Share"
            onClick={() =>
              showToast("Profile link copied to clipboard!", "info")
            }
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="hero-action-btn"
            title="Report"
            onClick={() =>
              showToast(
                "Feedback request sent. Our safety team will review.",
                "info",
              )
            }
          >
            <Flag className="h-4 w-4" />
          </button>
          <button
            className="hero-action-btn"
            title="More"
            onClick={() =>
              showToast("Additional action menu triggered.", "info")
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="profile-layout">
        {/* LEFT COLUMN */}
        <div className="profile-left">
          {/* Main Card */}
          <div className={`profile-card reveal ${isLoaded ? "visible" : ""}`}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar overflow-hidden relative flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nameKit}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{firstName ? firstName[0].toUpperCase() : "P"}</span>
                )}
                {profile?.public_verify && <div className="avatar-verified">✓</div>}
              </div>
              <div className="profile-name">{nameKit}</div>
              {profile?.subscription_type && (
                <div className="mt-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {profile.subscription_type} Plan
                </div>
              )}
              {profile?.approvalStatus && (
                <div className="mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {profile.approvalStatus}
                </div>
              )}
              <div className="profile-tagline">
                {profile?.about_self ||
                  "Looking for a partner equally at home with traditional values and modern growth."}
              </div>
              <div className="profile-location">📍 {locationStr}</div>
              <div className="profile-id">{customerId}</div>
            </div>

            {/* Compatibility Score */}
            <div className="match-score-wrap">
              <div
                className="match-score-ring"
                style={{
                  background: `conic-gradient(var(--rose) 0% 88%, var(--plum-light) 88% 100%)`,
                }}
              >
                <div className="match-score-inner">
                  <div className="match-score-num">88</div>
                  <div className="match-score-pct">%</div>
                </div>
              </div>
              <div className="match-score-info">
                <h4>Strong Compatibility</h4>
                <p>Values, lifestyle & horoscope alignment</p>
                <span className="match-label">✦ Top 5% Match</span>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button
                className="btn-primary"
                onClick={handleSendInterest}
                style={{
                  background: interestSent
                    ? "linear-gradient(135deg, var(--sage), var(--teal))"
                    : "",
                }}
              >
                {interestSent ? "✓ Interest Sent" : "💬 Send Interest"}
              </button>
              <button className="btn-secondary" onClick={handleSendMessage}>
                ✉ Send Message
              </button>
              <div className="btn-row">
                <button
                  className="btn-like"
                  onClick={handleLike}
                  style={{
                    backgroundColor: isLiked ? "var(--rose-light)" : "white",
                    borderColor: isLiked ? "var(--rose)" : "",
                    fontWeight: isLiked ? "700" : "500",
                  }}
                >
                  {isLiked ? "♥ Liked" : "♡ Like"}
                </button>
                <button
                  className="btn-shortlist"
                  onClick={handleShortlist}
                  style={{
                    backgroundColor: isShortlisted
                      ? "var(--amber-light)"
                      : "white",
                    borderColor: isShortlisted ? "var(--amber)" : "",
                    fontWeight: isShortlisted ? "700" : "500",
                  }}
                >
                  {isShortlisted ? "★ Shortlisted" : "★ Shortlist"}
                </button>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="quick-facts">
              <div className="quick-facts-title">Quick Snapshot</div>
              <div className="fact-row">
                <div className="fact-icon">🎂</div>
                <div className="fact-label">Age / DOB</div>
                <div className="fact-value">{ageDisplay}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">📏</div>
                <div className="fact-label">Height</div>
                <div className="fact-value">{profile?.height || "N/A"}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🛕</div>
                <div className="fact-label">Religion / Caste</div>
                <div className="fact-value">
                  {profile?.religion || "N/A"}
                  {profile?.caste ? ` (${profile.caste})` : ""}
                </div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">💼</div>
                <div className="fact-label">Profession</div>
                <div className="fact-value">{profile?.profession || "N/A"}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🎓</div>
                <div className="fact-label">Education</div>
                <div className="fact-value">{profile?.education || "N/A"}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">💰</div>
                <div className="fact-label">Income</div>
                <div className="fact-value">{profile?.annual_income || "N/A"}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">📍</div>
                <div className="fact-label">District</div>
                <div className="fact-value">{profile?.district || "N/A"}</div>
              </div>
              <div className="fact-row">
                <div className="fact-icon">🌐</div>
                <div className="fact-label">Languages</div>
                <div className="fact-value">{profile?.mother_tongue || "Tamil"}</div>
              </div>
            </div>
          </div>

          {/* Profile Completeness Card */}
          <div
            className={`completeness-bar reveal ${isLoaded ? "visible" : ""}`}
            style={{ transitionDelay: ".1s" }}
          >
            <div className="completeness-header">
              <span>Profile Completeness</span>
              <span className="completeness-pct">{completeness}%</span>
            </div>
            <div className="c-track">
              <div
                className="c-fill"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <div className="completeness-tips">
              <div
                className={`c-tip ${horoscopeUploaded ? "completed" : ""}`}
                onClick={handleHoroUploadTip}
              >
                {horoscopeUploaded
                  ? "Horoscope chart added"
                  : "Add horoscope chart (jathagam)"}
              </div>
              <div
                className={`c-tip ${casualPhotos.length > 0 ? "completed" : ""}`}
                onClick={handlePhotoUploadTip}
              >
                {casualPhotos.length > 0
                  ? "Photos uploaded"
                  : "Upload 2 more photos to attract matches"}
              </div>
              <div
                className={`c-tip ${voiceNoteRecorded ? "completed" : ""}`}
                onClick={() => {
                  if (!voiceNoteRecorded) {
                    setShowVoiceModal(true);
                  }
                }}
              >
                {voiceNoteRecorded
                  ? "Voice note introduction saved"
                  : "Record a voice note introduction"}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right">
          {/* Tab Bar */}
          <div
            className={`profile-tabs-bar reveal ${isLoaded ? "visible" : ""}`}
          >
            <button
              className={`ptab ${activeTab === "about" ? "active" : ""}`}
              onClick={() => handleTabClick("about")}
            >
              About
            </button>
            <button
              className={`ptab ${activeTab === "details" ? "active" : ""}`}
              onClick={() => handleTabClick("details")}
            >
              Details
            </button>
            <button
              className={`ptab ${activeTab === "family" ? "active" : ""}`}
              onClick={() => handleTabClick("family")}
            >
              Family
            </button>
            <button
              className={`ptab ${activeTab === "partner" ? "active" : ""}`}
              onClick={() => handleTabClick("partner")}
            >
              Partner Prefs
            </button>
            <button
              className={`ptab ${activeTab === "photos" ? "active" : ""}`}
              onClick={() => handleTabClick("photos")}
            >
              Photos
            </button>
            <button
              className={`ptab ${activeTab === "horoscope" ? "active" : ""}`}
              onClick={() => handleTabClick("horoscope")}
            >
              Horoscope
            </button>
          </div>

          {/* ABOUT TAB PANEL */}
          <div className={`tab-panel ${activeTab === "about" ? "active" : ""}`}>
            <div className={`content-card reveal ${isLoaded ? "visible" : ""}`}>
              <div className="content-card-title">
                <div className="ctitle-icon">✍</div>About Me
              </div>
              <p className="about-text">
                {profile?.about_self ||
                  "Welcome to my profile! I am looking for a partner with shared values and mutual respect to build a meaningful life together."}
              </p>
              {profile?.identity_proff?.url && (
                <div className="mt-4 p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">Identity Proof Document</div>
                      <div className="text-[11px] text-slate-500">Verified document uploaded</div>
                    </div>
                  </div>
                  <a
                    href={profile.identity_proff.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline"
                  >
                    View Document ↗
                  </a>
                </div>
              )}
            </div>

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">✦</div>Interests & Hobbies
              </div>
              <div className="tags-wrap">
                <span className="tag rose">🎨 UX Design</span>
                <span className="tag plum">📚 Historical Fiction</span>
                <span className="tag sage">🏞️ Hiking</span>
                <span className="tag rose">🍳 Cooking</span>
                <span className="tag amber">🎵 Carnatic Music</span>
                <span className="tag plum">🧘 Yoga</span>
                <span className="tag sage">📷 Photography</span>
                <span className="tag rose">🛕 Temple Visits</span>
                <span className="tag amber">✈️ Travel</span>
                <span className="tag plum">🌿 Sustainable Living</span>
              </div>
            </div>

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💫</div>Personality Vibe
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Introvert</span>
                  <span>76%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "76%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Traditional Values</span>
                  <span>82%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "82%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Career-Driven</span>
                  <span>88%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "88%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Family-Oriented</span>
                  <span>94%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "94%" }}></div>
                </div>
              </div>
              <div className="vbar-row">
                <div className="vbar-meta">
                  <span>Adventure Seeker</span>
                  <span>61%</span>
                </div>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ width: "61%" }}></div>
                </div>
              </div>
            </div>

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".3s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🛡</div>Verification Status
              </div>
              <div className="verify-badges">
                <div className="vbadge">
                  <div className="vbadge-icon">📱</div>
                  <div className="vbadge-text">
                    <strong>Mobile</strong>
                    <small>✓ Verified</small>
                  </div>
                </div>
                <div className="vbadge">
                  <div className="vbadge-icon">🪪</div>
                  <div className="vbadge-text">
                    <strong>Aadhaar</strong>
                    <small>✓ Verified</small>
                  </div>
                </div>
                <div className="vbadge">
                  <div className="vbadge-icon">🎓</div>
                  <div className="vbadge-text">
                    <strong>Education</strong>
                    <small>✓ Verified</small>
                  </div>
                </div>
                {employmentStatus === "pending" && (
                  <div className="vbadge pending flex flex-row items-center gap-3">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small
                        className="cursor-pointer hover:underline text-amber"
                        onClick={handleVerifyEmployment}
                      >
                        ⏳ Pending - Click to verify
                      </small>
                    </div>
                  </div>
                )}
                {employmentStatus === "submitted" && (
                  <div className="vbadge pending">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small className="text-amber">
                        ⏳ Documents Submitted
                      </small>
                    </div>
                  </div>
                )}
                {employmentStatus === "verified" && (
                  <div className="vbadge">
                    <div className="vbadge-icon">💼</div>
                    <div className="vbadge-text">
                      <strong>Employment</strong>
                      <small className="text-sage">✓ Verified</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`content-card reveal ${isLoaded ? "visible" : ""}`}
              style={{ transitionDelay: ".4s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💞</div>Profiles You May Like
              </div>
              <div className="similar-grid">
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Ananya's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#F2688C,#7C3AED)",
                    }}
                  >
                    A
                  </div>
                  <div className="sim-name">Ananya, 26</div>
                  <div className="sim-info">Chennai · Software Eng.</div>
                  <div className="sim-match">✓ 94% match</div>
                </div>
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Deepika's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#059669,#0D9488)",
                    }}
                  >
                    D
                  </div>
                  <div className="sim-name">Deepika, 28</div>
                  <div className="sim-info">Coimbatore · Doctor</div>
                  <div className="sim-match">✓ 90% match</div>
                </div>
                <div
                  className="sim-card"
                  onClick={() =>
                    showToast("Opening Ranjani's profile...", "info")
                  }
                >
                  <div
                    className="sim-av"
                    style={{
                      background: "linear-gradient(135deg,#F59E0B,#D97706)",
                    }}
                  >
                    R
                  </div>
                  <div className="sim-name">Ranjani, 25</div>
                  <div className="sim-info">Madurai · Architect</div>
                  <div className="sim-match">✓ 87% match</div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "details" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title">
                <div className="ctitle-icon">👤</div>Personal Details
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{nameKit}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date of Birth</div>
                  <div className="detail-value">{profile?.dob || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Age</div>
                  <div className="detail-value">{ageDisplay}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Gender</div>
                  <div className="detail-value">{profile?.gender || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Height</div>
                  <div className="detail-value">{profile?.height || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Marital Status</div>
                  <div className="detail-value">{profile?.maritial_status || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Mother Tongue</div>
                  <div className="detail-value">{profile?.mother_tongue || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{profile?.email || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">
                    {profile?.phone_code || "+91"} {profile?.phone_number || "N/A"}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">District</div>
                  <div className="detail-value">{profile?.district || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Taluk / Town</div>
                  <div className="detail-value">{profile?.taluk_town || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">State / Zipcode</div>
                  <div className="detail-value">
                    {profile?.state || "N/A"} {profile?.zipcode ? `(${profile.zipcode})` : ""}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🎓</div>Education & Career
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Highest Degree / Education</div>
                  <div className="detail-value">{profile?.education || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Occupation / Profession</div>
                  <div className="detail-value">{profile?.profession || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Annual Income</div>
                  <div className="detail-value">{profile?.annual_income || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Work Location</div>
                  <div className="detail-value">{locationStr}</div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🛕</div>Religious & Community
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Religion</div>
                  <div className="detail-value">{profile?.religion || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Caste</div>
                  <div className="detail-value">{profile?.caste || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Mother Tongue</div>
                  <div className="detail-value">{profile?.mother_tongue || "N/A"}</div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".3s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🌿</div>Lifestyle
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Diet</div>
                  <div className="detail-value">Strict Vegetarian</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Smoking</div>
                  <div className="detail-value">Non-Smoker</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Drinking</div>
                  <div className="detail-value">Non-Drinker</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Living With</div>
                  <div className="detail-value">With Family</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Willing to Relocate</div>
                  <div className="detail-value">Yes, TN preferred</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Interests</div>
                  <div className="detail-value">Yoga, Cooking, Trekking</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAMILY TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "family" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title">
                <div className="ctitle-icon">🏠</div>Family Background
              </div>
              <div className="family-grid">
                <div className="family-item">
                  <div className="family-item-icon">👨</div>
                  <div className="family-item-label">Father</div>
                  <div className="family-item-value">Dr. R. Krishnamurthy</div>
                  <div className="family-item-sub">
                    Retired · IIT Madras Professor
                  </div>
                </div>
                <div className="family-item">
                  <div className="family-item-icon">👩</div>
                  <div className="family-item-label">Mother</div>
                  <div className="family-item-value">Smt. Meenakshi K.</div>
                  <div className="family-item-sub">Homemaker</div>
                </div>
                <div className="family-item">
                  <div className="family-item-icon">👦</div>
                  <div className="family-item-label">Siblings</div>
                  <div className="family-item-value">1 Elder Brother</div>
                  <div className="family-item-sub">
                    Married · Software Engineer, Bengaluru
                  </div>
                </div>
                <div className="family-item">
                  <div className="family-item-icon">🏡</div>
                  <div className="family-item-label">Family Type</div>
                  <div className="family-item-value">Nuclear Family</div>
                  <div className="family-item-sub">
                    Extended family in Mylapore
                  </div>
                </div>
                <div className="family-item">
                  <div className="family-item-icon">💎</div>
                  <div className="family-item-label">Family Status</div>
                  <div className="family-item-value">Upper Middle Class</div>
                  <div className="family-item-sub">
                    Own house in Mylapore, Chennai
                  </div>
                </div>
                <div className="family-item">
                  <div className="family-item-icon">🙏</div>
                  <div className="family-item-label">Family Values</div>
                  <div className="family-item-value">Traditional</div>
                  <div className="family-item-sub">
                    Conservative with modern outlook
                  </div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">📍</div>Location & Native
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Native Place</div>
                  <div className="detail-value">Kumbakonam, Thanjavur</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Current City</div>
                  <div className="detail-value">Chennai, Tamil Nadu</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Native (Tamil)</div>
                  <div
                    className="detail-value"
                    style={{ fontFamily: "var(--font-tamil)" }}
                  >
                    கும்பகோணம், தஞ்சாவூர்
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Grew Up In</div>
                  <div className="detail-value">Mylapore, Chennai</div>
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".2s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💌</div>About the Family
              </div>
              <p className="about-text">
                We are a close-knit Tamil Brahmin family from Kumbakonam, now
                settled in Mylapore, Chennai. My father was a professor at IIT
                Madras; my brother is an engineer in Bengaluru. We believe in
                education, simplicity, and respect — both for each other and for
                our traditions. The family actively participates in community
                and temple events.
              </p>
              <p className="about-text-tamil">
                எங்கள் குடும்பம் தஞ்சாவூர் மாவட்டத்தை சார்ந்தது. தற்போது சென்னை
                மயிலாப்பூரில் குடியிருக்கிறோம். கல்வி மற்றும் ஆன்மீகம் எங்கள்
                குடும்பத்தின் முக்கிய மதிப்புகள்.
              </p>
            </div>
          </div>

          {/* PARTNER PREFS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "partner" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title">
                <div className="ctitle-icon">💞</div>Partner Preferences
              </div>
              <div className="pref-section-label">Basic Expectations</div>
              <div className="pref-row">
                <div className="pref-icon">🎂</div>
                <div className="pref-label">Age Range</div>
                <div className="pref-value">
                  <span className="pref-pill">27 – 33 yrs</span>
                  <span className="pref-flex">flexible</span>
                </div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">📏</div>
                <div className="pref-label">Height</div>
                <div className="pref-value">
                  <span className="pref-pill">5'7" and above</span>
                </div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">💒</div>
                <div className="pref-label">Marital Status</div>
                <div className="pref-value">Never Married preferred</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">🍃</div>
                <div className="pref-label">Diet</div>
                <div className="pref-value">Vegetarian only</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">🚬</div>
                <div className="pref-label">Smoking</div>
                <div className="pref-value">Non-Smoker</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">🍷</div>
                <div className="pref-label">Drinking</div>
                <div className="pref-value">
                  Non-Drinker preferred{" "}
                  <span className="pref-flex">flexible</span>
                </div>
              </div>

              <div className="pref-section-label">Education & Career</div>
              <div className="pref-row">
                <div className="pref-icon">🎓</div>
                <div className="pref-label">Education</div>
                <div className="pref-value">Graduate & above</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">💼</div>
                <div className="pref-label">Occupation</div>
                <div className="pref-value">Any professional field</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">💰</div>
                <div className="pref-label">Income</div>
                <div className="pref-value">
                  <span className="pref-pill">₹8L+ per year</span>
                </div>
              </div>

              <div className="pref-section-label">Religion & Community</div>
              <div className="pref-row">
                <div className="pref-icon">🛕</div>
                <div className="pref-label">Religion</div>
                <div className="pref-value">Hindu preferred</div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">🌐</div>
                <div className="pref-label">Caste</div>
                <div className="pref-value">
                  Tamil Brahmin preferred{" "}
                  <span className="pref-flex">open</span>
                </div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">🌍</div>
                <div className="pref-label">Location</div>
                <div className="pref-value">
                  Tamil Nadu or willing to relocate
                </div>
              </div>

              <div className="pref-section-label">Personality & Lifestyle</div>
              <div className="pref-row">
                <div className="pref-icon">🏠</div>
                <div className="pref-label">Living Setup</div>
                <div className="pref-value">
                  Open to joint or nuclear family
                </div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">💡</div>
                <div className="pref-label">Values</div>
                <div className="pref-value">
                  Family-oriented, respectful, grounded
                </div>
              </div>
              <div className="pref-row">
                <div className="pref-icon">✨</div>
                <div className="pref-label">Personality</div>
                <div className="pref-value">
                  Honest, emotionally mature, ambitious
                </div>
              </div>
            </div>

            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">💬</div>Partner Preferences Overview
              </div>
              <p className="about-text">
                "{profile?.partner_preference ||
                  "Like we mentioned before, your values often inform your dating preferences."}"
              </p>
            </div>
          </div>

          {/* PHOTOS TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "photos" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title">
                <div className="ctitle-icon">📷</div>Profile Photos
              </div>

              {/* Photo Upload Form */}
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <div className="photos-grid">
                {/* Profile Images from API */}
                {Array.isArray(profile?.image) && profile.image.length > 0 &&
                  profile.image.map((imgObj: any, idx: number) => (
                    <div key={idx} className="photo-slot relative overflow-hidden group">
                      <img
                        src={imgObj.url}
                        alt={`Profile image ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {imgObj.default && (
                        <span className="absolute top-2 left-2 text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded shadow">
                          ★ Default
                        </span>
                      )}
                    </div>
                  ))}

                {/* Dynamic Uploads */}
                {casualPhotos.map((url, idx) => (
                  <div key={idx} className="photo-slot relative group">
                    <img
                      src={url}
                      alt={`Uploaded casual ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-rose text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCasualPhotos((prev) =>
                          prev.filter((_, i) => i !== idx),
                        );
                        showToast("Photo deleted", "info");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button Slot */}
                {casualPhotos.length < 2 && (
                  <div
                    className="photo-slot photo-slot-add"
                    onClick={triggerPhotoUpload}
                  >
                    <div className="photo-av">＋</div>
                    <div className="photo-label">Add Photo</div>
                  </div>
                )}
              </div>

              <div className="photos-note">
                <div className="photos-note-icon">💡</div>
                <p>
                  Profiles with 5+ photos get 3× more connection requests.
                  Private photos are only visible after interest is accepted.
                </p>
              </div>
            </div>

            {/* Video Intro Card */}
            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">🎥</div>Video Introduction
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg,var(--plum-light),var(--rose-light))",
                  borderRadius: "var(--radius-sm)",
                  padding: "40px 24px",
                  textAlign: "center",
                  border: "2px dashed rgba(124,58,237,.2)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                  🎬
                </div>
                <div
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 600,
                    color: "var(--plum-dark)",
                    marginBottom: "6px",
                  }}
                >
                  Add a 60-second Video Introduction
                </div>
                <div
                  style={{
                    fontSize: ".78rem",
                    color: "var(--plum)",
                    marginBottom: "16px",
                  }}
                >
                  Profiles with a video get 5× more views
                </div>
                <button
                  className="btn-secondary"
                  style={{ display: "inline-flex", margin: "0 auto" }}
                  onClick={() =>
                    showToast("Video recorder interface loading...", "info")
                  }
                >
                  ▶ Record Now
                </button>
              </div>
            </div>
          </div>

          {/* HOROSCOPE TAB PANEL */}
          <div
            className={`tab-panel ${activeTab === "horoscope" ? "active" : ""}`}
          >
            <div className="content-card reveal visible">
              <div className="content-card-title">
                <div className="ctitle-icon">⭐</div>Horoscope Details
              </div>
              <div className="horoscope-grid">
                <div className="horo-item">
                  <div className="horo-label">Star (Nakshatra)</div>
                  <div className="horo-value">Rohini</div>
                  <div className="horo-value-tamil">ரோகிணி</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Rasi (Moon Sign)</div>
                  <div className="horo-value">Rishabam (Taurus)</div>
                  <div className="horo-value-tamil">ரிஷபம்</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Lagnam (Ascendant)</div>
                  <div className="horo-value">Mithunam (Gemini)</div>
                  <div className="horo-value-tamil">மிதுனம்</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Gothram</div>
                  <div className="horo-value">Vatsa Gothram</div>
                  <div className="horo-value-tamil">வத்ஸ கோத்ரம்</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Date of Birth</div>
                  <div className="horo-value">14 March 1997</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Time of Birth</div>
                  <div className="horo-value">06:34 AM</div>
                  <div className="horo-value-tamil">அதிகாலை</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Place of Birth</div>
                  <div className="horo-value">Kumbakonam</div>
                  <div className="horo-value-tamil">கும்பகோணம்</div>
                </div>
                <div className="horo-item">
                  <div className="horo-label">Dosham</div>
                  <div className="horo-value" style={{ color: "var(--sage)" }}>
                    No Dosham
                  </div>
                  <div
                    className="horo-value-tamil"
                    style={{ color: "var(--sage)" }}
                  >
                    தோஷமில்லை
                  </div>
                </div>
              </div>
              <div className="horo-badge-wrap">
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--sage)" }}
                  ></div>
                  Manglik: No
                </div>
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--plum)" }}
                  ></div>
                  Chevvai Dosham: No
                </div>
                <div className="horo-badge">
                  <div
                    className="hb-dot"
                    style={{ background: "var(--rose)" }}
                  ></div>
                  Rahu-Ketu: Neutral
                </div>
              </div>
            </div>

            {/* JATHAGAM (BIRTH CHART) CARD */}
            <div
              className="content-card reveal visible"
              style={{ transitionDelay: ".1s" }}
            >
              <div className="content-card-title">
                <div className="ctitle-icon">📄</div>Jathagam (Birth Chart)
              </div>

              <input
                type="file"
                ref={horoInputRef}
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleHoroChange}
              />

              {!horoscopeUploaded ? (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,var(--saffron-light),var(--amber-light))",
                    borderRadius: "var(--radius-sm)",
                    padding: "32px 24px",
                    textAlign: "center",
                    border: "1px solid rgba(245,158,11,.2)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                    📜
                  </div>
                  <div
                    style={{
                      fontSize: ".9rem",
                      fontWeight: 600,
                      color: "var(--amber)",
                      marginBottom: "6px",
                    }}
                  >
                    Jathagam / Birth Chart Not Uploaded
                  </div>
                  <p
                    style={{
                      fontSize: ".78rem",
                      color: "var(--ink-60)",
                      marginBottom: "18px",
                      maxWidth: "400px",
                      margin: "0 auto 18px",
                    }}
                  >
                    Add your horoscope chart to calculate detailed planetary
                    compatibility percentages with matching profiles.
                  </p>
                  <button
                    className="btn-secondary"
                    style={{
                      display: "inline-flex",
                      borderColor: "var(--amber)",
                      color: "var(--amber)",
                    }}
                    onClick={triggerHoroUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Upload Jathagam (PDF /
                    Image)
                  </button>
                </div>
              ) : (
                <div
                  className="p-6 rounded-2xl border border-emerald-100"
                  style={{
                    background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-full">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          Birth Chart (Jathagam) Verified
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          File: {horoscopeFileName || "jathagam_priya.pdf"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-xs bg-white text-slate-700 font-medium px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                        onClick={() =>
                          showToast("Viewing chart PDF preview...", "info")
                        }
                      >
                        Preview Chart
                      </button>
                      <button
                        className="text-xs bg-rose text-white font-medium p-2 rounded-xl hover:bg-rose-dark transition"
                        onClick={() => {
                          setHoroscopeUploaded(false);
                          setHoroscopeFileName("");
                          showToast("Horoscope chart deleted", "info");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* VOICE RECORDING MODAL */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
              Record Voice Note
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Introduce yourself, talk about your interests, and what values you
              look for in a partner.
            </p>

            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              {isRecording ? (
                <>
                  <div className="relative mb-4 flex items-center justify-center">
                    <span className="absolute h-10 w-10 animate-ping rounded-full bg-rose/20"></span>
                    <div className="relative h-12 w-12 rounded-full bg-rose flex items-center justify-center text-white">
                      <Mic className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-xl font-bold font-display text-slate-800 animate-pulse">
                    {formatTime(recordingSeconds)}
                  </span>
                  <span className="text-xs text-rose font-medium mt-1 uppercase tracking-widest">
                    Recording...
                  </span>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-4">
                    <Mic className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold font-display text-slate-400">
                    0:00
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1">
                    Ready to Record
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition"
                onClick={() => {
                  if (isRecording) {
                    if (recordingTimerRef.current)
                      clearInterval(recordingTimerRef.current);
                  }
                  setShowVoiceModal(false);
                }}
              >
                Cancel
              </button>
              {!isRecording ? (
                <button
                  className="flex-1 text-sm font-semibold text-white bg-rose hover:bg-rose-dark py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  onClick={startRecording}
                >
                  <Play className="h-4 w-4 fill-white" /> Start
                </button>
              ) : (
                <button
                  className="flex-1 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 fill-white" /> Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
