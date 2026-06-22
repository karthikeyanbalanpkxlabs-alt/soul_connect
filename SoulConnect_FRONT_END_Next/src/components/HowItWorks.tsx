"use client";

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="eyebrow">How it works</div>
      <h2 className="section-title">Four steps to finding your person</h2>
      <p className="section-sub">
        A thoughtful journey designed for Tamil Nadu families — combining modern science with traditional values.
      </p>
      
      <div className="how-grid reveal visible">
        <div className="how-card">
          <div className="how-step">01</div>
          <h3>Create your profile</h3>
          <p>
            Manual or AI-assisted registration in Tamil & English. Your story, your district, 
            your community — told authentically.
          </p>
          <div className="how-accent" style={{ background: "linear-gradient(90deg, var(--rose), transparent)" }}></div>
        </div>

        <div className="how-card">
          <div className="how-step">02</div>
          <h3>Get verified</h3>
          <p>
            Aadhaar, live selfie, and employment verification. Every profile you see is a real 
            person — no fakes, no fraud.
          </p>
          <div className="how-accent" style={{ background: "linear-gradient(90deg, var(--plum), transparent)" }}></div>
        </div>

        <div className="how-card">
          <div className="how-step">03</div>
          <h3>AI compatibility match</h3>
          <p>
            Our psychology engine analyses 40+ dimensions — values, lifestyle, family outlook, 
            communication style — to surface your best matches.
          </p>
          <div className="how-accent" style={{ background: "linear-gradient(90deg, var(--teal), transparent)" }}></div>
        </div>

        <div className="how-card">
          <div className="how-step">04</div>
          <h3>Connect & commit</h3>
          <p>
            Start with ice-breakers, meet with family support, get pre-marital counselling. 
            We're with you all the way to the wedding.
          </p>
          <div className="how-accent" style={{ background: "linear-gradient(90deg, var(--amber), transparent)" }}></div>
        </div>
      </div>
    </section>
  );
}
