"use client";

import { useState } from "react";
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

  return (
    <>
      <VibeMatch showToast={showToast} />
      {/* <Navbar /> */}
      {/* <Hero />
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
      /> */}
      {/* <Pricing onOpenPayment={handleOpenPayment} />
      <Verification showToast={showToast} />
      <VibeMatch showToast={showToast} />
      <AppDownload />
      <CTA /> */}
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
