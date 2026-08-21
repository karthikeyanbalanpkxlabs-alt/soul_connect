"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import configUrls from "../../../configUrls";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sentEmailAddress, setSentEmailAddress] = useState("");

  // Countdown timer for resend email cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return "Email address is required";
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      return "Please enter a valid email address (e.g. name@example.com)";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldError) setFieldError("");
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validation = validateEmail(email);
    if (validation) {
      setFieldError(validation);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setFieldError("");

    try {
      const endpoint = `${configUrls.apiUrl}/api/public/forgot-password`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Negative flow: Error response
        const message =
          data.message || "Failed to send password reset email. Please try again.";
        setErrorMsg(message);
        setLoading(false);
        return;
      }

      // Positive flow: Success response
      setIsSent(true);
      setSentEmailAddress(email.trim());
      setCountdown(60);
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      setErrorMsg(
        "Network connection error. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0 || loading) return;
    handleSubmit();
  };

  const getLoginUrl = () => {
    return typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "http://localhost:5174/#login"
      : "https://auth.soulconect.com";
  };

  return (
    <>
      {/* GOOGLE FONTS */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Sans+Tamil:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* TOP NAVIGATION */}
      <nav className="sc-nav">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.href =
              typeof window !== "undefined" &&
              ["localhost", "127.0.0.1"].includes(window.location.hostname)
                ? "http://localhost:5174/"
                : "https://soulconect.com/";
          }}
          className="sc-nav-logo"
        >
          Soul<span>Conect</span>
          <div className="sc-logo-dot"></div>
        </a>

        <div className="sc-nav-right">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.href =
                typeof window !== "undefined" &&
                ["localhost", "127.0.0.1"].includes(window.location.hostname)
                  ? "http://localhost:5174/#profiles"
                  : "https://soulconect.com/#profiles";
            }}
            className="sc-nav-link"
          >
            Browse Profiles
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.href =
                typeof window !== "undefined" &&
                ["localhost", "127.0.0.1"].includes(window.location.hostname)
                  ? "http://localhost:5174/#register"
                  : "https://soulconect.com/#register";
            }}
            className="sc-btn-nav"
          >
            Join Free ✦
          </a>
        </div>
      </nav>

      {/* PAGE WRAPPER */}
      <div className="sc-page-wrapper">
        {/* FORM SIDE (LEFT) */}
        <div className="sc-auth-form-side">
          <div className="sc-auth-form-wrap">
            <a
              href="#"
              className="sc-auth-back"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = getLoginUrl();
              }}
            >
              ← Back to Sign In
            </a>

            <div style={{ marginTop: "12px" }}>
              <div className="sc-auth-title">
                {isSent ? "Check Your Inbox 📩" : "Forgot Your Password? 🔑"}
              </div>
              <div className="sc-auth-subtitle">
                {isSent
                  ? "We have sent password reset instructions to your email address."
                  : "Enter your email address or username and we will send you instructions on how to create a new password."}
              </div>
            </div>

            {/* NEGATIVE FLOW: SERVER ERROR BANNER */}
            {errorMsg && (
              <div
                className="sc-alert sc-alert-error"
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #f87171",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginTop: "16px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* POSITIVE FLOW: SUCCESS DISPLAY */}
            {isSent ? (
              <div style={{ marginTop: "24px" }}>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#166534",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Instructions sent to:
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#15803d",
                      wordBreak: "break-all",
                    }}
                  >
                    {sentEmailAddress}
                  </span>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#166534",
                      marginTop: "10px",
                      lineHeight: "1.5",
                      marginBottom: 0,
                    }}
                  >
                    Please check your inbox (and spam folder). Click the link in the
                    email to reset your password.
                  </p>
                </div>

                <button
                  type="button"
                  className="sc-btn-submit"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  style={{
                    opacity: countdown > 0 || loading ? 0.65 : 1,
                    cursor: countdown > 0 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend Email in ${countdown}s`
                    : "Resend Reset Instructions ✦"}
                </button>

                <div className="sc-auth-already" style={{ marginTop: "20px" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSent(false);
                      setErrorMsg("");
                    }}
                  >
                    Use a different email address →
                  </a>
                </div>
              </div>
            ) : (
              /* INPUT FORM STATE */
              <form
                id="kc-reset-password-form"
                onSubmit={handleSubmit}
                noValidate
                style={{ marginTop: "24px" }}
              >
                <div className="sc-form-group">
                  <label className="sc-form-label" htmlFor="username">
                    Email Address
                  </label>
                  <div className="sc-form-input-wrap">
                    <span className="sc-form-input-icon">✉</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="sc-form-input"
                      placeholder="you@example.com"
                      autoFocus
                      value={email}
                      onChange={handleEmailChange}
                      disabled={loading}
                      style={{
                        borderColor: fieldError ? "#ef4444" : undefined,
                      }}
                    />
                  </div>

                  {/* NEGATIVE FLOW: FIELD ERROR */}
                  {fieldError && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "12px",
                        marginTop: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {fieldError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="sc-btn-submit"
                  disabled={loading}
                  style={{
                    marginTop: "24px",
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "Sending Instructions..." : "Send Reset Instructions ✦"}
                </button>

                <div className="sc-auth-already" style={{ marginTop: "24px" }}>
                  Remember your password?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = getLoginUrl();
                    }}
                  >
                    Sign in here →
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* DECORATIVE RIGHT PANEL */}
        <div className="sc-auth-deco-side">
          <div className="sc-auth-deco-bg"></div>
          <div className="sc-auth-deco-pattern"></div>
          <div className="sc-auth-deco-content">
            {/* PROFILE MOSAIC */}
            <div className="sc-profile-mosaic">
              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.4),rgba(255,255,255,.15))",
                  }}
                >
                  P
                </div>
                <div className="sc-mosaic-name">Priya K.</div>
                <div className="sc-mosaic-match">Chennai</div>
                <div className="sc-mosaic-badge">88% match</div>
              </div>

              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.12))",
                  }}
                >
                  A
                </div>
                <div className="sc-mosaic-name">Ananya S.</div>
                <div className="sc-mosaic-match">Bangalore</div>
                <div className="sc-mosaic-badge">91% match</div>
              </div>

              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,.1))",
                  }}
                >
                  D
                </div>
                <div className="sc-mosaic-name">Divya R.</div>
                <div className="sc-mosaic-match">Mumbai</div>
                <div className="sc-mosaic-badge">84% match</div>
              </div>

              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.1))",
                  }}
                >
                  M
                </div>
                <div className="sc-mosaic-name">Meera N.</div>
                <div className="sc-mosaic-match">Hyderabad</div>
                <div className="sc-mosaic-badge">79% match</div>
              </div>

              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.38),rgba(255,255,255,.14))",
                  }}
                >
                  L
                </div>
                <div className="sc-mosaic-name">Lakshmi T.</div>
                <div className="sc-mosaic-match">Coimbatore</div>
                <div className="sc-mosaic-badge">93% match</div>
              </div>

              <div className="sc-mosaic-card">
                <div
                  className="sc-mosaic-av"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.08))",
                  }}
                >
                  S
                </div>
                <div className="sc-mosaic-name">Swetha G.</div>
                <div className="sc-mosaic-match">Pune</div>
                <div className="sc-mosaic-badge">86% match</div>
              </div>
            </div>

            <div className="sc-deco-title">
              Your matches
              <br />
              are waiting
            </div>
            <div className="sc-deco-subtitle">
              Sign in to see who's interested in you, respond to messages, and
              discover daily compatible profiles.
              <span className="sc-tamil">உங்கள் பொருத்தங்கள் காத்திருக்கின்றன</span>
            </div>

            <div className="sc-deco-stats">
              <div className="sc-auth-stat">
                <div className="sc-deco-stat-num">1,240</div>
                <div className="sc-deco-stat-label">New profiles today</div>
              </div>
              <div className="sc-auth-stat">
                <div className="sc-deco-stat-num">316</div>
                <div className="sc-deco-stat-label">Active right now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED SOUL CONNECT THEME STYLES */}
      <style jsx global>{`
        :root {
          --rose: #f2688c;
          --rose-light: #fde8ef;
          --rose-dark: #c0436a;
          --plum: #7c3aed;
          --plum-light: #ede9fe;
          --plum-dark: #5b21b6;
          --sage: #059669;
          --sage-light: #d1fae5;
          --amber: #d97706;
          --amber-light: #fef3c7;
          --saffron: #f59e0b;
          --saffron-light: #fffbeb;
          --ink: #0f0a1e;
          --ink-80: #2d2645;
          --ink-60: #4b4468;
          --ink-40: #8b85a0;
          --surface: #fafaf8;
          --white: #ffffff;
          --border: rgba(124, 58, 237, 0.12);
          --border-soft: rgba(0, 0, 0, 0.07);
          --font-display: "Sora", sans-serif;
          --font-body: "DM Sans", sans-serif;
          --font-tamil: "Noto Sans Tamil", sans-serif;
          --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
          --shadow-hover: 0 16px 48px rgba(0, 0, 0, 0.1);
          --radius-lg: 24px;
          --radius-md: 16px;
          --radius-sm: 12px;
        }

        body {
          font-family: var(--font-body);
          background: var(--surface);
          color: var(--ink);
          line-height: 1.65;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }

        .sc-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: rgba(250, 250, 248, 0.94);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-soft);
          padding: 0 5vw;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .sc-nav-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--plum);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .sc-nav-logo span {
          color: var(--rose);
        }

        .sc-logo-dot {
          width: 8px;
          height: 8px;
          background: var(--rose);
          border-radius: 50%;
          animation: sc-pulse 2.4s ease-in-out infinite;
          margin-left: 4px;
        }

        @keyframes sc-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.7;
          }
        }

        .sc-nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sc-nav-link {
          font-size: 0.875rem;
          color: var(--ink-60);
          text-decoration: none;
          font-weight: 400;
          transition: color 0.2s;
        }
        .sc-nav-link:hover {
          color: var(--plum);
        }

        .sc-btn-nav {
          background: linear-gradient(135deg, var(--rose), var(--plum));
          color: white;
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sc-btn-nav:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(242, 104, 140, 0.3);
        }

        .sc-page-wrapper {
          padding-top: 68px;
          min-height: 100vh;
          display: flex;
          box-sizing: border-box;
        }

        .sc-auth-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 52px 40px 80px;
        }

        .sc-auth-form-wrap {
          width: 100%;
          max-width: 420px;
        }

        .sc-auth-deco-side {
          width: 44%;
          min-height: calc(100vh - 68px);
          background: linear-gradient(
            155deg,
            var(--plum-dark) 0%,
            var(--plum) 40%,
            var(--rose-dark) 80%,
            var(--rose) 100%
          );
          position: sticky;
          top: 68px;
          align-self: flex-start;
          height: calc(100vh - 68px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 52px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .sc-auth-deco-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 70% 60% at 50% 30%,
            rgba(255, 255, 255, 0.09) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .sc-auth-deco-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(
            circle,
            white 1px,
            transparent 1px
          );
          background-size: 28px 28px;
          pointer-events: none;
        }

        .sc-auth-deco-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .sc-profile-mosaic {
          display: grid;
          grid-template-columns: repeat(3, 72px);
          gap: 10px;
          justify-content: center;
          margin-bottom: 36px;
        }

        .sc-mosaic-card {
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 14px 10px;
          text-align: center;
          transition: transform 0.3s;
        }
        .sc-mosaic-card:nth-child(2),
        .sc-mosaic-card:nth-child(5) {
          transform: translateY(-8px);
        }

        .sc-mosaic-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.95rem;
          color: white;
          margin: 0 auto 7px;
        }

        .sc-mosaic-name {
          font-size: 0.62rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .sc-mosaic-match {
          font-size: 0.58rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .sc-mosaic-badge {
          display: inline-block;
          font-size: 0.52rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 2px 7px;
          border-radius: 100px;
          margin-top: 4px;
        }

        .sc-deco-title {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 800;
          color: white;
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .sc-deco-subtitle {
          font-size: 0.87rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.65;
          max-width: 280px;
          margin: 0 auto 28px;
        }

        .sc-deco-subtitle .sc-tamil {
          font-family: var(--font-tamil);
          display: block;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 7px;
        }

        .sc-deco-stats {
          display: flex;
          justify-content: center;
          gap: 32px;
        }

        .sc-deco-stat-num {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
        }

        .sc-deco-stat-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 3px;
        }

        .sc-auth-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: var(--ink-40);
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .sc-auth-back:hover {
          color: var(--plum);
        }

        .sc-auth-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .sc-auth-subtitle {
          font-size: 0.88rem;
          color: var(--ink-60);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .sc-form-group {
          margin-bottom: 16px;
        }

        .sc-form-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .sc-form-input {
          width: 100%;
          padding: 13px 14px 13px 40px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-soft);
          background: white;
          font-size: 0.9rem;
          font-family: var(--font-body);
          color: var(--ink);
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          box-shadow: var(--shadow-card);
          box-sizing: border-box;
        }

        .sc-form-input:focus {
          border-color: var(--plum);
          box-shadow: 0 0 0 3px var(--plum-light), var(--shadow-card);
        }

        .sc-form-input::placeholder {
          color: var(--ink-40);
        }

        .sc-form-input-wrap {
          position: relative;
        }

        .sc-form-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.95rem;
          pointer-events: none;
          color: var(--ink-40);
        }

        .sc-btn-submit {
          width: 100%;
          padding: 15px;
          border-radius: var(--radius-md);
          border: none;
          background: linear-gradient(135deg, var(--rose), var(--plum));
          color: white;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .sc-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(242, 104, 140, 0.35);
        }

        .sc-auth-already {
          text-align: center;
          font-size: 0.83rem;
          color: var(--ink-60);
        }

        .sc-auth-already a {
          color: var(--plum);
          font-weight: 600;
          text-decoration: none;
        }

        .sc-auth-already a:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .sc-auth-deco-side {
            display: none;
          }
          .sc-auth-form-side {
            padding: 40px 24px 60px;
            justify-content: flex-start;
            padding-top: 48px;
          }
        }

        @media (max-width: 480px) {
          .sc-auth-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </>
  );
}
