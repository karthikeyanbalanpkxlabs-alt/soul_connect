"use client";

import { useState, useEffect } from "react";
import { districts } from "@/data/districts";
import { Send, User, MapPin, Briefcase, Heart, Bot } from "lucide-react";

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

  const handleManualSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !gender || !mobile || !email || !district) {
      showToast("Please fill in all required fields (Name, DOB, Gender, Mobile, Email, District)", "error");
      return;
    }
    onRegisterSuccess();
    // Open free package upgrade modal as final step of registration
    onOpenPayment(
      "Premium Match",
      "₹2,499",
      ["3 Months Validity", "Unlimited Profile Views", "Direct Contact Info", "1 Verified Badge"]
    );
  };

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
        education: "PG Degree (MD)",
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
        education: "UG Degree (BE)",
      },
    },
  ];

  const handleSendAiMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsgs = [
      ...chatMessages,
      { sender: "user", text: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ] as ChatMessage[];
    
    setChatMessages(newMsgs);
    setChatInput("");
    setParsing(true);

    // Simulate AI parsing delay
    setTimeout(() => {
      // Find matches or defaults
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

  return (
    <section id="register" className="reg-section">
      <div className="eyebrow">Registration</div>
      <h2 className="section-title">Join in your own way</h2>
      <p className="section-sub">
        Choose manual registration for full control, or let our AI assist you for a faster experience.
      </p>

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
              Free registration. Upgrade plans are customizable after creation.
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
    </section>
  );
}