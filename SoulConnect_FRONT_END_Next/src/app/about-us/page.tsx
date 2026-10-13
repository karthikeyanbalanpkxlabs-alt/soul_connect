"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const mainHtmlContent = "<section class=\"lead reveal\"><p>At <strong>Soul Connect</strong>, we believe that marriage is far more than just a union of two individuals—it is the harmonious coming together of two souls, families, traditions, and dreams.</p><p>Founded on the principles of <strong>trust, authenticity, and personalized guidance</strong>, our mission is to help you find a partner who truly understands, respects, and completes you. Whether you are seeking a life partner rooted in cultural values or looking for someone who shares your modern lifestyle and aspirations, we bridge the gap between traditional matchmaking and contemporary sensibilities.</p></section>\r\n<section class=\"story reveal\" id=\"story\"><div class=\"eyebrow\">Our Story</div><h2 class=\"t\">Where genuine connections begin</h2><p>In a fast-paced world driven by endless swiping and superficial connections, finding a deep, meaningful relationship can feel overwhelming. <strong>Soul Connect Matrimonial</strong> was established with a singular vision: to bring heart, security, and true intent back into matchmaking.</p><p>We recognized that every individual has a unique story, set of values, and vision for the future. By combining modern algorithms with dedicated, human-led matchmaking services, we created a platform where genuine individuals and families can connect with complete peace of mind.</p></section>\r\n<section class=\"sec\" id=\"why\"><div class=\"eyebrow\">Why choose us</div><h2 class=\"t\">Why Choose Soul Connect Matrimonial?</h2><p class=\"sub\">We are committed to making your journey toward marriage effortless, respectful, and joyful. Here is what sets us apart:</p><div class=\"grid\"><div class=\"feat reveal\"><div class=\"ic\">✓</div><h3>100% Verified Profiles</h3><p>Your safety and trust are our top priorities. Every profile undergoes rigorous verification to ensure authentic and serious background information.</p></div><div class=\"feat reveal\"><div class=\"ic\">✦</div><h3>Personalized Matchmaking</h3><p>We look beyond basic criteria. Our expert matchmakers take the time to understand your personal values, lifestyle, interests, and family expectations.</p></div><div class=\"feat reveal\"><div class=\"ic\">🔒</div><h3>Privacy Confidentiality</h3><p>We respect your privacy. You have complete control over who views your contact details and photos.</p></div><div class=\"feat reveal\"><div class=\"ic\">🌍</div><h3>Culturally Diverse Inclusive</h3><p>We cater to diverse communities, professions, and cultural backgrounds, helping you find matches tailored to your specific preferences.</p></div><div class=\"feat reveal\"><div class=\"ic\">🤝</div><h3>Dedicated Relationship Managers</h3><p>For members seeking an extra level of care, our dedicated team offers hands-on assistance every step of the way—from initial introduction to family discussions.</p></div></div></section>\r\n<section class=\"sec\" id=\"values\"><div class=\"eyebrow\">What guides us</div><h2 class=\"t\">Our Core Values</h2><div class=\"grid\"><div class=\"val plum reveal\"><div class=\"vi\">⚖</div><h3>Integrity</h3><p>We operate with total transparency, honesty, and moral commitment in every interaction.</p></div><div class=\"val rose reveal\"><div class=\"vi\">♡</div><h3>Empathy</h3><p>We understand the emotional significance of choosing a life partner and handle your journey with deep sensitivity and care.</p></div><div class=\"val sage reveal\"><div class=\"vi\">🛡</div><h3>Trust Safety</h3><p>Creating a safe, secure, and dignified space for men, women, and families is at the core of everything we do.</p></div><div class=\"val amber reveal\"><div class=\"vi\">★</div><h3>Excellence</h3><p>We constantly innovate our technology and customer support to offer you the best matchmaking experience possible.</p></div></div></section>\r\n<section class=\"vision reveal\"><h2>Our Vision</h2><p>To be the most trusted and cherished matrimonial platform worldwide—a place where meaningful connections turn into lifelong partnerships, built on mutual respect, love, and shared dreams.</p></section>\r\n<section class=\"cta reveal\"><div class=\"eyebrow\">Get started</div><h2 class=\"t\">Begin Your Journey Today</h2><p>Your story of togetherness starts here. Let us assist you in finding the soulmate you’ve been searching for.</p>\r\n<div class=\"btns\"><a href=\"#\" class=\"btn-primary\">Get Started Today</a><a href=\"#\" class=\"btn-outline\">Contact Our Matchmakers</a></div>\r\n<blockquote>“A happy marriage is a long conversation which always seems too short”</blockquote><p class=\"tail\">Find the person you want to talk to forever.</p></section>";

export default function AboutUsPage() {
  return (
    <>
      <Navbar />
      <div className="legal-page">
        <header className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-badge">
            <i />
            About Us
          </div>
          <h1>
            Welcome to Soul<em>Connect</em>
          </h1>
          <p className="tagline">Connecting Souls, Creating Forever.</p>
        </header>

        <main className="wrap">
          <div dangerouslySetInnerHTML={{ __html: mainHtmlContent }} />
        </main>
      </div>
      <Footer />
    </>
  );
}
