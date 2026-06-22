"use client";

interface PricingProps {
  onOpenPayment: (planName: string, price: string, features: string[]) => void;
}

export default function Pricing({ onOpenPayment }: PricingProps) {
  const plans = [
    {
      id: "free",
      name: "Free Entry",
      price: "₹0",
      sub: "Basic listing & search access",
      tagClass: "tag-free",
      tagLabel: "Free",
      isFeatured: false,
      btnClass: "btn-plan-outline",
      btnText: "Current Plan",
      features: [
        "Create profile (Tamil & English)",
        "Basic district filters",
        "Aadhaar verification request",
        "Receive match suggestions",
      ],
    },
    {
      id: "premium",
      name: "Premium Match",
      price: "₹2,499",
      sub: "3 Months validity — high match rates",
      tagClass: "tag-premium",
      tagLabel: "Premium",
      isFeatured: true,
      isPopular: true,
      btnClass: "btn-plan-white",
      btnText: "Upgrade Now ✦",
      features: [
        "View direct contact details",
        "Unlimited candidate views",
        "Psychology compatibility index",
        "Highlight profile in searches",
        "Advanced education/job filters",
      ],
    },
    {
      id: "elite",
      name: "Elite Circle",
      price: "₹4,999",
      sub: "6 Months validity — dedicated matching",
      tagClass: "tag-elite",
      tagLabel: "Elite",
      isFeatured: false,
      btnClass: "btn-plan-outline",
      btnText: "Upgrade to Elite",
      features: [
        "All Premium features included",
        "Dedicated relationship manager",
        "1 Free pre-marital counselling session",
        "Featured badge next to name",
        "Enhanced privacy control options",
      ],
    },
    {
      id: "gold",
      name: "Gold VIP",
      price: "₹9,999",
      sub: "12 Months validity — ultimate service",
      tagClass: "tag-gold",
      tagLabel: "VIP",
      isFeatured: false,
      btnClass: "btn-plan-amber",
      btnText: "Upgrade to Gold",
      features: [
        "Dedicated relationship manager",
        "Direct family-to-family meetings",
        "Background verification audit",
        "Unlimited counselling reviews",
        "Premium boosting algorithms",
      ],
    },
  ];

  return (
    <section id="pricing" className="payment-section">
      <div className="eyebrow">Membership Plans</div>
      <h2 className="section-title">A plan for every family's journey</h2>
      <p className="section-sub">
        Choose a tier that fits your pacing. Upgrade or downgrade at any time with secure payment options.
      </p>

      <div className="payment-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.isFeatured ? "featured" : ""}`}
          >
            {plan.isPopular && <div className="plan-popular">MOST POPULAR</div>}
            
            <span className={`plan-tag ${plan.tagClass}`}>
              {plan.tagLabel}
            </span>

            <div className="plan-price">{plan.price}</div>
            <div className="plan-price-sub">{plan.sub}</div>
            
            <h3>{plan.name}</h3>

            <div className="plan-features">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="plan-feat">
                  <span className="ck">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onOpenPayment(plan.name, plan.price, plan.features)}
              className={`btn-plan ${plan.btnClass}`}
            >
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>

      <div className="gateways-section">
        <h4 className="gateways-title">Supported Payment Channels</h4>
        <div className="gateways-grid">
          <div className="gw-card">
            <span className="gw-icon">⚡</span>
            <div style={{ textAlign: "left" }}>
              <div className="gw-name">UPI Transfer</div>
              <div className="gw-desc">Instant activation via GPay, PhonePe, Paytm</div>
            </div>
          </div>
          <div className="gw-card">
            <span className="gw-icon">💳</span>
            <div style={{ textAlign: "left" }}>
              <div className="gw-name">Card Payment</div>
              <div className="gw-desc">Visa, Mastercard, RuPay, Maestro</div>
            </div>
          </div>
          <div className="gw-card">
            <span className="gw-icon">🏦</span>
            <div style={{ textAlign: "left" }}>
              <div className="gw-name">Net Banking</div>
              <div className="gw-desc">SBI, HDFC, ICICI, Axis and 40+ banks</div>
            </div>
          </div>
        </div>

        <div className="payment-badges">
          <div className="pay-badge">
            <span>🛡️</span>
            <span>256-Bit SSL Secure Gateway</span>
          </div>
          <div className="pay-badge">
            <span>🏛️</span>
            <span>RBI Compliant Processing</span>
          </div>
          <div className="pay-badge">
            <span>🔒</span>
            <span>PCI-DSS Certified Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}