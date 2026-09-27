"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  KeyRound,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";

export interface PaymentStatusModalProps {
  isOpen: boolean;
  status: "processing" | "success" | "failed";
  email?: string;
  orderId?: string;
  txnId?: string;
  planName?: string;
  amount?: number | string;
  errorMessage?: string;
  onProceedToPortal: () => void;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function PaymentStatusModal({
  isOpen,
  status,
  email,
  orderId,
  txnId,
  planName,
  amount,
  errorMessage,
  onProceedToPortal,
  onRetry,
  onClose,
}: PaymentStatusModalProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-redirect countdown in success state
  useEffect(() => {
    if (!isOpen || status !== "success") {
      setCountdown(15);
      setIsPaused(false);
      return;
    }

    if (isPaused) return;

    if (countdown <= 0) {
      onProceedToPortal();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, status, countdown, isPaused, onProceedToPortal]);

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        {status === "success" && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-r from-emerald-300/30 via-violet-300/30 to-rose-300/30 blur-3xl pointer-events-none" />
        )}
        {status === "failed" && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-r from-rose-400/25 via-amber-300/25 to-red-400/25 blur-3xl pointer-events-none" />
        )}

        {/* Close Button (disabled while processing) */}
        {status !== "processing" && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100/70 hover:bg-slate-200/70 rounded-full p-2 transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {/* ======================= PROCESSING STATE ======================= */}
          {status === "processing" && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-violet-600 animate-pulse" />
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Verifying Payment & Account
              </h2>
              <p className="text-sm text-slate-600 max-w-sm leading-relaxed mb-6">
                Please hold on while we verify your transaction and set up your SoulConnect membership.
              </p>

              {orderId && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                  <span className="text-slate-400 font-sans">Order ID:</span>
                  <span className="font-semibold">{orderId}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-6 animate-pulse">
                Please do not refresh or close this browser window...
              </p>
            </div>
          )}

          {/* ======================= SUCCESS STATE ======================= */}
          {status === "success" && (
            <div className="flex flex-col items-center text-center">
              {/* Animated Celebration Icon */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/60 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={44} className="stroke-[2.3]" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-1.5 shadow-sm animate-bounce">
                  <Sparkles size={14} />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5 font-display">
                Payment Successful!
              </h2>
              <p className="text-sm text-slate-600 mb-5">
                Your SoulConnect account has been created and activated.
              </p>

              {/* Order Meta Info Pills */}
              <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-6">
                {planName && (
                  <span className="px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold uppercase tracking-wider">
                    Plan: {planName}
                  </span>
                )}
                {amount !== undefined && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    Paid: ₹{amount}
                  </span>
                )}
                {orderId && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">
                    #{orderId}
                  </span>
                )}
              </div>

              {/* ⭐ CRITICAL TEMPORARY PASSWORD EMAIL CARD ⭐ */}
              <div className="w-full text-left bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-rose-50/30 border border-violet-200/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                    <KeyRound size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                        Check Your Inbox
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-200/70 text-violet-800 px-2 py-0.5 rounded-full">
                        <Mail size={11} /> Email Sent
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      Temporary Password Sent!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      We have sent your <span className="font-semibold text-slate-800">temporary login password</span> to your registered email:
                    </p>

                    {/* Email Display Pill with Copy Button */}
                    {email && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-violet-200 shadow-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Mail size={15} className="text-violet-500 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 font-mono truncate">
                            {email}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="text-[11px] font-semibold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Crucial Instruction Callout */}
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2">
                      <span className="text-amber-600 text-sm mt-0.5">⚠️</span>
                      <p className="text-[11px] text-amber-900 leading-tight">
                        <strong>Important:</strong> Please check your <strong>Inbox</strong> (and <strong>Spam / Junk</strong> folder) to collect your temporary password before signing in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Auto Redirect */}
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={onProceedToPortal}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 hover:from-violet-700 hover:via-purple-700 hover:to-rose-600 text-white font-bold shadow-lg shadow-purple-500/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Proceed to Portal Login</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>

                {/* Redirect Countdown helper */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span>
                    Auto-redirecting to portal in{" "}
                    <strong className="text-slate-700 font-mono">{countdown}s</strong>
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="text-violet-600 hover:underline font-medium cursor-pointer"
                  >
                    {isPaused ? "Resume Countdown" : "Pause Auto-redirect"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================= FAILED STATE ======================= */}
          {status === "failed" && (
            <div className="flex flex-col items-center text-center">
              {/* Failure Icon Badge */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-100 to-red-50 text-rose-600 flex items-center justify-center ring-8 ring-rose-50/60 shadow-lg shadow-rose-500/10 mb-4">
                <XCircle size={44} className="stroke-[2.3]" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5 font-display">
                Payment / Setup Failed
              </h2>
              <p className="text-sm text-slate-600 mb-5 max-w-sm">
                We couldn&apos;t complete your transaction or finalize your account setup.
              </p>

              {/* Error Details Box */}
              <div className="w-full text-left bg-rose-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
                      Reason for failure
                    </h4>
                    <p className="text-xs text-rose-700 leading-relaxed font-medium break-words">
                      {errorMessage ||
                        "Payment transaction was declined or interrupted. No funds were debited."}
                    </p>

                    {(orderId || planName) && (
                      <div className="mt-3 pt-3 border-t border-rose-200/60 flex flex-wrap gap-2 text-[11px] text-rose-800">
                        {orderId && (
                          <span>
                            Reference Order: <strong className="font-mono">{orderId}</strong>
                          </span>
                        )}
                        {planName && <span>• Plan: <strong>{planName}</strong></span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Helpful Advice */}
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Your profile information is safely preserved. You can try the payment again or review your details.
              </p>

              {/* Try Again / Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                  >
                    Close
                  </button>
                )}

                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
