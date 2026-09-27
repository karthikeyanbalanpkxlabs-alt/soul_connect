"use client";

import { useState, useEffect, useRef } from "react";
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
import Toast from "@/components/Toast";
import Lottie from "lottie-react";
import loadingAnimation from "./maintenance_V3.json";
import configUrls from "../../configUrls";
import { onSaveCustomer } from "@/components/api";
import PaymentStatusModal from "@/components/PaymentStatusModal";

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const hasProcessedPayment = useRef(false);

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    status: "processing" | "success" | "failed";
    email?: string;
    orderId?: string;
    txnId?: string;
    planName?: string;
    amount?: number | string;
    errorMessage?: string;
    retryType?: "account_creation" | "payment";
    retryParams?: any;
  }>({
    isOpen: false,
    status: "processing",
  });

  useEffect(() => {
    console.log("BUILD TEST SEP 16");
    if (
      typeof window !== "undefined" &&
      window.location.origin.includes("//soulconect.com")
    ) {
      setIsComingSoon(true);
    }

    if (localStorage.getItem("logged_in") === "true") {
      window.location.href = "/portal";
    }

    // Check for payment callback query parameters: ?payment=success&order_id=...
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);

      let paymentStatus = "";
      let orderId = "";
      let txnId = "";
      let planName = "";
      let amountVal = "";
      let paymentTypeParam = "";
      let paymentModeParam = "";
      let paymentChannelParam = "";

      for (const [key, value] of queryParams.entries()) {
        const cleanKey = key.trim().toLowerCase();
        const cleanVal = (value || "").replace(/^["']|["']$/g, "").trim();
        if (cleanKey === "payment") {
          paymentStatus = cleanVal.toLowerCase();
        } else if (cleanKey === "order_id" || cleanKey === "orderid") {
          orderId = cleanVal;
        } else if (
          cleanKey === "txn" ||
          cleanKey === "transaction_id" ||
          cleanKey === "txnid"
        ) {
          txnId = cleanVal;
        } else if (cleanKey === "plan" || cleanKey === "subscription_type") {
          planName = cleanVal;
        } else if (cleanKey === "amount") {
          amountVal = cleanVal;
        } else if (
          cleanKey === "payment_type" ||
          cleanKey === "paymenttype" ||
          cleanKey === "pay_type"
        ) {
          paymentTypeParam = cleanVal;
        } else if (
          cleanKey === "payment_mode" ||
          cleanKey === "paymentmode" ||
          cleanKey === "mode"
        ) {
          paymentModeParam = cleanVal;
        } else if (
          cleanKey === "payment_channel" ||
          cleanKey === "paymentchannel" ||
          cleanKey === "channel"
        ) {
          paymentChannelParam = cleanVal;
        }
      }

      if (paymentStatus === "success" && orderId) {
        if (!hasProcessedPayment.current) {
          hasProcessedPayment.current = true;
          setIsComingSoon(false);
          setPaymentModal({
            isOpen: true,
            status: "processing",
            orderId,
            txnId,
            planName,
            amount: amountVal,
          });
          handlePostPaymentAccountCreation(
            orderId,
            txnId,
            planName,
            amountVal,
            paymentTypeParam,
            paymentModeParam,
            paymentChannelParam,
          );
        }
      } else if (paymentStatus === "failed") {
        const reason =
          queryParams.get("reason") ||
          queryParams.get("message") ||
          "Payment processing was declined or cancelled.";

        setIsComingSoon(false);
        showToast(`Payment Failed: ${reason}`, "error");

        let pendingPlan: any = null;
        let regEmail = "";
        try {
          pendingPlan = JSON.parse(
            localStorage.getItem("pending_selected_plan") ||
              sessionStorage.getItem("pending_selected_plan") ||
              "{}",
          );
          const regData = JSON.parse(
            localStorage.getItem("registration_data") ||
              sessionStorage.getItem("registration_data") ||
              "{}",
          );
          regEmail = regData.email || "";
        } catch (_) {}

        setPaymentModal({
          isOpen: true,
          status: "failed",
          orderId: orderId || "",
          txnId: txnId || "",
          planName: planName || pendingPlan?.name || "",
          amount: amountVal || pendingPlan?.price || "",
          email: regEmail,
          errorMessage: reason,
          retryType: "payment",
          retryParams: {
            planName: planName || pendingPlan?.name || "Premium",
            price: amountVal ? `₹${amountVal}` : (pendingPlan?.price || "₹2,499"),
            features: pendingPlan?.features || [],
          },
        });

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, []);

  const handlePostPaymentAccountCreation = async (
    orderId: string,
    txnId: string,
    planName: string,
    amountVal?: string,
    paymentTypeParam?: string,
    paymentModeParam?: string,
    paymentChannelParam?: string,
  ) => {
    try {
      showToast("Payment verified! Creating your account...", "info");

      // 1. Retrieve stored registration data or build valid fixture
      let createFixture: any = null;
      const pendingStr =
        localStorage.getItem("pending_customer_registration") ||
        sessionStorage.getItem("pending_customer_registration");

      if (pendingStr) {
        try {
          createFixture = JSON.parse(pendingStr);
        } catch (e) {
          console.error("Error parsing pending_customer_registration:", e);
        }
      }

      // If no stored fixture found in storage, construct a complete valid fixture
      if (!createFixture) {
        let storedReg: any = {};
        try {
          storedReg =
            JSON.parse(localStorage.getItem("registration_data") || "{}") ||
            JSON.parse(localStorage.getItem("customer") || "{}") ||
            JSON.parse(localStorage.getItem("user") || "{}") ||
            JSON.parse(sessionStorage.getItem("registration_data") || "{}");
        } catch (_) {}

        const randId = Math.random().toString(36).substring(2, 10);
        const email =
          storedReg.email ||
          `customer_${Date.now().toString().slice(-6)}@soulconect.com`;
        const firstName =
          storedReg.firstName ||
          storedReg.first_name ||
          storedReg.name ||
          "SoulConnect";
        const lastName = storedReg.lastName || storedReg.last_name || "Member";
        const phone = storedReg.mobile || storedReg.phone || "9876543210";

        createFixture = {
          customer_id: "cid_" + randId,
          profile_created_for: "For myself",
          whoiam_register: "For myself",
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: "customer_g",
          dob: "1998-01-01",
          gender: "Male",
          phone_number: phone,
          phone_code: "+91",
          email_verified: true,
          phone_verified: true,
          mobile_verified: true,
          is_email_verified: true,
          is_phone_verified: true,
          district: "Chennai",
          taluk_town: "Chennai",
          state: "tamilnadu",
          zipcode: "600001",
          religion: "Hindu",
          caste: "Any",
          mother_tongue: "Tamil",
          maritial_status: "Never Married",
          education: "Graduate",
          profession: "Professional",
          annual_income: "500000",
          height: "5'8\"",
          about_self: "Looking for a life partner.",
          partner_preference: "Compatible partner.",
          subscription_type: planName || "Premium Match",
          subscription_view_access: 4,
          image: [
            {
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
              default: true,
            },
          ],
          family_photos: [
            "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600",
          ],
          video: "",
          identity_proff: "identity_proof_doc",
          transaction: {
            history: [],
          },
          public_verify: false,
          keycloakId: randId,
        };
      }

      // Ensure required image and family_photos fields exist for backend validation
      if (
        !Array.isArray(createFixture.image) ||
        createFixture.image.length === 0
      ) {
        createFixture.image = [
          {
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
            default: true,
          },
        ];
      }
      if (
        !Array.isArray(createFixture.family_photos) ||
        createFixture.family_photos.length === 0
      ) {
        createFixture.family_photos = [
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600",
        ];
      }

      // Determine Plan and Amount
      let paidAmount = 2499;
      if (amountVal && !isNaN(Number(amountVal))) {
        paidAmount = Number(amountVal);
      } else {
        try {
          const planObj = JSON.parse(
            localStorage.getItem("pending_selected_plan") ||
              sessionStorage.getItem("pending_selected_plan") ||
              "{}",
          );
          if (planObj.price) {
            paidAmount =
              parseFloat(planObj.price.replace(/[^0-9.]/g, "")) || 2499;
          }
        } catch (_) {}
      }

      const now = new Date();
      const purchaseDate = now.toISOString();
      const endDt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const expiredDate = endDt.toISOString();

      const targetPlan = (
        planName ||
        createFixture.subscription_type ||
        "premium"
      ).toLowerCase();

      // 2. Prepare transaction data in structured format with order_id and summary
      const dateCode = now.toISOString().slice(0, 10).replace(/-/g, "");
      const finalOrderId = orderId || `ORD${dateCode}0001`;
      const finalTxnId = txnId || `PAY${dateCode}0001`;
      const finalInvoiceNo = `INV${dateCode}0001`;
      const finalAmount = Number(paidAmount) || 100;

      // Dynamically resolve payment_type from callback (netbanking, upi, cc, dc)
      const rawMode = (
        paymentTypeParam ||
        paymentModeParam ||
        paymentChannelParam ||
        ""
      )
        .trim()
        .toLowerCase();

      let dynamicPaymentType = "Omniware NetBanking";
      if (
        rawMode === "upi" ||
        rawMode.includes("upi") ||
        rawMode.includes("gpay") ||
        rawMode.includes("phonepe") ||
        rawMode.includes("paytm")
      ) {
        dynamicPaymentType = "UPI";
      } else if (
        rawMode === "cc" ||
        rawMode.includes("credit") ||
        rawMode === "credit card" ||
        rawMode === "credit_card"
      ) {
        dynamicPaymentType = "CC";
      } else if (
        rawMode === "dc" ||
        rawMode.includes("debit") ||
        rawMode === "debit card" ||
        rawMode === "debit_card"
      ) {
        dynamicPaymentType = "DC";
      } else if (
        rawMode === "nb" ||
        rawMode.includes("netbanking") ||
        rawMode.includes("net_banking") ||
        rawMode.includes("banking")
      ) {
        dynamicPaymentType = paymentChannelParam
          ? `Omniware NetBanking (${paymentChannelParam})`
          : "Omniware NetBanking";
      } else if (paymentTypeParam) {
        dynamicPaymentType = paymentTypeParam;
      }

      const currentPlanHistory = {
        plan: targetPlan,
        purchase_date: purchaseDate,
        expired_date: expiredDate,
        current_plan: true,
        summary: {
          order_id: finalOrderId,
          invoice_no: finalInvoiceNo,
          payment_id: finalTxnId,
          amount: finalAmount,
          tax: 0,
          discount: 0,
          total_amount: finalAmount,
          payment_status: "Success",
          payment_method: "omniware",
          payment_type: dynamicPaymentType,
          currency_type: "₹",
          transaction_date: purchaseDate,
        },
      };

      // Retain existing transaction history if present (marking prior plans as false),
      // otherwise provide structured history entries
      let priorHistory: any[] = [];
      if (
        createFixture.transaction?.history &&
        Array.isArray(createFixture.transaction.history) &&
        createFixture.transaction.history.length > 0
      ) {
        priorHistory = createFixture.transaction.history.map((item: any) => ({
          ...item,
          current_plan: false,
        }));
      } else {
        priorHistory = [];
      }

      createFixture.transaction = {
        history: [currentPlanHistory, ...priorHistory],
      };
      if (createFixture["transaction.history"]) {
        delete createFixture["transaction.history"];
      }
      createFixture.subscription_type = targetPlan;

      // 3. Call public customer create API: const customerResp = await onSaveCustomer(createFixture);
      console.log(
        "Submitting onSaveCustomer after payment success with order_id:",
        orderId,
        createFixture,
      );
      const customerResp = await onSaveCustomer(createFixture);
      console.log("customerResp result:", customerResp);

      if (!customerResp || customerResp.error) {
        const errMsg =
          customerResp?.error ||
          customerResp?.message ||
          "Failed to save customer account.";
        showToast(
          `Payment verified (${finalOrderId}), but account setup returned: ${errMsg}`,
          "error",
        );
        setPaymentModal({
          isOpen: true,
          status: "failed",
          orderId: finalOrderId,
          txnId: finalTxnId,
          planName: targetPlan,
          amount: finalAmount,
          email: createFixture?.email || "",
          errorMessage: `Payment was verified (${finalOrderId}), but creating your account profile returned: ${errMsg}`,
          retryType: "account_creation",
          retryParams: {
            orderId,
            txnId,
            planName,
            amountVal,
            paymentTypeParam,
            paymentModeParam,
            paymentChannelParam,
          },
        });
      } else {
        const registeredEmail =
          customerResp?.email ||
          customerResp?.customer?.email ||
          customerResp?.data?.email ||
          createFixture?.email ||
          "";

        localStorage.removeItem("pending_customer_registration");
        localStorage.removeItem("pending_selected_plan");
        localStorage.removeItem("registration_data");
        sessionStorage.removeItem("pending_customer_registration");
        sessionStorage.removeItem("pending_selected_plan");
        sessionStorage.removeItem("registration_data");

        setPaymentModal({
          isOpen: true,
          status: "success",
          orderId: finalOrderId,
          txnId: finalTxnId,
          planName: targetPlan,
          amount: finalAmount,
          email: registeredEmail,
        });

        showToast(
          `Payment Successful! Order: ${finalOrderId}. An email with your temporary password has been sent.`,
          "success",
        );
      }
    } catch (err: any) {
      console.error("handlePostPaymentAccountCreation error:", err);
      showToast(
        `Error creating account after payment: ${err.message}`,
        "error",
      );
      setPaymentModal({
        isOpen: true,
        status: "failed",
        orderId: orderId,
        txnId: txnId,
        planName: planName,
        amount: amountVal,
        errorMessage: `Payment verified, but an unexpected error occurred while setting up your account: ${err.message}`,
        retryType: "account_creation",
        retryParams: {
          orderId,
          txnId,
          planName,
          amountVal,
          paymentTypeParam,
          paymentModeParam,
          paymentChannelParam,
        },
      });
    } finally {
      // Clean query params so user doesn't re-trigger on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleProceedToPortal = () => {
    setPaymentModal((prev) => ({ ...prev, isOpen: false }));
    if (typeof window !== "undefined") {
      window.location.href = window.location.origin + "/portal";
    }
  };

  const handleModalRetry = () => {
    if (
      paymentModal.retryType === "account_creation" &&
      paymentModal.retryParams
    ) {
      setPaymentModal((prev) => ({
        ...prev,
        status: "processing",
        errorMessage: undefined,
      }));
      const p = paymentModal.retryParams;
      handlePostPaymentAccountCreation(
        p.orderId,
        p.txnId,
        p.planName,
        p.amountVal,
        p.paymentTypeParam,
        p.paymentModeParam,
        p.paymentChannelParam,
      );
    } else {
      // Failure flow: close modal, trigger prefilled fields restore, and scroll to registration form
      setPaymentModal((prev) => ({ ...prev, isOpen: false }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("soulconnect:prefill_registration"),
        );
      }
      setTimeout(() => {
        const regSection = document.getElementById("register");
        if (regSection) {
          regSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  };

  const handleModalClose = () => {
    const wasFailed = paymentModal.status === "failed";
    setPaymentModal((prev) => ({ ...prev, isOpen: false }));
    if (wasFailed) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("soulconnect:prefill_registration"),
        );
      }
      setTimeout(() => {
        const regSection = document.getElementById("register");
        if (regSection) {
          regSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  };

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
    features?: string[],
  ) => {
    // If free plan, no payment needed
    if (!price || price === "₹0" || planName.toLowerCase().includes("free")) {
      const reg = document.getElementById("register");
      if (reg) reg.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const cleanAmount = parseFloat(price.replace(/[^0-9.]/g, "")) || 10;
    let storedEmail = "";
    let storedName = "";
    let storedPhone = "";

    try {
      const userStr =
        localStorage.getItem("user") ||
        localStorage.getItem("customer") ||
        localStorage.getItem("registration_data");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        storedEmail = parsed.email || "";
        storedName = parsed.firstName || parsed.first_name || parsed.name || "";
        storedPhone = parsed.phone || parsed.mobile || "";
      }
    } catch (_) {}

    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";

    // Direct HTML Form Submit to Omniware PG Redirection Endpoint
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${apiUrl}/api/public/payment/omniware/redirect`;

    const appendField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    appendField("plan", planName);
    appendField("amount", String(cleanAmount));
    appendField("email", storedEmail || "customer@soulconect.com");
    appendField("name", storedName || "SoulConnect Member");
    appendField("phone", storedPhone || "9876543210");
    appendField(
      "frontend_redirect",
      typeof window !== "undefined" ? window.location.origin : "",
    );

    document.body.appendChild(form);
    form.submit();
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
              Soul Conect
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
              We are building a thoughtful matchmaking space. Check back shortly
              to connect with people who match your vibe.
            </p>
          </div>

          {/* Bottom badge */}
          <div className="text-[11px] font-semibold text-ink-40 uppercase tracking-widest mt-6">
            © {new Date().getFullYear()} Soul Connect. All rights reserved.
          </div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <PaymentStatusModal
          isOpen={paymentModal.isOpen}
          status={paymentModal.status}
          email={paymentModal.email}
          orderId={paymentModal.orderId}
          txnId={paymentModal.txnId}
          planName={paymentModal.planName}
          amount={paymentModal.amount}
          errorMessage={paymentModal.errorMessage}
          onProceedToPortal={handleProceedToPortal}
          onRetry={handleModalRetry}
          onClose={handleModalClose}
        />
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <Hero />
      {/* <Districts
        selectedDistrict={selectedDistrict}
        onSelectDistrict={handleSelectDistrict}
      /> */}
      <HowItWorks />
      <Pricing /* onOpenPayment={handleOpenPayment} */ />
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
      {/* <Verification showToast={showToast} /> */}
      {/* <VibeMatch showToast={showToast} /> */}
      {/* <AppDownload /> */}
      <CTA />
      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PaymentStatusModal
        isOpen={paymentModal.isOpen}
        status={paymentModal.status}
        email={paymentModal.email}
        orderId={paymentModal.orderId}
        txnId={paymentModal.txnId}
        planName={paymentModal.planName}
        amount={paymentModal.amount}
        errorMessage={paymentModal.errorMessage}
        onProceedToPortal={handleProceedToPortal}
        onRetry={handleModalRetry}
        onClose={handleModalClose}
      />
    </>
  );
}
