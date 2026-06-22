"use client";

import { useState } from "react";
import { Shield, Eye, Lock, UploadCloud, Camera, Check } from "lucide-react";

interface VerificationProps {
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function Verification({ showToast }: VerificationProps) {
  const [activeTab, setActiveTab] = useState<"doc" | "live">("doc");
  const [docType, setDocType] = useState<"aadhaar" | "voter" | "dl" | "passport">("aadhaar");
  
  // Document mock upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Live face scan states
  const [scanState, setScanState] = useState<"idle" | "capturing" | "scanning" | "done">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  const handleDocUploadClick = () => {
    if (uploadedFile) {
      setUploadedFile(null);
      setUploadProgress(0);
      return;
    }
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadedFile(`verified_${docType}_proof.jpg`);
        showToast(`Document uploaded and verified successfully!`, "success");
      }
    }, 200);
  };

  const startFaceScan = () => {
    setScanState("capturing");
    setScanLogs(["Activating camera feed...", "Please position your face inside the green guide"]);
    
    // Step 1: Capture face
    setTimeout(() => {
      setScanState("scanning");
      setScanLogs((prev) => [...prev, "Biometric data captured.", "Analyzing facial coordinates..."]);
      
      // Step 2: Scan coordinates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setScanProgress(progress);
        if (progress === 40) {
          setScanLogs((prev) => [...prev, "Matching coordinates with Aadhaar photo..."]);
        } else if (progress === 80) {
          setScanLogs((prev) => [...prev, "Performing liveness test: Blink detected..."]);
        } else if (progress >= 100) {
          clearInterval(interval);
          setScanState("done");
          setScanLogs((prev) => [...prev, "Biometric facial scanning complete.", "Liveness Verified. Badge active!"]);
          showToast("Live Face Verification Successful!", "success");
        }
      }, 600);
    }, 2000);
  };

  const resetFaceScan = () => {
    setScanState("idle");
    setScanProgress(0);
    setScanLogs([]);
  };

  return (
    <section id="verify" className="verify-section">
      <div className="eyebrow">Trust & Security</div>
      <h2 className="section-title">Get verified to double your matches</h2>
      <p className="section-sub">
        Our verification badge gives prospective partners and their families absolute confidence.
      </p>

      <div className="verify-tabs">
        <button
          className={`verify-tab ${activeTab === "doc" ? "active" : ""}`}
          onClick={() => setActiveTab("doc")}
        >
          📂 Document Upload
        </button>
        <button
          className={`verify-tab ${activeTab === "live" ? "active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          🤳 Face Verification
        </button>
      </div>

      <div className="verify-layout">
        {/* LEFT COLUMN: ACTIVE WORKSPACE PANEL */}
        <div>
          {/* TAB 1: DOCUMENT VERIFICATION PANEL */}
          <div className={`verify-panel ${activeTab === "doc" ? "active" : ""}`}>
            <div className="verify-card">
              <div className="verify-card-header">
                <div>
                  <h4>Secure Government ID Verification</h4>
                  <p>All uploads are encrypted and processed in compliance with Aadhaar vault directives.</p>
                </div>
              </div>

              <div className="verify-steps">
                <div className="vstep">
                  <div className={`vstep-num ${uploadedFile ? "done" : ""}`}>
                    {uploadedFile ? "✓" : "1"}
                  </div>
                  <div>
                    <h5>Select Identity Document Type</h5>
                    <div className="doc-pills">
                      <button
                        className={`doc-pill ${docType === "aadhaar" ? "active" : ""}`}
                        onClick={() => { setDocType("aadhaar"); setUploadedFile(null); }}
                      >
                        Aadhaar Card
                      </button>
                      <button
                        className={`doc-pill ${docType === "voter" ? "active" : ""}`}
                        onClick={() => { setDocType("voter"); setUploadedFile(null); }}
                      >
                        Voter ID
                      </button>
                      <button
                        className={`doc-pill ${docType === "dl" ? "active" : ""}`}
                        onClick={() => { setDocType("dl"); setUploadedFile(null); }}
                      >
                        Driving License
                      </button>
                      <button
                        className={`doc-pill ${docType === "passport" ? "active" : ""}`}
                        onClick={() => { setDocType("passport"); setUploadedFile(null); }}
                      >
                        Passport
                      </button>
                    </div>
                  </div>
                </div>

                <div className="vstep">
                  <div className={`vstep-num ${uploadedFile ? "done" : ""}`}>
                    {uploadedFile ? "✓" : "2"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5>Upload Scanned Copy (Front & Back)</h5>
                    <p style={{ marginBottom: "8px" }}>Ensure full page visibility, text is sharp and unblurred.</p>
                    
                    <div className="upload-zone" onClick={handleDocUploadClick}>
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-violet-600 mb-2" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <h5>Uploading document... {uploadProgress}%</h5>
                          <div className="w-full bg-gray-200 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-violet-600 h-1 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      ) : uploadedFile ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-8 w-8 text-emerald-500 mb-2" />
                          <h5 className="text-emerald-600 font-bold">Upload Complete!</h5>
                          <p className="text-xs text-gray-500 mt-1">{uploadedFile}</p>
                          <span className="text-[10px] text-gray-400 mt-3 hover:underline">Click to delete and upload new</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <UploadCloud className="h-8 w-8 text-indigo-500 mb-2" />
                          <h5>Drag & Drop or Click to Select File</h5>
                          <p>Max file size: 5MB (PNG, JPG, PDF)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Trust Score Level Meter */}
              <div className="trust-levels">
                <h5>Account Verification & Trust Meter</h5>
                
                <div className="tlevel">
                  <div className="tlevel-label">Level 1: Basic Profile</div>
                  <div className="tlevel-bar-track">
                    <div className="tlevel-bar-fill bg-violet-400" style={{ width: "100%" }}></div>
                  </div>
                  <div className="tlevel-num" style={{ backgroundColor: "#EDE9FE", color: "#5B21B6" }}>Basic</div>
                </div>

                <div className="tlevel">
                  <div className="tlevel-label">Level 2: ID Document Approved</div>
                  <div className="tlevel-bar-track">
                    <div className="tlevel-bar-fill bg-emerald-500" style={{ width: uploadedFile ? "100%" : "0%" }}></div>
                  </div>
                  <div className="tlevel-num" style={{ backgroundColor: uploadedFile ? "#D1FAE5" : "#F3F4F6", color: uploadedFile ? "#059669" : "#9CA3AF" }}>
                    {uploadedFile ? "+40%" : "Pending"}
                  </div>
                </div>

                <div className="tlevel">
                  <div className="tlevel-label">Level 3: Live Face Match</div>
                  <div className="tlevel-bar-track">
                    <div className="tlevel-bar-fill bg-emerald-500" style={{ width: scanState === "done" ? "100%" : "0%" }}></div>
                  </div>
                  <div className="tlevel-num" style={{ backgroundColor: scanState === "done" ? "#D1FAE5" : "#F3F4F6", color: scanState === "done" ? "#059669" : "#9CA3AF" }}>
                    {scanState === "done" ? "+30%" : "Pending"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: LIVE FACE SCAN PANEL */}
          <div className={`verify-panel ${activeTab === "live" ? "active" : ""}`}>
            <div className="verify-card">
              <div className="verify-card-header">
                <div>
                  <h4>AI Biometric Liveness Verification</h4>
                  <p>Matches facial landmarks to prevent duplicate accounts and photo-spoofs.</p>
                </div>
              </div>

              {/* Mock camera viewport */}
              <div className="p-6">
                <div className="relative mx-auto h-64 w-64 rounded-full border-4 border-dashed border-gray-200 bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                  
                  {scanState === "idle" && (
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Camera preview will appear here</p>
                    </div>
                  )}

                  {(scanState === "capturing" || scanState === "scanning") && (
                    <>
                      {/* Green circle target guides */}
                      <div className="absolute inset-4 rounded-full border-2 border-emerald-500/60 animate-pulse"></div>
                      
                      {/* Biometric overlay dots */}
                      <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                      <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                      <div className="absolute bottom-1/3 left-1/3 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                      <div className="absolute bottom-1/4 right-1/3 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>

                      {/* Moving laser scan lines */}
                      <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-bounce" style={{ animationDuration: "2s" }}></div>

                      <div className="text-center z-10 p-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                          {scanState === "capturing" ? "Locking Camera..." : "SCANNING FACEMAP..."}
                        </span>
                        <p className="text-xs text-white">Keep head steady & blink</p>
                      </div>
                    </>
                  )}

                  {scanState === "done" && (
                    <div className="text-center p-4 z-10">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 mb-2">
                        <Check className="h-8 w-8 text-emerald-400 font-bold" />
                      </div>
                      <p className="text-sm font-bold text-emerald-400">Match Confirmed!</p>
                      <p className="text-[10px] text-gray-400 mt-1">Trust Meter Maxed Out 100%</p>
                    </div>
                  )}
                </div>

                {/* Scan Status Log Panel */}
                {scanLogs.length > 0 && (
                  <div className="mt-4 rounded-xl bg-gray-900 p-4 font-mono text-[11px] text-emerald-400 flex flex-col gap-1 text-left">
                    {scanLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-gray-600">&gt;&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {scanState === "scanning" && (
                      <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
                        <div className="bg-emerald-400 h-1" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  {scanState === "idle" ? (
                    <button
                      onClick={startFaceScan}
                      className="w-full btn-pay flex items-center justify-center gap-2"
                      style={{ height: "46px" }}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Start Biometric Scan</span>
                    </button>
                  ) : (
                    <button
                      onClick={resetFaceScan}
                      className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Reset Biometrics Scan
                    </button>
                  )}
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="live-checks bg-gray-50 border-t border-gray-100">
                <div className="lc-row">
                  <span className="lc-icon">🛡️</span>
                  <span className="lc-label">Liveness Proof Indicator</span>
                  <span className={`lc-status ${scanState === "done" ? "s-pass" : "s-wait"}`}>
                    {scanState === "done" ? "PASS" : "WAITING"}
                  </span>
                </div>
                <div className="lc-row">
                  <span className="lc-icon">📂</span>
                  <span className="lc-label">Aadhaar Photo Mapping Check</span>
                  <span className={`lc-status ${scanState === "done" ? "s-pass" : "s-wait"}`}>
                    {scanState === "done" ? "98% MATCH" : "WAITING"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BENEFITS CHECKLIST */}
        <div className="verify-right-info">
          <div className="verify-point">
            <div className="verify-point-icon" style={{ color: "#F2688C" }}>🛡️</div>
            <div>
              <h4>100% Genuine Profiles Only</h4>
              <p>
                Every candidate is requested to verify using government documents and live facial coordinates. 
                We eliminate spam, fake entries, and matrimonial frauds.
              </p>
            </div>
          </div>

          <div className="verify-point">
            <div className="verify-point-icon" style={{ color: "#7C3AED" }}>🎯</div>
            <div>
              <h4>3x Match Visibility Boost</h4>
              <p>
                Profiles with the green verified badge are prioritised by our compatibility sorting engine 
                and receive three times more responses.
              </p>
            </div>
          </div>

          <div className="verify-point">
            <div className="verify-point-icon" style={{ color: "#0D9488" }}>🔒</div>
            <div>
              <h4>State-of-the-Art Privacy Safe</h4>
              <p>
                Your verification documents are secured inside AES-256 encrypted vaults. They are only utilized 
                for trust scoring and are never shown to other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}