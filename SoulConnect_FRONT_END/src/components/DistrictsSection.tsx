const districts = ["Chennai", "Coimbatore", "Madurai", "Trichy"];

function DistrictsSection() {
  return (
    <section id="districts" className="districts-section">
      <div className="eyebrow">All of Tamil Nadu</div>
      <h2 className="section-title">Every district, every community</h2>
      <p className="section-sub">
        From Kanyakumari to Nilgiris, from Chennai to the Cauvery delta — Soul
        Connect covers all 38 districts of Tamil Nadu.
      </p>
      <div className="districts-wrapper reveal">
        <div className="districts-tabs">
          <button
            className="dtab active"
            onclick="filterDistricts('all', this)"
          >
            All Districts
          </button>
          <button className="dtab" onclick="filterDistricts('north', this)">
            North TN
          </button>
          <button className="dtab" onclick="filterDistricts('south', this)">
            South TN
          </button>
          <button className="dtab" onclick="filterDistricts('central', this)">
            Central TN
          </button>
          <button className="dtab" onclick="filterDistricts('west', this)">
            Western TN
          </button>
          <button className="dtab" onclick="filterDistricts('coastal', this)">
            Coastal TN
          </button>
          <button className="dtab" onclick="filterDistricts('hills', this)">
            Hill Districts
          </button>
        </div>
        <div className="districts-grid" id="districtsGrid"></div>
      </div>
    </section>
  );
}

export { DistrictsSection };
export default DistrictsSection;
