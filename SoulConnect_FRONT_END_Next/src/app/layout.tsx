import type { Metadata } from "next";
import { Sora, DM_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import KeycloakProvider from "@/providers/KeycloakProvider";

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
  title: "Soul Connect – Tamil Nadu's Most Trusted Matrimony Platform",
  description:
    "Deep compatibility matching powered by psychology — not just horoscopes and biodata. Covering all 38 districts of Tamil Nadu, every community, and every dream.",
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
