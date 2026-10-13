"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tocLinks = [
  { id: "s1", num: "01", title: "Information shared on this site" },
  { id: "s2", num: "02", title: "How your information is used" },
  { id: "s3", num: "03", title: "Privacy and confidentiality procedures" },
  { id: "s4", num: "04", title: "Is this a paid site?" },
  { id: "s5", num: "05", title: "Unsubscribe membership procedure" },
  { id: "s6", num: "06", title: "Daily profile access limit" },
  { id: "s7", num: "07", title: "Soul Connect communication frequency" },
  { id: "s8", num: "08", title: "Important Notice" },
];

const articlesHtmlContent = "<div>\r\n    <article class=\"card intro reveal\">\r\n      <div class=\"prose\"><p>Soulconect.com is an online matrimonial portal that caters to a comprehensive range of matchmaking services. Strongly committed to your right to privacy, we have drawn out a privacy statement with regard to the information you share with us. We use a secure server for credit card transactions to protect your financial identity and cookies are used to store the login information.</p></div>\r\n    </article>\r\n    <article class=\"card reveal\" id=\"s1\"><div class=\"sec-num\">Section 01</div><h2>What is the type of information you will share on this site?</h2><div class=\"prose\"><p>The information we gather from members and visitors who apply for the various services our site offers include, but may not be limited to, email address, first name, last name, a user-specified password and telephone number.</p>\r\n<p>If you establish a credit account with us to pay the fees we charge, some additional information, including a billing address, a credit card number and a credit card expiration date will be required.</p></div></article>\r\n<article class=\"card reveal\" id=\"s2\"><div class=\"sec-num\">Section 02</div><h2>How will the site use the information you share ?</h2><div class=\"prose\"><p>Soul Conect collects information from users primarily to ensure fulfilment of a requirement and to deliver a personalised experience.</p></div></article>\r\n<article class=\"card reveal\" id=\"s3\"><div class=\"sec-num\">Section 03</div><h2>What are the Privacy and confidentiality procedures followed by this site?</h2><div class=\"prose\"><p>The information collected from the users is not shared with any individual or organisation without the former's approval. The information collected is shared only with members of soulconect.com or members of our partners</p>\r\n<p>Soulconect.com does not sell, rent, or loan any identifiable information at the individual level regarding its customers to any third party. Any information you give us is held with the utmost care and security. We are also bound to cooperate fully should a situation arise where we are required by law or legal process to provide information about a customer.</p></div></article>\r\n<article class=\"card reveal\" id=\"s4\"><div class=\"sec-num\">Section 04</div><h2>Is this a paid site?</h2><div class=\"prose\"><p>No. All visitors to our site may browse the site, search the ads and view any articles or features our site has to offer without entering any personal information or paying money. Some of the services though may be charged.</p></div></article>\r\n<article class=\"card reveal\" id=\"s5\"><div class=\"sec-num\">Section 05</div><h2>What is the procedure to unsubscribe membership?</h2><div class=\"prose\"><p>The members are requested to login to the relevant pages to unsubscribe.</p></div></article>\r\n<article class=\"card reveal\" id=\"s6\"><div class=\"sec-num\">Section 06</div><h2>Can a User access more than one profile on a single day?</h2><div class=\"prose\"><p>As a paid member of this site, you have the privilege of contacting hundreds of profiles. However, there is a specified limit to send 100 messages per day due to fair online usage policy.</p></div></article>\r\n<article class=\"card reveal\" id=\"s7\"><div class=\"sec-num\">Section 07</div><h2>How often will the team at Soulconect.com contact the user?</h2><div class=\"prose\"><p>The Soulconect.com team will contact you from time to time to apprise you on various features and functionalities of the website. They will contact you for either \"Service\" or \"Sales\" through a variety of mediums like Email, SMS, MMS, Voice IVR, USSD, WAP messages, Telephonic Calls etc. The calls made to you will be from a regular Mobile or Landline number which is not of the \"140\" series.</p></div></article>\r\n<article class=\"card safe reveal\" id=\"s8\"><div class=\"sec-num\">Please note</div><h2>Notice</h2><div class=\"prose\"><p>We may change this Privacy Policy from time to time based on your comments or as a result of a change of policy in our company. If you have any questions regarding our Privacy Statement, please write in to <a href=\"mailto:help@soulconect.com\">help@soulconect.com</a></a></p></div></article>\r\n\r\n  </div>";

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState<string>("s1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    const elements = document.querySelectorAll("article[id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="legal-page">
        <header className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-badge">
            <i />
            Your privacy matters
          </div>
          <h1>
            Privacy <em>Policy</em>
          </h1>
          <p>How Soulconect.com collects, uses and protects your information</p>
        </header>

        <main className="layout">
          <aside className="toc">
            <h4>On this page</h4>
            {tocLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeId === item.id ? "on" : ""}
                onClick={() => setActiveId(item.id)}
              >
                <b>{item.num}</b>
                {item.title}
              </a>
            ))}
          </aside>
          <div dangerouslySetInnerHTML={{ __html: articlesHtmlContent }} />
        </main>
      </div>
      <Footer />
    </>
  );
}
