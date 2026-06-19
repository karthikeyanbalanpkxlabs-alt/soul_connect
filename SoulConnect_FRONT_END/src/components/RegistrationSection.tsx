import React, { useState, useRef } from "react";

const RegistrationSection = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const fileInputRef = useRef(null);

  const openPayModal = (type) => {
    console.log("Selected Plan:", type);
  };

  return (
    <section id="register" className="reg-section">
      <div className="eyebrow">Registration</div>

      <h2 className="section-title">Join in your own way</h2>

      <p className="section-sub">
        Choose manual registration for full control, or let our AI assist you
        for a faster experience.
      </p>

      <div className="reg-tabs-bar">
        <button
          className={`reg-tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          ✍️ Manual Registration
        </button>

        <button
          className={`reg-tab ${activeTab === "auto" ? "active" : ""}`}
          onClick={() => setActiveTab("auto")}
        >
          ⚡ AI-Assisted
        </button>
      </div>

      {/* MANUAL PANEL */}
      {activeTab === "manual" && (
        <div className="reg-panel active">
          <div className="reg-layout">
            <div className="reg-form-card">
              <div className="reg-form-title">Create your profile</div>

              <div className="reg-form-sub">
                Fill in your details. Takes about 10 minutes. All fields are
                private by default.
              </div>

              <div className="form-section-label">Personal Information</div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Enter first name" />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Enter last name" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select>
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              {/* Continue converting remaining fields the same way */}

              <button
                className="btn-form-submit"
                onClick={() => openPayModal("free")}
              >
                Create Profile & Get Started →
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: ".75rem",
                  color: "var(--ink-40)",
                  marginTop: "12px",
                }}
              >
                Free registration. Premium plans available after profile
                creation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI ASSISTED PANEL */}
      {activeTab === "auto" && (
        <div className="reg-panel active">
          <div className="reg-layout">
            <div className="reg-form-card">
              <div className="reg-form-title">⚡ AI-Assisted Registration</div>

              <div className="reg-form-sub">
                Answer a few quick questions. Our AI builds your full profile
                automatically.
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" placeholder="+91 98765 43210" />
                </div>

                <div className="form-group">
                  <label>OTP Verification</label>
                  <input type="text" placeholder="Enter 6-digit OTP" />
                </div>
              </div>

              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{ marginBottom: "16px" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                />

                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "8px",
                  }}
                >
                  📸
                </div>

                <h5
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  Add your photo
                </h5>

                <p
                  style={{
                    fontSize: ".75rem",
                    color: "var(--ink-40)",
                  }}
                >
                  JPG or PNG · Max 5 MB · Face clearly visible
                </p>
              </div>

              <button
                className="btn-form-submit"
                onClick={() => openPayModal("free")}
              >
                Generate My Profile with AI →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RegistrationSection;
