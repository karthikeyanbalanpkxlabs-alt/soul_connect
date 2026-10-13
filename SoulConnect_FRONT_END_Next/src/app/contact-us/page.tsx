"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function ContactUsPage() {
  return (
    <>
      <Navbar />

      <div className="legal-page">
        {/* Hero Header */}
        <header className="contact-hero" id="top">
          <div className="hero-bg" />
          <div className="contact-hero-badge">
            <Sparkles size={14} />
            Dedicated Support · 7 Days a Week
          </div>
          <h1>
            Let’s <span>Connect</span>{" "}&amp; Find Your Match
          </h1>
          <p>
            Have questions about compatibility matching, membership plans, or
            profile verification? Our dedicated relationship team in Tamil Nadu
            is here to guide you every step of the way.
          </p>

          <div className="contact-trust-bar">
            <div className="contact-trust-item">
              <ShieldCheck size={16} color="var(--sage)" />
              <span>100% Aadhaar &amp; Privacy Protected</span>
            </div>
            <div className="contact-trust-item">
              <Clock size={16} color="var(--plum)" />
              <span>Average Response &lt; 2 Hours</span>
            </div>
            <div className="contact-trust-item">
              <MapPin size={16} color="var(--rose)" />
              <span>Serving All 38 Districts in TN</span>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="contact-container">
          {/* Primary 3-Channel Cards Grid */}
          <div className="contact-cards-grid">
            {/* Card 1: Registered Office */}
            <div className="contact-card-modern">
              <div>
                <div className="contact-card-top">
                  <div className="contact-icon-bubble plum">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span className="contact-card-eyebrow">
                      Registered Office
                    </span>
                    <h3 className="contact-card-title">SOUL CONNECT TRUST</h3>
                  </div>
                </div>

                <div className="contact-card-body">
                  <address>
                    15, Velampalayam Ring Road
                    <br />
                    Velampalayam, Tirupur – 641 654
                    <br />
                    Tamil Nadu, India
                  </address>

                  <div className="contact-timing-pill">
                    <Clock size={14} />
                    <span>Mon – Sat: 9:30 AM – 6:30 PM IST</span>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=15+Velampalayam+Ring+Road+Tirupur+641654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-action-btn"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Card 2: Direct Helpline */}
            <div className="contact-card-modern">
              <div>
                <div className="contact-card-top">
                  <div className="contact-icon-bubble sage">
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <span className="contact-card-eyebrow">
                      Direct Helpline
                    </span>
                    <h3 className="contact-card-title">+91 83006 93931</h3>
                  </div>
                </div>

                <div className="contact-card-body">
                  <p>
                    Speak directly with our relationship counselors for guidance
                    with matchmaking, profile onboarding, or subscription inquiries.
                  </p>

                  <div className="contact-timing-pill">
                    <Clock size={14} />
                    <span>Direct Call &amp; WhatsApp Support</span>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href="tel:+918300693931"
                  className="contact-action-btn sage-btn"
                >
                  <span>Call Helpline Now</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Card 3: Official Email */}
            <div className="contact-card-modern">
              <div>
                <div className="contact-card-top">
                  <div className="contact-icon-bubble rose">
                    <Mail size={24} />
                  </div>
                  <div>
                    <span className="contact-card-eyebrow">
                      Official Email
                    </span>
                    <h3 className="contact-card-title">info@soulconect.com</h3>
                  </div>
                </div>

                <div className="contact-card-body">
                  <p>
                    Send inquiries regarding profile verification, feedback, or
                    trust services. Our team replies promptly.
                  </p>

                  <div className="contact-timing-pill">
                    <Clock size={14} />
                    <span>Average Reply &lt; 2 Hours</span>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href="mailto:info@soulconect.com"
                  className="contact-action-btn rose-btn"
                >
                  <span>Write An Email</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Full-Width Social Channels Card */}
          <div className="contact-social-card">
            <div className="contact-social-header">
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--rose)",
                  }}
                >
                  Community &amp; Media
                </span>
                <h3>Follow Our Social Channels</h3>
                <p>
                  Join Tamil Nadu’s fastest growing community of brides,
                  grooms, and families.
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.08)",
                  padding: "6px 14px",
                  borderRadius: "100px",
                }}
              >
                @soulconects
              </span>
            </div>

            <div className="contact-social-grid">
              <a
                href="https://www.facebook.com/soulconects"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-link"
              >
                <span>Facebook</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://www.instagram.com/soulconects"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-link"
              >
                <span>Instagram</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://twitter.com/soulconects"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-link"
              >
                <span>Twitter / X</span>
                <ExternalLink size={14} />
              </a>
              <div className="contact-social-link disabled">
                <span>YouTube</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help / FAQ Accordion Strip */}
          <section className="contact-faq-section">
            <div className="contact-faq-heading">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common questions about contacting SoulConnect</p>
            </div>

            <div className="contact-faq-grid">
              <div className="contact-faq-card">
                <h4>
                  <HelpCircle size={18} color="var(--rose)" />
                  How fast do matchmakers reply?
                </h4>
                <p>
                  Our Tirupur advisory desk operates Monday through Saturday.
                  Inquiries submitted via email or phone are typically
                  addressed within 2 business hours.
                </p>
              </div>

              <div className="contact-faq-card">
                <h4>
                  <HelpCircle size={18} color="var(--plum)" />
                  Can I visit the office in person?
                </h4>
                <p>
                  Yes! We welcome members and families to visit our office on
                  Velampalayam Ring Road, Tirupur, during regular hours (9:30 AM –
                  6:30 PM IST).
                </p>
              </div>

              <div className="contact-faq-card">
                <h4>
                  <HelpCircle size={18} color="var(--sage)" />
                  Is my contact info kept private?
                </h4>
                <p>
                  Absolutely. Your mobile number and email are encrypted with
                  AES-256 and never shared with other candidates without your
                  explicit mutual match consent.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
