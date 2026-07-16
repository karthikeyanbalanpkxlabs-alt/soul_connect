"use client";

import keycloak from "../lib/keycloak";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function Navbar(props: any) {
  const [isOpen, setIsOpen] = useState(false);

  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_admin" || itm === "customer_admin",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";

  let name = keycloak.tokenParsed?.preferred_username;

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
  return (
    <>
      <nav>
        <a href="#" className="nav-logo">
          Soul<span>Connect</span>
          <div className="logo-dot"></div>
        </a>

        <div className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
          <a href="#districts" onClick={handleLinkClick}>
            Districts
          </a>
          <a href="#how" onClick={handleLinkClick}>
            How it works
          </a>
          <a href="#register" onClick={handleLinkClick}>
            Register
          </a>
          <a href="#pricing" onClick={handleLinkClick}>
            Plans
          </a>
          <a href="#verify" onClick={handleLinkClick}>
            Verification
          </a>
          <a href="#app" onClick={handleLinkClick}>
            App
          </a>
          <a href="#register" className="nav-tamil" onClick={handleLinkClick}>
            பதிவு செய்யுங்கள்
          </a>

          {name?.length > 0 ? (
            <div style={{ display: "flex" }}>
              <p
                style={{
                  display: "flex",
                  marginRight: 10,
                  textTransform: "capitalize",
                }}
              >
                <svg
                  width={"15px"}
                  height={"15px"}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 5 }}
                >
                  <path
                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{name + " |"}</span>
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
                <span style={{ marginLeft: 8 }}>Logout</span>
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
          <a href="#register" className="btn-nav" onClick={handleLinkClick}>
            Begin Journey ✦
          </a>
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
