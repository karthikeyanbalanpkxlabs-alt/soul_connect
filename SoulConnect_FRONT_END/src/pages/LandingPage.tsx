import keycloak from "../keycloak";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DistrictsSection from "../components/DistrictsSection";
import HowItWork from "../components/HowItWork";
import RegistrationSection from "../components/RegistrationSection";
function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <DistrictsSection />
      <HowItWork />
      <RegistrationSection />
      {/* <div style={{ padding: 20 }}>
        <h1>Welcome to Sashti</h1>
        <p>This is the landing page.</p>
        <button
          onClick={() => {
            window.location.href = window.location.origin + "/portal";
          }}
        >
          LogIn
        </button>
      </div> */}
    </>
  );
}

export default LandingPage;
