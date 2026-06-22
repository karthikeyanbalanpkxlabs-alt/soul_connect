"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav>
      <a href="#" className="nav-logo">
        Soul<span>Connect</span>
        <div className="logo-dot"></div>
      </a>
      
      <div className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
        <a href="#districts" onClick={handleLinkClick}>Districts</a>
        <a href="#how" onClick={handleLinkClick}>How it works</a>
        <a href="#register" onClick={handleLinkClick}>Register</a>
        <a href="#pricing" onClick={handleLinkClick}>Plans</a>
        <a href="#verify" onClick={handleLinkClick}>Verification</a>
        <a href="#app" onClick={handleLinkClick}>App</a>
        <a href="#register" className="nav-tamil" onClick={handleLinkClick}>
          பதிவு செய்யுங்கள்
        </a>
        <a href="#register" className="btn-nav" onClick={handleLinkClick}>
          Begin Journey ✦
        </a>
      </div>

      <div className="hamburger" id="hamburger" onClick={toggleNav}>
        <span style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
        <span style={{ opacity: isOpen ? 0 : 1 }}></span>
        <span style={{ transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
      </div>
    </nav>
  );
}