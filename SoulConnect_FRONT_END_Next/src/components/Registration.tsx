"use client";

import { useState, useEffect, useRef } from "react";
import { districts } from "@/data/districts";
import {
  Send,
  User,
  MapPin,
  Briefcase,
  Heart,
  Bot,
  Check,
  UploadCloud,
  FileText,
  X,
  ArrowLeft,
  ShieldCheck,
  Camera,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface RegistrationProps {
  selectedDistrict: string;
  onRegisterSuccess: () => void;
  onOpenPayment: (planName: string, price: string, features: string[]) => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export default function Registration({
  selectedDistrict,
  onRegisterSuccess,
  onOpenPayment,
  showToast,
}: RegistrationProps) {
  // Wizard Step State: 1 = Create Profile, 2 = Plan & Verification
  const [regStep, setRegStep] = useState(1);

  // Tab State for Step 1
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  
  // Manual Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [motherTongue, setMotherTongue] = useState("Tamil");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("Prefer not to say");
  const [height, setHeight] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [preferences, setPreferences] = useState("");

  // Step 2 Selection States
  const [selectedPlan, setSelectedPlan] = useState("Premium Match");
  const [docType, setDocType] = useState("Aadhaar Card");
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Face Match Simulation States
  const [faceMatchStatus, setFaceMatchStatus] = useState<"pending" | "scanning" | "matched">("pending");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);

  // Sync selected district from Districts component
  useEffect(() => {
    if (selectedDistrict) {
      setDistrict(selectedDistrict);
    }
  }, [selectedDistrict]);

  // AI Assistant States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Vanakam! 🙏 I am Soul AI. Tell me about yourself in English, Tamil, or Tanglish (e.g. your age, profession, home district, religion, and hobbies) and I'll create your profile!",
      timestamp: "Just now",
    },
  ]);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);

  // Quick preset bios for AI assistant
  const quickBios = [
    {
      label: "Meera (Doctor, Chennai)",
      text: "I am Meera, 26 years old from Chennai. I work as a resident Doctor in a public hospital. Looking for a software developer or architect partner with values.",
      parsed: {
        name: "Meera",
        age: "26",
        profession: "Doctor",
        location: "Chennai",
        religion: "Hindu",
        education: "PG Degree",
      },
    },
    {
      label: "Karthik (Engineer, Trichy)",
      text: "I am Karthik, 28 years old, Software Engineer living in Trichy. I am tall (6 feet) and love traveling and carnatic music. Looking for a modern partner.",
      parsed: {
        name: "Karthik",
        age: "28",
        profession: "Software / IT",
        location: "Tiruchirappalli",
        religion: "Hindu",
        education: "UG Degree",
      },
    },
  ];

  // Membership Plans Data
  const membershipPlans = [
    {
      id: "free",
      name: "Free Entry",
      price: "₹0",
      description: "Basic listing & search access",
      features: [
        "Create profile (Tamil & English)",
        "Basic district filters",
        "Aadhaar verification request",
        "Receive match suggestions"
      ],
      badge: "Free",
      colorClass: "free"
    },
    {
      id: "premium",
      name: "Premium Match",
      price: "₹2,499",
      description: "3 Months validity — high match rates",
      features: [
        "View direct contact details",
        "Unlimited candidate views",
        "Psychology compatibility index",
        "Highlight profile in searches",
        "Advanced education/job filters"
      ],
      badge: "Premium",
      colorClass: "premium"
    },
    {
      id: "elite",
      name: "Elite Circle",
      price: "₹4,999",
      description: "6 Months validity — dedicated matching",
      features: [
        "All Premium features included",
        "Dedicated relationship manager",
        "1 Free pre-marital counselling session",
        "Featured badge next to name",
        "Enhanced privacy control options"
      ],
      badge: "Elite",
      colorClass: "elite"
    },
    {
      id: "vip",
      name: "Gold VIP",
      price: "₹9,999",
      description: "12 Months validity — ultimate service",
      features: [
        "Dedicated relationship manager",
        "Direct family-to-family meetings",
        "Background verification audit",
        "Unlimited counselling reviews",
        "Premium boosting algorithms"
      ],
      badge: "VIP",
      colorClass: "vip"
    }
  ];

  // First step manual form validation and submit
  const handleManualSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !gender || !mobile || !email || !district) {
      showToast("Please fill in all required fields (Name, DOB, Gender, Mobile, Email, District)", "error");
      return;
    }
    // Transition to Step 2
    setRegStep(2);
    showToast("Profile drafted successfully! Please choose a plan and verify your ID.", "success");
    // Scroll to section top
    const regSection = document.getElementById("register");
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Final step submit
  const handleFinalSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast("Please upload a scanned copy of your ID document to complete verification.", "error");
      return;
    }
    
    // Process registration success callback
    onRegisterSuccess();

    // Trigger membership payment checkout modal if a paid plan is selected
    const selectedPlanData = membershipPlans.find(p => p.name === selectedPlan);
    if (selectedPlanData && selectedPlanData.price !== "₹0") {
      onOpenPayment(
        selectedPlanData.name,
        selectedPlanData.price,
        selectedPlanData.features
      );
    } else {
      showToast("Registration completed successfully on the Free tier!", "success");
    }
  };

  // AI assistant handlers
  const handleSendAiMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsgs = [
      ...chatMessages,
      { sender: "user", text: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ] as ChatMessage[];
    
    setChatMessages(newMsgs);
    setChatInput("");
    setParsing(true);

    setTimeout(() => {
      const foundPreset = quickBios.find(p => p.text === textToSend);
      const mockResult = foundPreset
        ? foundPreset.parsed
        : {
            name: textToSend.split(" ")[2] || "User Profile",
            age: "27",
            profession: "Software / IT",
            location: "Chennai",
            religion: "Hindu",
            education: "UG Degree",
          };

      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `Got it! I have parsed your bio. Here are the details I extracted:
• Name: ${mockResult.name}
• Profession: ${mockResult.profession}
• Hometown: ${mockResult.location}
• Education: ${mockResult.education}
Click 'Apply & Complete Profile' below to populate these fields.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setParsing(false);
      setParsedData(mockResult);
      showToast("AI parsed profile attributes successfully!", "success");
    }, 1500);
  };

  const applyAiProfile = () => {
    if (!parsedData) return;
    setFirstName(parsedData.name);
    setLastName("S");
    setGender(parsedData.name === "Meera" ? "Female" : "Male");
    setDistrict(parsedData.location);
    setProfession(parsedData.profession);
    setEducation(parsedData.education);
    setDob("1998-05-15");
    setMobile("+91 99887 76655");
    setEmail(`${parsedData.name.toLowerCase()}@email.com`);
    
    showToast("Parsed profile details copied to Manual form!", "success");
    setActiveTab("manual");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid file format. Please upload PNG, JPG, or PDF.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max limit is 5MB.", "error");
      return;
    }
    setUploadedFile(file);
    showToast(`${docType} document uploaded successfully!`, "success");
  };

  const triggerDocUpload = () => {
    fileInputRef.current?.click();
  };

  // Mock Camera verification simulator
  const startCameraVerification = () => {
    setShowCameraModal(true);
    setFaceMatchStatus("scanning");
    setScanningProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanningProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFaceMatchStatus("matched");
          setShowCameraModal(false);
          showToast("Live Face Verification successful! Biometric ID matches uploaded document.", "success");
        }, 600);
      }
    }, 300);
  };

  return (
    <section id="register" className="reg-section">
      <div className="eyebrow">Registration</div>
      <h2 className="section-title">
        {regStep === 1 ? "Join in your own way" : "Choose Plan & Verify Identity"}
      </h2>
      <p className="section-sub">
        {regStep === 1
          ? "Choose manual registration for full control, or let our AI assist you for a faster experience."
          : "Secure your match compatibility ratings and access active communication features by finishing setup."}
      </p>

      {/* STEP INDICATOR */}
      <div className="flex justify-center items-center gap-4 my-8">
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
            regStep === 1 
              ? "bg-rose text-white" 
              : "bg-emerald-500 text-white"
          }`}>
            {regStep === 1 ? "1" : "✓"}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${regStep === 1 ? "text-rose" : "text-emerald-500"}`}>
            Profile Details
          </span>
        </div>
        <div className="h-0.5 w-12 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
            regStep === 2 
              ? "bg-rose text-white" 
              : "bg-white/10 text-white/40"
          }`}>
            2
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider ${regStep === 2 ? "text-rose" : "text-white/40"}`}>
            Plans & Verification
          </span>
        </div>
      </div>

      {/* STEP 1: REGISTRATION TABS & PANEL */}
      {regStep === 1 && (
        <>
          <div className="reg-tabs-bar">
            <button
              className={`reg-tab ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              ✍️ Manual Registration
            </button>
            {/* <button
              className={`reg-tab ${activeTab === "auto" ? "active" : ""}`}
              onClick={() => setActiveTab("auto")}
            >
              ⚡ AI-Assisted
            </button> */}
          </div>

          {/* MANUAL PANEL */}
          <div className={`reg-panel ${activeTab === "manual" ? "active" : ""}`}>
            <div className="reg-layout">
              <div className="reg-form-card">
                <div className="reg-form-title">Create your profile</div>
                <div className="reg-form-sub">
                  Fill in your details. Takes about 10 minutes. All fields are private by default.
                </div>

                <div className="form-section-label">Personal Information</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-section-label">Location — Tamil Nadu</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>District (மாவட்டம்)</label>
                    <select
                      id="districtSelect"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.tamil})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Taluk / Town</label>
                    <input
                      type="text"
                      placeholder="Enter your taluk or town"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-section-label">Family & Community</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Religion</label>
                    <select value={religion} onChange={(e) => setReligion(e.target.value)}>
                      <option value="">Select religion</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Caste / Community</label>
                    <input
                      type="text"
                      placeholder="Enter community (optional)"
                      value={caste}
                      onChange={(e) => setCaste(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mother Tongue</label>
                    <select value={motherTongue} onChange={(e) => setMotherTongue(e.target.value)}>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marital Status</label>
                    <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                  </div>
                </div>

                <div className="form-section-label">Education & Career</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Education</label>
                    <select value={education} onChange={(e) => setEducation(e.target.value)}>
                      <option value="">Select highest qualification</option>
                      <option value="10th / SSLC">10th / SSLC</option>
                      <option value="12th / HSC">12th / HSC</option>
                      <option value="Diploma">Diploma</option>
                      <option value="UG Degree">UG Degree</option>
                      <option value="PG Degree">PG Degree</option>
                      <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Profession</label>
                    <select value={profession} onChange={(e) => setProfession(e.target.value)}>
                      <option value="">Select profession</option>
                      <option value="Software / IT">Software / IT</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Teacher / Academic">Teacher / Academic</option>
                      <option value="Govt. Employee">Govt. Employee</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Lawyer">Lawyer</option>
                      <option value="Chartered Accountant">Chartered Accountant</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Annual Income (₹)</label>
                    <select value={income} onChange={(e) => setIncome(e.target.value)}>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Below 3 LPA">Below 3 LPA</option>
                      <option value="3–6 LPA">3–6 LPA</option>
                      <option value="6–10 LPA">6–10 LPA</option>
                      <option value="10–15 LPA">10–15 LPA</option>
                      <option value="15–25 LPA">15–25 LPA</option>
                      <option value="25 LPA+">25 LPA+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Height</label>
                    <select value={height} onChange={(e) => setHeight(e.target.value)}>
                      <option value="">Select height</option>
                      <option value="4'8 - 5'0">4'8" - 5'0"</option>
                      <option value="5'0 - 5'2">5'0" - 5'2"</option>
                      <option value="5'2 - 5'4">5'2" - 5'4"</option>
                      <option value="5'4 - 5'6">5'4" - 5'6"</option>
                      <option value="5'6 - 5'8">5'6" - 5'8"</option>
                      <option value="5'8 - 5'10">5'8" - 5'10"</option>
                      <option value="5'10 - 6'0">5'10" - 6'0"</option>
                      <option value="6'0+">6'0"+</option>
                    </select>
                  </div>
                </div>

                <div className="form-section-label">About You</div>
                <div className="form-group">
                  <label>About yourself</label>
                  <textarea
                    placeholder="Tell potential partners about yourself — your interests, values, and what you're looking for..."
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Partner Preferences</label>
                  <textarea
                    placeholder="Describe your ideal partner — district preference, profession, values..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                  ></textarea>
                </div>

                <button className="btn-form-submit" onClick={handleManualSubmit}>
                  Create Profile & Get Started →
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Free registration. Document verification and plans are configured in the next step.
                </p>
              </div>

              <div className="reg-info-panel">
                <h3 className="font-display text-2xl text-white mb-6 font-bold">Why register manually?</h3>
                <div className="reg-step">
                  <div className="reg-step-num">1</div>
                  <div>
                    <h4>Full control</h4>
                    <p>Every field is yours to fill — no assumptions, no auto-fill surprises. Tell your story exactly as you want it told.</p>
                  </div>
                </div>
                <div className="reg-step">
                  <div className="reg-step-num">2</div>
                  <div>
                    <h4>Tamil & English</h4>
                    <p>Registration available in both Tamil and English. Switch between languages at any time.</p>
                  </div>
                </div>
                <div className="reg-step">
                  <div className="reg-step-num">3</div>
                  <div>
                    <h4>Family-assisted</h4>
                    <p>Parents or siblings can help fill in the form together — ideal for traditional family-led matchmaking.</p>
                  </div>
                </div>
                <div className="reg-step">
                  <div className="reg-step-num">4</div>
                  <div>
                    <h4>Verified within 24 hrs</h4>
                    <p>Once submitted, our validation team reviews and confirms your credentials within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI ASSISTED PANEL */}
          <div className={`reg-panel ${activeTab === "auto" ? "active" : ""}`}>
            <div className="reg-layout">
              <div className="bg-[#17112E] border border-white/10 rounded-3xl p-6 flex flex-col justify-between" style={{ minHeight: "560px" }}>
                
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">Soul AI Matchmaker</h4>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active NLP Agent
                    </p>
                  </div>
                </div>

                {/* Chat message viewport */}
                <div className="flex-1 overflow-y-auto my-4 pr-2 flex flex-col gap-3" style={{ maxHeight: "320px", minHeight: "260px" }}>
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl p-4 max-w-[85%] text-sm ${
                        msg.sender === "ai"
                          ? "bg-white/5 border border-white/10 text-white self-start text-left"
                          : "bg-indigo-600 text-white self-end text-right"
                      }`}
                      style={{ whiteSpace: "pre-line" }}
                    >
                      <p>{msg.text}</p>
                      <span className="block text-[9px] text-white/40 mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  
                  {parsing && (
                    <div className="bg-white/5 border border-white/10 text-white rounded-2xl p-4 max-w-[80%] self-start flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-pink-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs text-gray-400">Soul AI is extracting details...</span>
                    </div>
                  )}
                </div>

                {/* Presets suggestions */}
                <div className="border-t border-white/5 pt-3 mb-2 text-left">
                  <span className="text-[10px] text-gray-400 uppercase block mb-1.5 font-bold tracking-wider">Try quick preset bios:</span>
                  <div className="flex gap-2 flex-wrap">
                    {quickBios.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendAiMessage(preset.text)}
                        className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-white py-1 px-3 rounded-full transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input area */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-pink-500"
                    placeholder="Type your bio (e.g. I am Anand, 27, IT Analyst from Salem...)"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage(chatInput)}
                  />
                  <button
                    onClick={() => handleSendAiMessage(chatInput)}
                    className="h-10 w-10 flex items-center justify-center bg-pink-500 rounded-xl hover:bg-pink-600 transition-colors"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>

              </div>

              <div className="reg-info-panel flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl text-white mb-4 font-bold">⚡ AI-Assisted matching</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Save time and avoid manual registration. Simply write down your profile summary or paste your biodata, and let our NLP model parse and fill the details instantly.
                  </p>

                  <div className="auto-features">
                    <div className="auto-feat">
                      <div className="auto-feat-icon">🚀</div>
                      <div className="auto-feat-text">
                        <h5>3x Faster Setup</h5>
                        <p>Completes profile attributes in under 30 seconds rather than filling form sections one by one.</p>
                      </div>
                    </div>
                    <div className="auto-feat">
                      <div className="auto-feat-icon">🗣️</div>
                      <div className="auto-feat-text">
                        <h5>Natural Language Recognition</h5>
                        <p>Type in Tamil, English, or mixed Tanglish text naturally. Our parser maps synonyms instantly.</p>
                      </div>
                    </div>
                    <div className="auto-feat">
                      <div className="auto-feat-icon">🎯</div>
                      <div className="auto-feat-text">
                        <h5>Dynamic Preview</h5>
                        <p>Review the parsed parameters immediately. Click apply to move them to the form.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {parsedData && (
                  <div className="mt-6 border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-4 text-left animate-in fade-in zoom-in-95 duration-300">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                      <span>✓</span> Parsed Attributes Ready
                    </h4>
                    <p className="text-xs text-gray-300 mb-4">
                      Extracted values: <strong>{parsedData.name}</strong>, <strong>{parsedData.age} yrs</strong>, <strong>{parsedData.profession}</strong> in <strong>{parsedData.location}</strong>.
                    </p>
                    <button
                      onClick={applyAiProfile}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
                    >
                      Apply & Complete Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* STEP 2: MEMBERSHIP & DOCUMENT VERIFICATION */}
      {regStep === 2 && (
        <div className="mx-auto max-w-[1100px] text-center text-white reveal visible animate-in fade-in duration-300">
          <div className="mb-8">
            <h3 className="font-display text-xl font-bold mb-2">1. Select Membership Plan</h3>
            <p className="text-sm text-gray-400">Choose the membership level that suits your matchmaking goals.</p>
          </div>

          {/* Membership Grid */}
          <div className="plans-step-grid">
            {membershipPlans.map((plan) => {
              const isSelected = selectedPlan === plan.name;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`plan-step-card ${
                    isSelected ? "selected" : ""
                  }`}
                >
                  {plan.id === "premium" && (
                    <div className="plan-popular-badge">Most Popular</div>
                  )}

                  <span className={`plan-badge ${plan.colorClass}`}>
                    {plan.badge}
                  </span>

                  <div className="plan-price">{plan.price}</div>
                  <div className="plan-desc">{plan.description}</div>
                  <div className="plan-title">{plan.name}</div>

                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <Check className={`h-4 w-4 ${isSelected ? "text-white" : "text-emerald-500"}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`plan-select-btn ${isSelected ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.name);
                    }}
                  >
                    {isSelected ? "Selected ✓" : "Select Plan"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Secure ID Card */}
          <div className="id-verify-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-violet-500" />
              <h3 className="id-verify-title">Secure Government ID Verification</h3>
            </div>
            <p className="id-verify-sub">
              All uploads are encrypted and processed in compliance with Aadhaar vault directives.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />

            {/* Step 1: Select Doc Type */}
            <div className="id-verify-step-label">
              <span className="id-verify-step-num">1</span>
              <span>Select Identity Document Type</span>
            </div>
            <div className="doc-pills">
              {["Aadhaar Card", "Voter ID", "Driving License", "Passport"].map((type) => (
                <button
                  key={type}
                  className={`doc-pill ${docType === type ? "active" : ""}`}
                  onClick={() => {
                    setDocType(type);
                    if (uploadedFile) {
                      showToast(`Switched verification document type to ${type}. Please re-upload if needed.`, "info");
                    }
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Step 2: Upload File */}
            <div className="id-verify-step-label">
              <span className="id-verify-step-num">2</span>
              <span>Upload Scanned Copy (Front & Back)</span>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-9">
              Ensure full page visibility, text is sharp and unblurred.
            </p>

            {!uploadedFile ? (
              <div
                className={`drag-drop-zone ${isDragActive ? "file-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerDocUpload}
              >
                <UploadCloud className="h-10 w-10 text-violet-500" />
                <span className="drag-drop-title">Drag & Drop or Click to Select File</span>
                <span className="drag-drop-sub">Max file size: 5MB (PNG, JPG, PDF)</span>
              </div>
            ) : (
              <div className="drag-drop-zone file-active relative">
                <FileText className="h-10 w-10 text-emerald-500" />
                <span className="drag-drop-title text-emerald-700">{uploadedFile.name}</span>
                <span className="drag-drop-sub text-emerald-600">
                  Ready to verify ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  className="absolute top-2 right-2 bg-rose text-white p-1 rounded-full hover:bg-rose-dark transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Account Verification & Trust Meter */}
            <div className="trust-meter">
              <h4 className="trust-meter-title">Account Verification & Trust Meter</h4>
              
              <div className="trust-meter-row">
                <span className="meter-label">Level 1: Basic Profile</span>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: "100%" }}></div>
                </div>
                <span className="trust-badge basic font-bold">Basic</span>
              </div>

              <div className="trust-meter-row">
                <span className="meter-label">Level 2: ID Document Approved</span>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: uploadedFile ? "100%" : "0%" }}></div>
                </div>
                <span className={`trust-badge font-bold ${uploadedFile ? "text-emerald-500 approved" : "text-slate-400 pending"}`}>
                  {uploadedFile ? "Submitted" : "Pending"}
                </span>
              </div>

              <div className="trust-meter-row">
                <span className="meter-label">Level 3: Live Face Match</span>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: faceMatchStatus === "matched" ? "100%" : "0%" }}></div>
                </div>
                {faceMatchStatus === "pending" && uploadedFile ? (
                  <button 
                    onClick={startCameraVerification}
                    className="text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold px-3 py-1 rounded-lg transition"
                  >
                    Start Match
                  </button>
                ) : (
                  <span className={`trust-badge font-bold ${
                    faceMatchStatus === "matched" 
                      ? "text-emerald-500 approved" 
                      : "text-slate-400 pending"
                  }`}>
                    {faceMatchStatus === "matched" ? "Matched" : "Pending"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center mt-12">
            <button className="btn-hero-outline" onClick={() => setRegStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile Details
            </button>
            <button className="btn-hero" onClick={handleFinalSubmit}>
              Submit & Complete Registration ✦
            </button>
          </div>
        </div>
      )}

      {/* CAMERA SCANNERS SIMULATOR MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl text-center text-white">
            <h3 className="font-display text-lg font-bold mb-1">Face Recognition Simulator</h3>
            <p className="text-xs text-gray-400 mb-6">Analyzing facial contours to match with uploaded {docType}.</p>

            <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-violet-500 overflow-hidden bg-slate-950 flex items-center justify-center mb-6">
              {/* Mock camera profile silhouette */}
              <div className="h-32 w-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <Camera className="h-10 w-10 text-violet-400" />
              </div>
              {/* Scanner green line */}
              {faceMatchStatus === "scanning" && (
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-md shadow-emerald-500"
                  style={{
                    top: `${scanningProgress}%`,
                    transition: "top 0.2s linear"
                  }}
                />
              )}
            </div>

            <div className="text-sm font-semibold tracking-wider uppercase animate-pulse text-violet-400 mb-1">
              {scanningProgress < 100 ? "Scanning contours..." : "Verification complete"}
            </div>
            <div className="text-xs text-gray-400">
              Progress: {scanningProgress}%
            </div>
          </div>
        </div>
      )}
    </section>
  );
}