"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Users,
  Bell,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
  Send,
  HeartHandshake,
} from "lucide-react";

export interface WhatsAppChannelProps {
  channelName?: string;
  channelUrl?: string;
  groupUrl?: string;
  supportNumber?: string;
}

export const DEFAULT_WHATSAPP_CONFIG = {
  channelName: "Soul Conect",
  channelUrl: "https://whatsapp.com/channel/0029VbDJafbG8l5C1LnfEh0X",
  groupUrl: "https://chat.whatsapp.com/HwttQwBAS34Ck1az1PlOxQ",
  supportNumber: "+918870588605",
};

/**
 * Floating Quick-Action Widget for Soul Conect WhatsApp Channel & Group
 */
export function WhatsAppChannelFloatingWidget({
  channelName = DEFAULT_WHATSAPP_CONFIG.channelName,
  channelUrl = DEFAULT_WHATSAPP_CONFIG.channelUrl,
  groupUrl = DEFAULT_WHATSAPP_CONFIG.groupUrl,
  supportNumber = DEFAULT_WHATSAPP_CONFIG.supportNumber,
}: WhatsAppChannelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Panel */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-100 shadow-2xl shadow-emerald-950/15 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-600"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-base tracking-tight">{channelName}</h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 fill-emerald-500" />
                </div>
                <p className="text-emerald-100 text-xs font-medium">Official WhatsApp Channel & Hub</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Stay Connected on WhatsApp</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Join our official channel group for real-time match recommendations, astrology notifications, and instant WhatsApp OTP mobile support.
              </p>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Bell className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span className="font-medium">Instant Match Alerts</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">100% Verified Only</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Join "{channelName}" Channel</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </a>

              <a
                href={groupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/60 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Join Community Group</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={`https://wa.me/${supportNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hello Soul Conect team, I need assistance regarding my profile & WhatsApp verification.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Chat with Customer Care on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill / Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40"
        aria-label="Open Soul Conect WhatsApp Channel"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </div>
        <span className="tracking-tight">{channelName} WhatsApp</span>
      </button>
    </div>
  );
}

/**
 * Inline Banner for Soul Conect WhatsApp Channel & Group in Customer Portal / Profile
 */
export function WhatsAppChannelBanner({
  channelName = DEFAULT_WHATSAPP_CONFIG.channelName,
  channelUrl = DEFAULT_WHATSAPP_CONFIG.channelUrl,
  groupUrl = DEFAULT_WHATSAPP_CONFIG.groupUrl,
  onVerifyPhoneClick,
}: WhatsAppChannelProps & { onVerifyPhoneClick?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 md:p-6 shadow-xl border border-emerald-500/20">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 -mb-16 w-56 h-56 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-semibold text-emerald-300">
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-900" />
            <span>Official "{channelName}" WhatsApp Channel & Community</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Connect directly on WhatsApp
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20 shrink-0" />
          </h3>

          <p className="text-emerald-100/85 text-xs md:text-sm leading-relaxed">
            Receive verified matrimonial match recommendations, astrology alerts, and seamless mobile OTP verification directly inside your WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm shadow-md shadow-emerald-500/25 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
            <span>Join {channelName} Channel</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </a>

          <a
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs md:text-sm backdrop-blur-md transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Community Group</span>
          </a>

          {onVerifyPhoneClick && (
            <button
              onClick={onVerifyPhoneClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Verify Mobile OTP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppChannelFloatingWidget;
