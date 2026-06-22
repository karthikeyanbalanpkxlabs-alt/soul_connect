"use client";

import { useState, useEffect } from "react";
import { Play, ArrowRight, MessageSquare, ShieldCheck, Heart } from "lucide-react";

interface ChatBubble {
  id: number;
  sender: "left" | "right";
  text: string;
  visible: boolean;
}

export default function AppDownload() {
  // Simulated chat messages
  const [chatSteps, setChatSteps] = useState<ChatBubble[]>([
    { id: 1, sender: "right", text: "Vanakam Ananya! I saw our compatibility score is 94% ⚡", visible: true },
    { id: 2, sender: "left", text: "Vanakam Karthik! Yes, I read your bio. We share a lot of core values!", visible: false },
    { id: 3, sender: "right", text: "Shall we hop on a safe, blind audio call this weekend?", visible: false },
    { id: 4, sender: "left", text: "I'd love to! Let's invite our family managers too. 😊", visible: false },
  ]);

  const [activeStep, setActiveStep] = useState(1);

  // Auto-play messaging simulation on loop
  useEffect(() => {
    const timer = setInterval(() => {
      setChatSteps((prev) => {
        const nextStep = activeStep + 1;
        if (nextStep > chatSteps.length) {
          // Reset
          setActiveStep(1);
          return prev.map((s, idx) => ({ ...s, visible: idx === 0 }));
        } else {
          setActiveStep(nextStep);
          return prev.map((s) => (s.id <= nextStep ? { ...s, visible: true } : s));
        }
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [activeStep, chatSteps.length]);

  const triggerDownload = (store: string) => {
    alert(`Thank you for interest! Mock download triggered for ${store} app store.`);
  };

  return (
    <section id="app" className="app-section">
      <div className="eyebrow">Soul Connect App</div>
      <h2 className="section-title">Match on the go with our mobile app</h2>
      <p className="section-sub">
        Download our mobile application to receive immediate notifications, initiate secure audio conversations, 
        and browse profiles safely.
      </p>

      <div className="app-layout">
        {/* LEFT: PHONE DUAL PREVIEWS */}
        <div className="app-phones">
          {/* Phone 1: Match score card preview */}
          <div className="app-phone animate-in fade-in slide-in-from-left-8 duration-500">
            <div className="app-phone-inner">
              <div className="app-screen">
                <div className="app-screen-header">
                  <span className="app-brand">SoulMatch</span>
                  <div className="app-notif"></div>
                </div>
                
                <div className="app-match-preview">
                  <div className="app-match-av">A</div>
                  <div className="app-match-name">Ananya, 26</div>
                  <div className="app-match-sub">Chennai · Software Eng.</div>
                  <span className="app-match-score">✓ 94% Match</span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mt-3 text-left">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                    compatibility insight
                  </span>
                  <p className="text-[10px] text-gray-600 leading-normal">
                    Both of you score exceptionally high on shared lifestyle expectations and active career planning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 2: Active secure messaging */}
          <div className="app-phone animate-in fade-in slide-in-from-right-8 duration-500" style={{ marginTop: "32px" }}>
            <div className="app-phone-inner">
              <div className="app-screen flex flex-col justify-between" style={{ minHeight: "280px" }}>
                <div>
                  <div className="app-screen-header">
                    <span className="app-brand">Secure Chat</span>
                    <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                  </div>

                  <div className="app-msgs">
                    {chatSteps
                      .filter((step) => step.visible)
                      .map((step) => (
                        <div
                          key={step.id}
                          className={step.sender === "right" ? "app-msg-r" : "app-msg-l"}
                        >
                          {step.text}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2 flex items-center justify-between mt-2">
                  <div className="text-[8px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span>End-to-End Encrypted</span>
                  </div>
                  <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: TEXT INFO & APP BADGES */}
        <div style={{ textAlign: "left" }} className="flex flex-col justify-center">
          <h3 className="font-display text-2xl font-bold mb-4">
            Exclusive mobile features for verified candidates
          </h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Protect your profile with screenshot filters. Access live video matches. Configure 
            flexible notification alerts so you never miss a verified family communication request.
          </p>

          <div className="app-features">
            <div className="app-feat-row">
              <span>✓</span>
              <span><strong>Audio Rooms:</strong> Initiate blind voice calls without sharing contact numbers.</span>
            </div>
            <div className="app-feat-row">
              <span>✓</span>
              <span><strong>Direct Manager Connect:</strong> Allow parents/guardians to co-manage messages.</span>
            </div>
            <div className="app-feat-row">
              <span>✓</span>
              <span><strong>Live Distancing Check:</strong> Search matching candidates geographically.</span>
            </div>
          </div>

          <div className="app-store-btns">
            <button
              onClick={() => triggerDownload("Apple")}
              className="store-btn"
            >
              <span className="store-btn-icon">🍎</span>
              <div className="store-btn-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </button>
            
            <button
              onClick={() => triggerDownload("Google Play")}
              className="store-btn"
            >
              <span className="store-btn-icon">🤖</span>
              <div className="store-btn-text">
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}