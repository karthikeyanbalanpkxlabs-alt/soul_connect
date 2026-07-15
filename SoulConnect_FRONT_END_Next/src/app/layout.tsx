import type { Metadata } from "next";
import { Sora, DM_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Soul Conect Tamil Nadu's Most Trusted Matrimony Platform",
  description:
    "Deep compatibility matching powered by psychology — not just horoscopes and biodata. Covering all 38 districts of Tamil Nadu, every community, and every dream.",
  keywords: [
    "Matrimony",
    "Tamil Nadu Matrimony",
    "Matchmaking",
    "Marriage Bureau",
    "Soul Conect",
    "SoulConect",
    "Tamil Matrimonial",
    "Psychology Matchmaking",
    "Compatibility Matching",
    "Tamil Nadu Marriage",
    "Trust Matrimony",
  ],
  authors: [{ name: "Soul Conect Team" }],
  metadataBase: new URL("https://soulconect.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Soul Conect Tamil Nadu's Most Trusted Matrimony Platform",
    description:
      "Deep compatibility matching powered by psychology — not just horoscopes and biodata. Covering all 38 districts of Tamil Nadu, every community, and every dream.",
    url: "https://soulconect.com",
    siteName: "Soul Conect Matrimony",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Soul Conect – Tamil Nadu's Most Trusted Matrimony Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soul Conect – Tamil Nadu's Most Trusted Matrimony Platform",
    description:
      "Deep compatibility matching powered by psychology. Covering all 38 districts of Tamil Nadu.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
