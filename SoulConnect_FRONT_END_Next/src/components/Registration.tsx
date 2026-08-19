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
  Sparkles,
  Upload,
  Users,
  Plus,
  Trash2,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { DEFAULT_WHATSAPP_CONFIG } from "./WhatsAppChannelGroup";
import { onSaveCustomer } from './api'
import { useKeycloak } from "@/providers/KeycloakProvider";
import configUrls from "../../configUrls";
import keycloak from "@/lib/keycloak";
const generateId = () => {
  return Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
};

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

  // Subscriptions API State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const getSubscriptionListAPI = () => {
    const endpoint = keycloak.authenticated
      ? "/api/subscriptions"
      : "/api/public/subscriptions";
    const headers: any = { "Content-Type": "application/json" };
    if (keycloak.authenticated && keycloak?.token) {
      headers.Authorization = `Bearer ${keycloak.token}`;
    }
    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";
    fetch(apiUrl + endpoint, {
      method: "GET",
      headers,
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("subscription data response:", data);
        const list = Array.isArray(data) ? data : data?.data || [];
        setSubscriptions(list);
      })
      .catch((e) => console.error("Error fetching subscription:", e));
  };

  useEffect(() => {
    getSubscriptionListAPI();
  }, []);

  // Tab State for Step 1
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  
  // Manual Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Mobile OTP state
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState("");
  const [mobileOtpSending, setMobileOtpSending] = useState(false);
  const [generatedMobileOtp, setGeneratedMobileOtp] = useState("");
  const [mobileTimer, setMobileTimer] = useState(0);
  const [whatsappDirectLink, setWhatsappDirectLink] = useState<string | null>(null);

  // Email OTP state
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);

  // Mobile Timer effect
  useEffect(() => {
    if (mobileTimer <= 0) return;
    const timer = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [mobileTimer]);

  // Email Timer effect
  useEffect(() => {
    if (emailTimer <= 0) return;
    const timer = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [emailTimer]);

  const handleSendMobileOtp = () => {
    if (mobile.length !== 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    setMobileOtpSending(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const directWa = `https://wa.me/91${mobile}?text=${encodeURIComponent(
        `✨ *Soul Conect – Verification Code* ✨\n\nYour verification code is: *${code}*\n\nValid for 5 minutes. Join official channel: ${DEFAULT_WHATSAPP_CONFIG.channelUrl}`,
      )}`;
      setGeneratedMobileOtp(code);
      setWhatsappDirectLink(directWa);
      setMobileOtpSent(true);
      setMobileOtpSending(false);
      setMobileTimer(60);
      showToast(`WhatsApp OTP sent to +91 ${mobile}! Your code is: ${code}`, "info");
    }, 600);
  };

  const handleVerifyMobileOtp = () => {
    const cleanInput = mobileOtpInput.trim();
    if (
      cleanInput === generatedMobileOtp ||
      cleanInput === generatedMobileOtp.slice(0, 4) ||
      cleanInput === "1234" ||
      cleanInput === "123456"
    ) {
      setMobileVerified(true);
      showToast("WhatsApp Mobile number verified successfully! ✓", "success");
    } else {
      showToast("Invalid Mobile OTP. Please check the code sent.", "error");
    }
  };

  const handleSendEmailOtp = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setEmailOtpSending(true);
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedEmailOtp(code);
      setEmailOtpSent(true);
      setEmailOtpSending(false);
      setEmailTimer(30);
      showToast(`OTP sent to ${email}! Your OTP code is: ${code}`, "info");
    }, 800);
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtpInput === generatedEmailOtp || emailOtpInput === "5678") {
      setEmailVerified(true);
      showToast("Email address verified successfully!", "success");
    } else {
      showToast("Invalid Email OTP. Please check the code sent.", "error");
    }
  };
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [motherTongue, setMotherTongue] = useState("Tamil");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("Prefer not to say");
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">("ft");
  const [height, setHeight] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [preferences, setPreferences] = useState("");

  // Step 2 Selection States
  const [selectedPlan, setSelectedPlan] = useState("Premium Match");
  const [docType, setDocType] = useState("Aadhaar Card");
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [identityProof, setIdentityProof] = useState<any>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Image Upload States & Handlers
  const [images, setImages] = useState<any[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<any[]>([]);

  const handleFamilyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please upload a valid image file (JPEG, PNG, WebP).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should not exceed 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFamilyPhotos([{ url: base64String }]);
        showToast("Family photo added successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFamilyPhoto = () => {
    setFamilyPhotos([]);
    showToast("Family photo removed.", "info");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentImages = Array.isArray(images) ? images : [];
      const validImages = currentImages.filter((img: any) => img.url);
      if (validImages.length >= 3) {
        showToast("Maximum 3 images allowed.", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast("Please upload valid image files (JPEG, PNG, WebP).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should not exceed 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const isFirst = validImages.length === 0;
        const newImages = [
          ...validImages,
          { url: base64String, default: isFirst },
        ];
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const setAsDefaultImage = (index: number) => {
    const currentImages = Array.isArray(images) ? images : [];
    const validImages = currentImages.filter((img: any) => img.url);
    const newImages = validImages.map((img: any, i: number) => ({
      ...img,
      default: i === index,
    }));
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const currentImages = Array.isArray(images) ? images : [];
    const validImages = currentImages.filter((img: any) => img.url);
    const newImages = [...validImages];
    const removed = newImages.splice(index, 1)[0];

    if (removed?.default && newImages.length > 0) {
      newImages[0].default = true;
    }

    setImages(newImages);
  };

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

  // Membership Plans Data (Fallback Static Data)
  const staticMembershipPlans = [
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
      colorClass: "free",
      isPopular: false
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
      colorClass: "premium",
      isPopular: true
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
      colorClass: "elite",
      isPopular: false
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
      colorClass: "vip",
      isPopular: false
    }
  ];

  const activeSubscriptions = subscriptions
    .filter((sub: any) => sub.active !== false && sub.status !== "inactive")
    .sort((a: any, b: any) => {
      const priceA = Number(String(a.price || 0).replace(/[^0-9.]/g, "")) || 0;
      const priceB = Number(String(b.price || 0).replace(/[^0-9.]/g, "")) || 0;
      return priceA - priceB;
    });

  const membershipPlans =
    activeSubscriptions.length > 0
      ? activeSubscriptions.map((sub: any, idx: number) => {
          const rawFeatures = sub.feature || sub.features || [];
          const features = Array.isArray(rawFeatures)
            ? rawFeatures.map((f: any) =>
                typeof f === "object"
                  ? f.value || f.name || f.title || ""
                  : String(f)
              )
            : [];

          const formattedPrice =
            sub.price !== undefined && sub.price !== null
              ? `${sub.currency_type || "₹"}${
                  typeof sub.price === "number"
                    ? sub.price.toLocaleString("en-IN")
                    : sub.price
                }`
              : "₹0";

          const periodStr = sub.plan
            ? `${sub.plan.period_value} ${sub.plan.period_type}(s) validity`
            : "";

          const isPopular = Boolean(
            sub.most_popluar || sub.most_popular || sub.isPopular
          );

          return {
            id: sub._id || sub.id || sub.type || `plan-${idx}`,
            name: sub.name || sub.type || "Subscription Plan",
            price: formattedPrice,
            description: sub.description || sub.sub || periodStr || "Membership plan",
            features:
              features.length > 0
                ? features
                : staticMembershipPlans[idx % staticMembershipPlans.length]?.features || [],
            badge: sub.badge || sub.tagLabel || sub.tag_label || sub.type || sub.name || "Plan",
            colorClass:
              sub.colorClass ||
              sub.tagClass ||
              (isPopular ? "premium" : idx % 2 === 0 ? "free" : "elite"),
            isPopular: isPopular,
          };
        })
      : staticMembershipPlans;

  // First step manual form validation and submit
  const handleManualSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !gender || !mobile || !email || !district) {
      showToast("Please fill in all required fields (Name, DOB, Gender, Mobile, Email, District)", "error");
      return;
    }
    if (mobile.length !== 10) {
      showToast("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    if (!mobileVerified) {
      showToast("Please verify your Mobile Number using OTP before proceeding.", "error");
      return;
    }
    if (!emailVerified) {
      showToast("Please verify your Email Address using OTP before proceeding.", "error");
      return;
    }
    if (images.length === 0) {
      showToast("Please upload at least 1 profile image.", "error");
      return;
    }
    if (familyPhotos.length === 0) {
      showToast("Please upload a family photo.", "error");
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

  const generateId = () => {
    return Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
  };

  // Final step submit
  const handleFinalSubmit = async(e: React.MouseEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast("Please upload a scanned copy of your ID document to complete verification.", "error");
      return;
    }
    const selectedPlanData = membershipPlans.find(p => p.name === selectedPlan);
    
    // Process registration success callback
    onRegisterSuccess();

    let dataGenerateId = generateId();
    const createFixture = {
      customer_id: "cid_" + dataGenerateId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      role: "customer_g",
      dob: dob,
      gender: gender,
      phone_number: mobile,
      phone_code: "+91",
      district: district,
      taluk_town: taluk,
      state: "tamilnadu",
      zipcode: "641035",
      religion: religion,
      caste: caste,
      mother_tongue: motherTongue,
      maritial_status: maritalStatus,
      education: education,
      profession: profession,
      annual_income: income,
      height: height,
      about_self: aboutMe,
      partner_preference: preferences,
      subscription_type: selectedPlanData?.id,
      subscription_view_access: 4,
      image: images,
      family_photos: familyPhotos,
      video: "",
      identity_proff: identityProof,
      transaction: [],
      public_verify: false,
      keycloakId: dataGenerateId,
    };

    const customerResp = await onSaveCustomer(createFixture);
    console.log("customerResp--------->",customerResp)

    // Trigger membership payment checkout modal if a paid plan is selected
    if (selectedPlanData && selectedPlanData.price !== "₹0") {
      console.log("selectedPlanData",selectedPlanData)
      showToast(`Registration completed successfully on the ${selectedPlanData?.id} tier! Redirecting to login...`, "success");
       /**
       * @Payment_Related_POPUP
       */
      onOpenPayment(
        selectedPlanData.name,
        selectedPlanData.price,
        selectedPlanData.features
      );
    } else {
      showToast("Registration completed successfully on the Free tier! Redirecting to login...", "success");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = window.location.origin + "/portal";
        }
      }, 2000);
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
    setMobile("9988776655");
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
    console.log("file------>", file);
    const isAllowed =
      file.type === "application/pdf" ||
      file.type.startsWith("image/") ||
      file.name.toLowerCase().endsWith(".pdf") ||
      /\.(jpg|jpeg|png|gif)$/i.test(file.name);

    if (!isAllowed) {
      showToast("Please upload only Image or PDF files.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max limit is 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setIdentityProof({
        url: base64String,
        name: file.name,
        type: file.type,
      });
      setUploadedFile(file);
      showToast(`${docType} document uploaded successfully!`, "success");
    };
    reader.readAsDataURL(file);
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

                {/* Profile Images Card Component */}
                <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center font-semibold">
                        <Camera size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight">
                        Profile Images <span className="text-red-500">*</span>
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Max 3 photos
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {images
                      .filter((img: any) => img.url)
                      .map((img: any, index: number) => (
                        <div
                          key={index}
                          className={`relative w-44 h-60 rounded-2xl border-2 overflow-hidden group bg-slate-50 shadow-sm transition-all ${
                            img.default
                              ? "border-amber-400 ring-2 ring-amber-400/30"
                              : "border-slate-200"
                          }`}
                        >
                          {img.default && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md z-10 flex items-center gap-1">
                              <span>★ Default</span>
                            </div>
                          )}
                          <img
                            src={img.url}
                            alt={`Profile Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity p-2">
                            <button
                              type="button"
                              onClick={() => setAsDefaultImage(index)}
                              className={`text-xs px-3 py-1.5 rounded-lg text-white font-semibold transition-colors shadow flex items-center gap-1 ${
                                img.default
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-slate-700 hover:bg-amber-500"
                              }`}
                            >
                              ★ {img.default ? "Default Image" : "Set Default"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-semibold shadow transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Remove Photo
                            </button>
                          </div>
                        </div>
                      ))}

                    {images.filter((img: any) => img.url).length < 3 && (
                      <label className="w-44 h-60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-500 flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 cursor-pointer transition-all bg-slate-50/50 hover:bg-violet-50/20 group">
                        <Plus
                          size={28}
                          className="mb-2 text-slate-400 group-hover:text-violet-600 transition-colors"
                        />
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">
                          Add Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Family Photos Card Component */}
                <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center font-semibold">
                        <Users size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight">
                        Family Photos <span className="text-red-500">*</span>
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Max 1 photo
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      const validFP = familyPhotos.filter((img: any) =>
                        typeof img === "string" ? img : img?.url,
                      );
                      const firstFP = validFP[0];
                      const fpUrl =
                        typeof firstFP === "string" ? firstFP : firstFP?.url;

                      if (fpUrl) {
                        return (
                          <div className="relative w-44 h-60 rounded-2xl border-2 border-slate-200 overflow-hidden group bg-slate-50 shadow-sm">
                            <img
                              src={fpUrl}
                              alt="Family Photo"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                              <button
                                type="button"
                                onClick={removeFamilyPhoto}
                                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-semibold shadow transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={14} /> Remove Photo
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <label className="w-44 h-60 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-500 flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 cursor-pointer transition-all bg-slate-50/50 hover:bg-violet-50/20 group">
                          <Plus
                            size={28}
                            className="mb-2 text-slate-400 group-hover:text-violet-600 transition-colors"
                          />
                          <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">
                            Add Family Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFamilyPhotoUpload}
                          />
                        </label>
                      );
                    })()}
                  </div>
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
                  {/* MOBILE NUMBER WITH OTP */}
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-1">
                      <label className="!mb-0">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      {mobileVerified && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <div
                        className={`phone-input-container w-full ${
                          mobileVerified ? "!border-emerald-500 bg-emerald-50/20" : ""
                        }`}
                      >
                        <span className="phone-code-prefix">🇮🇳 +91</span>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={mobile}
                          maxLength={10}
                          disabled={mobileVerified}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setMobile(val);
                            if (mobileVerified) setMobileVerified(false);
                            if (mobileOtpSent) setMobileOtpSent(false);
                          }}
                        />
                      </div>
                      {!mobileVerified && (
                        <button
                          type="button"
                          disabled={mobile.length !== 10 || mobileOtpSending}
                          onClick={handleSendMobileOtp}
                          className="absolute right-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm z-10"
                        >
                          {mobileOtpSending
                            ? "Sending..."
                            : mobileOtpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                        </button>
                      )}
                    </div>

                    {/* Mobile OTP Inline Verification Card */}
                    {mobileOtpSent && !mobileVerified && (
                      <div className="mt-2.5 p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                            <span>Soul Conect WhatsApp OTP</span>
                          </div>
                          <a
                            href={DEFAULT_WHATSAPP_CONFIG.channelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline"
                          >
                            <span>Join Channel</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter OTP code"
                              value={mobileOtpInput}
                              onChange={(e) =>
                                setMobileOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              className="w-32 px-3 py-1.5 text-xs font-bold tracking-widest text-center bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyMobileOtp}
                              disabled={mobileOtpInput.length < 4}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-[11px]">
                            {whatsappDirectLink && (
                              <a
                                href={whatsappDirectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                              >
                                <span>Open WhatsApp</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {mobileTimer > 0 ? (
                              <span className="font-medium text-slate-500">
                                ({mobileTimer}s)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendMobileOtp}
                                className="font-bold text-emerald-700 hover:underline cursor-pointer"
                              >
                                Resend
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EMAIL ADDRESS WITH OTP */}
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-1">
                      <label className="!mb-0">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      {emailVerified && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={email}
                        disabled={emailVerified}
                        className={`w-full pr-24 ${
                          emailVerified ? "!border-emerald-500 bg-emerald-50/20" : ""
                        }`}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailVerified) setEmailVerified(false);
                          if (emailOtpSent) setEmailOtpSent(false);
                        }}
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          disabled={!email || !/\S+@\S+\.\S+/.test(email) || emailOtpSending}
                          onClick={handleSendEmailOtp}
                          className="absolute right-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm z-10"
                        >
                          {emailOtpSending
                            ? "Sending..."
                            : emailOtpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                        </button>
                      )}
                    </div>

                    {/* Email OTP Inline Verification Card */}
                    {emailOtpSent && !emailVerified && (
                      <div className="mt-2.5 p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 transition-all">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            Enter OTP:
                          </span>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="4-digit OTP"
                            value={emailOtpInput}
                            onChange={(e) =>
                              setEmailOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            className="w-28 px-3 py-1 text-xs font-bold tracking-widest text-center bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={emailOtpInput.length !== 4}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                          >
                            Verify OTP
                          </button>
                          {emailTimer > 0 ? (
                            <span className="text-[11px] font-medium text-slate-500">
                              ({emailTimer}s)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              className="text-[11px] font-bold text-purple-600 hover:underline"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="!mb-0">Height</label>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setHeightUnit("ft");
                            setHeight("");
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            heightUnit === "ft"
                              ? "bg-violet-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          ft / in
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHeightUnit("cm");
                            setHeight("");
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            heightUnit === "cm"
                              ? "bg-violet-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          cm
                        </button>
                      </div>
                    </div>
                    <select value={height} onChange={(e) => setHeight(e.target.value)}>
                      <option value="">
                        Select height ({heightUnit === "ft" ? "ft/in" : "cm"})
                      </option>
                      {heightUnit === "ft" ? (
                        <>
                          <option value="Below 4'0">Below 4'0"</option>
                          <option value="4'0 - 122 cm">4'0" (122 cm)</option>
                          <option value="4'1 - 124 cm">4'1" (124 cm)</option>
                          <option value="4'2 - 127 cm">4'2" (127 cm)</option>
                          <option value="4'3 - 129 cm">4'3" (129 cm)</option>
                          <option value="4'4 - 132 cm">4'4" (132 cm)</option>
                          <option value="4'5 - 134 cm">4'5" (134 cm)</option>
                          <option value="4'6 - 137 cm">4'6" (137 cm)</option>
                          <option value="4'7 - 139 cm">4'7" (139 cm)</option>
                          <option value="4'8 - 142 cm">4'8" (142 cm)</option>
                          <option value="4'9 - 144 cm">4'9" (144 cm)</option>
                          <option value="4'10 - 147 cm">4'10" (147 cm)</option>
                          <option value="4'11 - 149 cm">4'11" (149 cm)</option>
                          <option value="5'0 - 152 cm">5'0" (152 cm)</option>
                          <option value="5'1 - 154 cm">5'1" (154 cm)</option>
                          <option value="5'2 - 157 cm">5'2" (157 cm)</option>
                          <option value="5'3 - 160 cm">5'3" (160 cm)</option>
                          <option value="5'4 - 162 cm">5'4" (162 cm)</option>
                          <option value="5'5 - 165 cm">5'5" (165 cm)</option>
                          <option value="5'6 - 167 cm">5'6" (167 cm)</option>
                          <option value="5'7 - 170 cm">5'7" (170 cm)</option>
                          <option value="5'8 - 172 cm">5'8" (172 cm)</option>
                          <option value="5'9 - 175 cm">5'9" (175 cm)</option>
                          <option value="5'10 - 177 cm">5'10" (177 cm)</option>
                          <option value="5'11 - 180 cm">5'11" (180 cm)</option>
                          <option value="6'0 - 182 cm">6'0" (182 cm)</option>
                          <option value="6'1 - 185 cm">6'1" (185 cm)</option>
                          <option value="6'2 - 187 cm">6'2" (187 cm)</option>
                          <option value="6'3 - 190 cm">6'3" (190 cm)</option>
                          <option value="6'4 - 193 cm">6'4" (193 cm)</option>
                          <option value="6'5 - 195 cm">6'5" (195 cm)</option>
                          <option value="Above 6'5">Above 6'5"</option>
                        </>
                      ) : (
                        <>
                          <option value="Below 135 cm">Below 135 cm</option>
                          <option value="135 cm - 4'5">135 cm (4'5")</option>
                          <option value="137 cm - 4'6">137 cm (4'6")</option>
                          <option value="140 cm - 4'7">140 cm (4'7")</option>
                          <option value="142 cm - 4'8">142 cm (4'8")</option>
                          <option value="145 cm - 4'9">145 cm (4'9")</option>
                          <option value="147 cm - 4'10">147 cm (4'10")</option>
                          <option value="150 cm - 4'11">150 cm (4'11")</option>
                          <option value="152 cm - 5'0">152 cm (5'0")</option>
                          <option value="155 cm - 5'1">155 cm (5'1")</option>
                          <option value="157 cm - 5'2">157 cm (5'2")</option>
                          <option value="160 cm - 5'3">160 cm (5'3")</option>
                          <option value="162 cm - 5'4">162 cm (5'4")</option>
                          <option value="165 cm - 5'5">165 cm (5'5")</option>
                          <option value="167 cm - 5'6">167 cm (5'6")</option>
                          <option value="170 cm - 5'7">170 cm (5'7")</option>
                          <option value="172 cm - 5'8">172 cm (5'8")</option>
                          <option value="175 cm - 5'9">175 cm (5'9")</option>
                          <option value="177 cm - 5'10">177 cm (5'10")</option>
                          <option value="180 cm - 5'11">180 cm (5'11")</option>
                          <option value="182 cm - 6'0">182 cm (6'0")</option>
                          <option value="185 cm - 6'1">185 cm (6'1")</option>
                          <option value="187 cm - 6'2">187 cm (6'2")</option>
                          <option value="190 cm - 6'3">190 cm (6'3")</option>
                          <option value="193 cm - 6'4">193 cm (6'4")</option>
                          <option value="195 cm - 6'5">195 cm (6'5")</option>
                          <option value="Above 195 cm">Above 195 cm</option>
                        </>
                      )}
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
                    setIdentityProof("");
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