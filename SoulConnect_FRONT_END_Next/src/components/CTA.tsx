"use client";

export default function CTA() {
  return (
    <section className="cta-section">
      <h2>Ready to meet your <em>soulmate</em>?</h2>
      <p>
        Join thousands of families finding verified, compatible matches on Tamil Nadu's 
        most trusted matrimony platform.
      </p>
      
      <div className="cta-btns">
        <a href="#register" className="btn-hero">
          Register Free Now ✦
        </a>
        <a 
          href="#pricing" 
          className="btn-hero-outline" 
          style={{ borderColor: "white", color: "white" }}
        >
          View Membership Plans →
        </a>
      </div>

      <div className="cta-trust">
        <div className="ct-item">
          <span className="ct-icon">🛡️</span>
          <span>Aadhaar Verified Listings</span>
        </div>
        <div className="ct-item">
          <span className="ct-icon">🔒</span>
          <span>100% Encrypted Privacy Vault</span>
        </div>
        <div className="ct-item">
          <span className="ct-icon">💬</span>
          <span>Secure Chat & Calling Rooms</span>
        </div>
      </div>
    </section>
  );
}
