import keycloak from "../keycloak";
import Hero from "../components/Hero";
import DistrictsSection from "../components/DistrictsSection";
import HowItWork from "../components/HowItWork";
import RegistrationSection from "../components/RegistrationSection";
function LandingPage() {
  return (
    <>
      <Hero />
      <DistrictsSection />
      <HowItWork />
      <RegistrationSection />
    </>
  );
}

export default LandingPage;
