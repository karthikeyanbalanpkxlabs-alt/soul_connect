function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-cards">
        <div className="fc">
          <div
            className="fc-av"
            style={{ background: "linear-gradient(135deg,#F2688C,#7C3AED)" }}
          >
            A
          </div>
          <div>
            <div className="fc-name">Ananya, 26</div>
            <div className="fc-info">Chennai · Software Eng.</div>
            <div className="fc-match">✓ 94% match</div>
          </div>
        </div>
        <div className="fc">
          <div
            className="fc-av"
            style={{ background: "linear-gradient(135deg,#059669,#0D9488)" }}
          >
            K
          </div>
          <div>
            <div className="fc-name">Karthik, 28</div>
            <div className="fc-info">Coimbatore · MBA</div>
            <div className="fc-match">✓ 91% match</div>
          </div>
        </div>
        <div className="fc">
          <div
            className="fc-av"
            style={{ background: "linear-gradient(135deg,#D97706,#F59E0B)" }}
          >
            P
          </div>
          <div>
            <div className="fc-name">Priya, 25</div>
            <div className="fc-info">Madurai · Doctor</div>
            <div className="fc-match">✓ 89% match</div>
          </div>
        </div>
        <div className="fc">
          <div
            className="fc-av"
            style={{ background: "linear-gradient(135deg,#7C3AED,#C0436A)" }}
          >
            R
          </div>
          <div>
            <div className="fc-name">Rahul, 30</div>
            <div className="fc-info">Trichy · Architect</div>
            <div className="fc-match">✓ 87% match</div>
          </div>
        </div>
      </div>
      <div className="hero-badge">
        🏆 Tamil Nadu's #1 Psychology-Based Matrimony Platform
      </div>
      <h1>
        Find your <em>soulmate</em> across all of Tamil Nadu
      </h1>
      <p className="hero-sub">
        Deep compatibility matching powered by psychology — not just horoscopes
        and biodata. All 38 districts, every community, every dream.
      </p>
      <p className="hero-sub-tamil">
        அனைத்து 38 மாவட்டங்களிலும் உங்கள் வாழ்க்கை துணையை கண்டுபிடியுங்கள்
      </p>
      <div className="hero-ctas">
        <a href="#register" className="btn-hero">
          Register Free ✦
        </a>
        <a href="#how" className="btn-hero-outline">
          See how it works →
        </a>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-num">1.2L+</span>
          <span className="hero-stat-label">Tamil Nadu Profiles</span>
        </div>
        <div className="stat-div"></div>
        <div className="hero-stat">
          <span className="hero-stat-num">38</span>
          <span className="hero-stat-label">Districts Covered</span>
        </div>
        <div className="stat-div"></div>
        <div className="hero-stat">
          <span className="hero-stat-num">94%</span>
          <span className="hero-stat-label">Verified Profiles</span>
        </div>
        <div className="stat-div"></div>
        <div className="hero-stat">
          <span className="hero-stat-num">8,400+</span>
          <span className="hero-stat-label">Successful Matches</span>
        </div>
      </div>
    </section>
  );
}

export { Hero };
export default Hero;
