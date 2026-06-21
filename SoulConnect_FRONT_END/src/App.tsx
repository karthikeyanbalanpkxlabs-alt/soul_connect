import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import PortalPage from "./pages/PortalPage";
import PortalCustomerPage from "./pages/PortalCustomerPage";
import Navbar from "./components/Navbar";
import SideBarKit from "./components/SideBarKit";
import "./App.css";

function App() {
  return (
    <>
      <SideBarKit />
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/portal/customer" element={<PortalCustomerPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
