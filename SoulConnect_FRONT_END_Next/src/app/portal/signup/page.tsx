"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ChevronRight
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Form Step/Progress states (simulated or visual)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields State
  const [registerFor, setRegisterFor] = useState<string>("myself");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("+91");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [religion, setReligion] = useState<string>("");
  const [caste, setCaste] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [city, setCity] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [agreeComms, setAgreeComms] = useState<boolean>(true);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleValidationAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!firstName.trim() || !lastName.trim()) {
      showToast("Please enter your first and last name.", "error");
      return;
    }
    if (!gender) {
      showToast("Please select your gender.", "error");
      return;
    }
    if (!dob) {
      showToast("Please enter your date of birth.", "error");
      return;
    }

    // Verify age limit (18+)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      showToast("You must be 18 years or older to register.", "error");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      showToast("Please enter a valid mobile number.", "error");
      return;
    }
    if (!religion) {
      showToast("Please select your religion.", "error");
      return;
    }
    if (!city.trim()) {
      showToast("Please enter your city.", "error");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (!agreeTerms) {
      showToast("You must agree to the Terms of Service and Privacy Policy.", "error");
      return;
    }

    // Form successfully validated!
    showToast("Registration successful! Redirecting to your profile...", "success");
    
    // Simulate redirection after 2 seconds
    setTimeout(() => {
      router.push("/portal/customer");
    }, 2000);
  };

  return (
    <div className="page-wrapper-portal" style={{ paddingTop: "68px" }}>
      {/* AUTH NAV */}
      <nav>
        <Link href="/" className="nav-logo">
          Soul<span>Connect</span>
          <div className="logo-dot"></div>
        </Link>
        <div className="nav-right">
          <Link href="#" className="nav-sign-in" onClick={() => showToast("Login portal is simulated.", "info")}>
            Sign in
          </Link>
          <button className="btn-nav" onClick={() => showToast("You are already on the registration screen.", "info")}>
            Join Free ✦
          </button>
        </div>
      </nav>

      <div className="page-wrapper" style={{ display: "flex", width: "100%", minHeight: "calc(100vh - 68px)", paddingTop: 0 }}>
        {/* LEFT COLUMN: BANNER */}
        <div className="auth-left" style={{ width: "42%", flexShrink: 0 }}>
          <div className="auth-left-bg"></div>
          <div className="auth-left-pattern"></div>
          <div className="auth-left-content">
            <div className="auth-left-eyebrow">✦ Trusted Matrimony Platform</div>
            <h1 className="auth-left-title">
              {"Find your"}
              <br />
              <em>{"life partner"}</em>
              <br />
              {"with intention."}
            </h1>
            <p className="auth-left-subtitle">
              {"Soul Connect blends tradition with modern compatibility — helping families and individuals find meaningful, lasting bonds."}
              <span className="tamil">உங்கள் வாழ்க்கை துணையை கண்டறியுங்கள்</span>
            </p>
            <div className="trust-pills">
              <div className="trust-pill">✓ Verified Profiles</div>
              <div className="trust-pill">🔒 Privacy First</div>
              <div className="trust-pill">⭐ AI Matching</div>
              <div className="trust-pill">🪐 Horoscope Match</div>
            </div>
            
            <div className="auth-testimonial">
              <p className="testimonial-text">
                {"\"We matched on Soul Connect in February, got engaged by Diwali. The compatibility insights were surprisingly accurate — it felt like the platform truly understood us.\""}
              </p>
              <div className="testimonial-author">
                <div className="testimonial-av">A</div>
                <div>
                  <div className="testimonial-name">{"Aarthi & Vikram"}</div>
                  <div className="testimonial-info">Chennai · Married June 2024</div>
                </div>
              </div>
            </div>

            <div className="auth-stat-row">
              <div className="auth-stat">
                <div className="auth-stat-num">4.2L+</div>
                <div className="auth-stat-label">Active Profiles</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-num">38K+</div>
                <div className="auth-stat-label">Successful Matches</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-num">96%</div>
                <div className="auth-stat-label">Verified Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNUP FORM */}
        <div className="auth-right" style={{ flex: "1 1 0%", minWidth: 0 }}>
          <div className="auth-form-wrap">
            {/* Step Indicators */}
            <div className="step-indicator">
              <div className="step-item" onClick={() => setCurrentStep(1)}>
                <div className={`step-circle ${currentStep >= 1 ? "active" : "future"}`}>1</div>
                <span className={`step-label ${currentStep === 1 ? "active" : ""}`}>Account</span>
              </div>
              <div className="step-connector"></div>
              <div className="step-item" onClick={() => setCurrentStep(2)}>
                <div className={`step-circle ${currentStep >= 2 ? "active" : "future"}`}>2</div>
                <span className={`step-label ${currentStep === 2 ? "active" : ""}`}>Profile</span>
              </div>
              <div className="step-connector"></div>
              <div className="step-item" onClick={() => setCurrentStep(3)}>
                <div className={`step-circle ${currentStep >= 3 ? "active" : "future"}`}>3</div>
                <span className={`step-label ${currentStep === 3 ? "active" : ""}`}>Preferences</span>
              </div>
              <div className="step-connector"></div>
              <div className="step-item" onClick={() => setCurrentStep(4)}>
                <div className={`step-circle ${currentStep >= 4 ? "active" : "future"}`}>4</div>
                <span className={`step-label ${currentStep === 4 ? "active" : ""}`}>Horoscope</span>
              </div>
            </div>

            <div>
              <h2 className="auth-title">Create your profile</h2>
              <p className="auth-subtitle">
                {"Already have an account? "}
                <Link href="#" onClick={() => showToast("Login portal is simulated.", "info")}>
                  Sign in to your account →
                </Link>
              </p>
            </div>

            {/* Social Authentication */}
            <div className="social-auth">
              <button className="btn-social" onClick={() => showToast("Google Sign-In clicked (Simulated).", "info")}>
                Google
              </button>
              <button className="btn-social" onClick={() => showToast("Phone authentication clicked (Simulated).", "info")}>
                📱 Phone
              </button>
            </div>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">or fill in your details</span>
              <div className="divider-line"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleValidationAndSubmit}>
              <div className="form-section-label">About You</div>

              <div className="form-group">
                <label className="form-label">
                  Registering for <span className="required">*</span>
                </label>
                <div className="gender-toggle">
                  <button
                    type="button"
                    className={`gender-btn ${registerFor === "myself" ? "active" : ""}`}
                    onClick={() => setRegisterFor("myself")}
                  >
                    🙋 For myself
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${registerFor === "son" ? "active" : ""}`}
                    onClick={() => setRegisterFor("son")}
                  >
                    👦 For my son
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${registerFor === "daughter" ? "active" : ""}`}
                    onClick={() => setRegisterFor("daughter")}
                  >
                    👧 For my daughter
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon"><User className="h-4 w-4 text-gray-400" /></span>
                    <input
                      id="firstName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Priya"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Krishnamurthy"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">
                    Gender <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <select
                    id="gender"
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dob">
                    Date of Birth <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section-label">Contact Details</div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required" style={{ color: "var(--rose)" }}>*</span>
                </label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><Mail className="h-4 w-4 text-gray-400" /></span>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Mobile Number <span className="required" style={{ color: "var(--rose)" }}>*</span>
                </label>
                <div className="phone-wrap">
                  <select
                    className="form-select phone-code"
                    style={{ width: "110px", flexShrink: 0 }}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="98765 43210"
                    style={{ flex: 1 }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="form-hint">OTP will be sent for mobile verification</div>
              </div>

              <div className="form-section-label">Community & Location</div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="religion">
                    Religion <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <select
                    id="religion"
                    className="form-select"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="caste">
                    Caste / Community
                  </label>
                  <input
                    id="caste"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Iyer, Mudaliar"
                    value={caste}
                    onChange={(e) => setCaste(e.target.value)}
                  />
                  <div className="form-hint">Optional</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="country">
                    Country <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <select
                    id="country"
                    className="form-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="UAE">UAE</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City <span className="required" style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon"><MapPin className="h-4 w-4 text-gray-400" /></span>
                    <input
                      id="city"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Chennai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-label">Set Password</div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="required" style={{ color: "var(--rose)" }}>*</span>
                </label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><Lock className="h-4 w-4 text-gray-400" /></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="form-input-suffix" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPwd">
                  Confirm Password <span className="required" style={{ color: "var(--rose)" }}>*</span>
                </label>
                <div className="form-input-wrap">
                  <span className="form-input-icon"><Lock className="h-4 w-4 text-gray-400" /></span>
                  <input
                    id="confirmPwd"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="form-input-suffix" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label className="checkbox-label" htmlFor="terms">
                      {"I agree to the "}
                      <Link href="#">Terms of Service</Link>
                      {" and "}
                      <Link href="#">Privacy Policy</Link>
                      {". I confirm I am 18 years or older."}
                    </label>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "10px" }}>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="comms"
                      checked={agreeComms}
                      onChange={(e) => setAgreeComms(e.target.checked)}
                    />
                    <label className="checkbox-label" htmlFor="comms">
                      {"Send me match alerts and profile suggestions by email and WhatsApp."}
                    </label>
                  </div>
                </div>
              </div>

              <div className="auth-notice">
                <span className="auth-notice-icon">ℹ</span>
                <p>
                  {"Your profile will be reviewed and verified before going live. Verified profiles get "}
                  <strong>3× more matches</strong>.
                </p>
              </div>

              <button type="submit" className="btn-submit">
                {"Create My Profile "}
                <ChevronRight className="h-5 w-5" />
              </button>
            </form>

            <div className="auth-already">
              {"Already a member? "}
              <Link href="#" onClick={() => showToast("Login portal is simulated.", "info")}>
                Sign in to your account →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
