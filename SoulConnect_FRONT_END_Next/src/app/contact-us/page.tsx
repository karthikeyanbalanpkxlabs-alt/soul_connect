"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mainHtmlContent = "<div class=\"grid\">\n<section class=\"box reveal\" id=\"address\"><div class=\"ic\">📍</div><div class=\"eyebrow\">Address</div>\n<address><strong>SOUL CONNECT TRUST</strong>15, Velampalayam Ring Road<br>Velampalayam, Tirupur – 641 654<br>TamilNadu, India</address>\n<a class=\"dir\" href=\"https://www.google.com/maps/search/?api=1&query=15+Velampalayam+Ring+Road+Tirupur+641654\" target=\"_blank\" rel=\"noopener\">Get directions →</a></section>\n<section class=\"box rose reveal\" id=\"reach\"><div class=\"ic\">✉</div><div class=\"eyebrow\">Email</div>\n<a class=\"link\" href=\"mailto:info@soulconect.com\">info@soulconect.com</a>\n<div style=\"height:1.2rem\"></div>\n<div class=\"ic\" style=\"background:var(--sage-light);color:var(--sage)\">☎</div><div class=\"eyebrow\">Call</div>\n<a class=\"link\" href=\"tel:+918300693931\">+91 83006 93931</a></section>\n</div>\n<section class=\"social reveal\" id=\"social\"><div class=\"eyebrow\">Social</div><h2>Follow us</h2>\n<div class=\"sgrid\">\n<a class=\"s\" href=\"https://www.facebook.com/soulconects\" target=\"_blank\" rel=\"noopener\"><small>Facebook</small><span>facebook.com/soulconects</span></a>\n<a class=\"s\" href=\"https://www.instagram.com/soulconects\" target=\"_blank\" rel=\"noopener\"><small>Instagram</small><span>instagram.com/soulconects</span></a>\n<a class=\"s\" href=\"https://twitter.com/soulconects\" target=\"_blank\" rel=\"noopener\"><small>Twitter</small><span>@soulconects</span></a>\n<div class=\"s off\"><small>YouTube</small><span>Coming soon</span></div>\n</div></section>";

export default function ContactUsPage() {
  return (
    <>
      <Navbar />
      <div className="legal-page">
        <header className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-badge">
            <i />
            Contact Us
          </div>
          <h1>
            Let’s <em>Connect</em>
          </h1>
          <p>Reach out to Soul Connect Trust through any of the channels below.</p>
        </header>

        <main className="wrap">
          <div dangerouslySetInnerHTML={{ __html: mainHtmlContent }} />
        </main>
      </div>
      <Footer />
    </>
  );
}
