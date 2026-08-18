"use client";

import keycloak from "../lib/keycloak";
import { useKeycloak } from "@/providers/KeycloakProvider";
import { useState } from "react";
import { LogOut, Flame, User, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar(props: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useKeycloak();

  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_g" || itm === "customer_g",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";

  let name =
    profile?.first_name ||
    profile?.firstName ||
    keycloak.tokenParsed?.preferred_username;

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  console.log("roles", roles);

  if (roles?.includes("manager")) {
    return <></>;
  }

  const renderUserInfoUI = () => {
    return (
      <>
        {name?.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: 12,
                textTransform: "capitalize",
                color: "var(--ink-80)",
                fontWeight: 600,
                fontSize: ".875rem",
              }}
            >
              <UserCircle
                size={18}
                style={{ marginRight: 6, color: "var(--rose, #e11d48)" }}
              />
              <span
                style={{
                  maxWidth: 100,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
            </p>
            <div
              style={{
                cursor: "pointer",
                color: "var(--ink-60)",
                fontSize: ".875rem",
                fontWeight: 400,
                textDecoration: "none",
                transition: "color .2s",
                display: "flex",
                marginRight: 10,
                alignItems: "center",
              }}
              onClick={() => {
                localStorage.clear();
                keycloak.logout({
                  redirectUri: window.location.origin + "/",
                });
              }}
            >
              <LogOut size={16} />
              <span style={{ marginLeft: 6 }}>Logout</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              cursor: "pointer",
              color: "var(--ink-60)",
              fontSize: ".875rem",
              fontWeight: 400,
              textDecoration: "none",
              transition: "color .2s",
            }}
            onClick={() => {
              window.location.href = window.location.origin + "/portal";
            }}
          >
            Login
          </div>
        )}
      </>
    );
  };

  const renderLandingLinks = () => {
    return (
      <>
        {/* <a href="#districts" onClick={handleLinkClick}>
          Districts
        </a> */}
        <a href="#how" onClick={handleLinkClick}>
          How it works
        </a>
        <a href="#pricing" onClick={handleLinkClick}>
          Plans
        </a>
        <a href="#register" onClick={handleLinkClick}>
          Register
        </a>
        {/* <a href="#verify" onClick={handleLinkClick}>
          Verification
        </a> */}
        {/* <a href="#app" onClick={handleLinkClick}>
          App
        </a> */}
        {/* <a href="#register" className="nav-tamil" onClick={handleLinkClick}>
          பதிவு செய்யுங்கள்
        </a> */}
      </>
    );
  };
  const renderLandingAuthCustomerLinks = () => {
    return (
      <>
        <a
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push(`/portal/profile`);
          }}
        >
          {`Account`}
        </a>
      </>
    );
  };

  const renderLink = () => {
    return (
      <>
        {"customer_g" === roles
          ? renderLandingAuthCustomerLinks()
          : renderLandingLinks()}
      </>
    );
  };

  let logoObj: any = {
    href: "#",
  };

  if ("customer_g" === roles) {
    logoObj = {
      onClick: () => {
        router.push(`/portal`);
      },
    };
  }

  return (
    <>
      <nav>
        <a {...logoObj} className="nav-logo">
          Soul<span>Conect</span>
          <div className="logo-dot"></div>
        </a>

        <div className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
          {renderLink()}
          {renderUserInfoUI()}
          {"customer_g" === roles ? (
            <></>
          ) : (
            <a href="#register" className="btn-nav" onClick={handleLinkClick}>
              Begin Journey ✦
            </a>
          )}
        </div>

        <div className="hamburger" id="hamburger" onClick={toggleNav}>
          <span
            style={{
              transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }}
          ></span>
          <span style={{ opacity: isOpen ? 0 : 1 }}></span>
          <span
            style={{
              transform: isOpen
                ? "rotate(-45deg) translate(5px, -5px)"
                : "none",
            }}
          ></span>
        </div>
      </nav>
      {props?.children}
    </>
  );
}
