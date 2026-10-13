import Link from "next/link";

export default function Footer() {
  const socialLinks = [
    { label: "FB", url: "https://www.facebook.com/soulconects" },
    { label: "IG", url: "https://www.instagram.com/soulconects" },
    { label: "TW", url: "https://twitter.com/soulconects" },
    { label: "YT", url: "#" }
  ];

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            Soul<span>Connect</span>
          </div>
          <p className="footer-tagline">
            Tamil Nadu's most trusted, psychology-based matrimony platform. Discover deep compatibility matches across all communities.
          </p>
          <p className="footer-tagline-tamil">
            அனைத்து 38 மாவட்டங்களிலும் உங்கள் வாழ்க்கை துணையை கண்டுபிடியுங்கள்.
          </p>
          <div className="footer-socials mt-4">
            {socialLinks.map((s, idx) => (
              <a key={idx} href={s.url} target={s.url !== "#" ? "_blank" : undefined} rel={s.url !== "#" ? "noopener noreferrer" : undefined} className="social-btn">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h5>Top Districts</h5>
          <a href="/#districts">Chennai Profiles</a>
          <a href="/#districts">Coimbatore Matches</a>
          <a href="/#districts">Madurai Candidates</a>
          <a href="/#districts">Tiruchirappalli Partners</a>
          <a href="/#districts">Salem Soulmates</a>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <a href="/#how">How it Works</a>
          <a href="/#pricing">Membership Plans</a>
          <a href="/#verify">Verification Safety</a>
          <a href="/#app">Mobile Application</a>
          <a href="/#stories">Success Stories</a>
        </div>

        <div className="footer-col">
          <h5>Legal & Support</h5>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms and Conditions</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/contact-us">Contact Us</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} Soul Connect Matrimony Platform. All rights reserved.
        </span>
        
        <div className="footer-badges">
          <span className="footer-badge">🛡️ Aadhaar Vault Compliant</span>
          <span className="footer-badge">🔒 AES-256 Bit Encryption</span>
          <span className="footer-badge">💳 RBI Compliant Merchant</span>
        </div>
      </div>
    </footer>
  );
}