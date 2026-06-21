import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import PortalPage from "./pages/PortalPage";
import PortalCustomerPage from "./pages/PortalCustomerPage";
import Navbar from "./components/Navbar";
import SideBarKit from "./components/SideBarKit";
import "./App.css";

function PortalLayout() {
  return (
    <>
      <div className="flex-1 flex">
        <SideBarKit />
        <div className="w-[100%]">
          <Outlet />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />

          {/* Portal Pages */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="customer" element={<PortalCustomerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

// function App() {
//   return (
//     <>
//       <SideBarKit />
//       <Navbar />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/portal" element={<PortalPage />} />
//           <Route path="/portal/customer" element={<PortalCustomerPage />} />
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

export default App;
