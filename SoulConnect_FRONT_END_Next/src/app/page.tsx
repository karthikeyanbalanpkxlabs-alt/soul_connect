"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Districts from "@/components/Districts";
import HowItWorks from "@/components/HowItWorks";
import Registration from "@/components/Registration";
import Pricing from "@/components/Pricing";
import Verification from "@/components/Verification";
import VibeMatch from "@/components/VibeMatch";
import AppDownload from "@/components/AppDownload";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";
import Toast from "@/components/Toast";
import Lottie from "lottie-react";
import loadingAnimation from "./maintenance_V3.json";

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    planName: "",
    price: "",
    features: [] as string[],
  });
  const [isComingSoon, setIsComingSoon] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.origin.includes("soulconect.com") ||
        window.location.origin.includes("local"))
    ) {
      setIsComingSoon(true);
    }

    if (localStorage.getItem("logged_in") === "true") {
      window.location.href = "/portal";
    }
  }, []);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    showToast(
      `Selected district: ${districtName}. Autofilled in registration!`,
      "info",
    );
    // Smooth scroll to register section
    const regSection = document.getElementById("register");
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenPayment = (
    planName: string,
    price: string,
    features: string[],
  ) => {
    setPaymentModal({
      isOpen: true,
      planName,
      price,
      features,
    });
  };

  const handleClosePayment = () => {
    setPaymentModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (isComingSoon) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAFAF8] via-[#FDF8F9] to-[#F5F3FF] text-ink px-6 py-12 relative overflow-hidden select-none">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-rose-light/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-plum-light/40 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 flex flex-col items-center max-w-2xl text-center gap-4 md:gap-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-border-soft shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-plum uppercase font-display">
              Soul Connect
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 font-display bg-gradient-to-r from-ink to-ink-80 bg-clip-text text-transparent">
            Coming Soon
          </h1>

          {/* Lottie Animation Container */}
          <div className="w-full max-w-md md:max-w-lg my-2 px-4 transition-all duration-300 transform hover:scale-[1.01]">
            <Lottie 
              animationData={loadingAnimation} 
              loop={true} 
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          <div className="space-y-3 max-w-lg mt-2">
            <h3 className="text-xl md:text-2xl font-bold text-ink-80 font-body tracking-tight leading-snug">
              We are launching soon!
            </h3>
            <p className="text-sm md:text-base text-ink-60 font-body leading-relaxed">
              We are building a thoughtful matchmaking space. Check back shortly to connect with people who match your vibe.
            </p>
          </div>

          {/* Bottom badge */}
          <div className="text-[11px] font-semibold text-ink-40 uppercase tracking-widest mt-6">
            © {new Date().getFullYear()} Soul Connect. All rights reserved.
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <Hero />
      <Districts
        selectedDistrict={selectedDistrict}
        onSelectDistrict={handleSelectDistrict}
      />
      <HowItWorks />
      <Registration
        selectedDistrict={selectedDistrict}
        onRegisterSuccess={() =>
          showToast(
            "Registration submitted! Proceeding to verification.",
            "success",
          )
        }
        onOpenPayment={handleOpenPayment}
        showToast={showToast}
      />
      <Pricing onOpenPayment={handleOpenPayment} />
      <Verification showToast={showToast} />
      <VibeMatch showToast={showToast} />
      <AppDownload />
      <CTA />
      <Footer />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        planName={paymentModal.planName}
        price={paymentModal.price}
        features={paymentModal.features}
        onClose={handleClosePayment}
        showToast={showToast}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
