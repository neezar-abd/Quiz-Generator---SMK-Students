import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/animations";
import GlobalSound from "@/components/sound/GlobalSound";
import { QuizProvider } from "@/hooks/useQuizStore";
import AuthProvider from "@/components/AuthProvider";

// Satoshi font definition - using relative path from src/app
const satoshi = localFont({
  src: [
    {
      path: "../../public/font/WEB/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../../public/font/WEB/fonts/Satoshi-VariableItalic.woff2", 
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Soalin AI",
  title: {
    default: "Soalin AI - Quiz Generator",
    template: "%s - Soalin AI",
  },
  description:
    "Generate high‑quality quizzes instantly from your study materials. Built for SMK students and teachers with AI‑assisted question generation.",
  keywords: [
    "AI quiz generator",
    "Soalin AI",
    "SMK quiz",
    "education",
    "assessment",
    "multiple choice",
    "essay questions",
  ],
  authors: [{ name: "Soalin AI" }],
  creator: "Soalin AI",
  publisher: "Soalin AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Soalin AI",
    title: "Soalin AI - Quiz Generator",
    description:
      "Generate high‑quality quizzes instantly from your study materials. Built for SMK students and teachers.",
    images: [
      {
        url: "/logo_browser.svg",
        width: 512,
        height: 512,
        alt: "Soalin AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SoalinAI",
    creator: "@SoalinAI",
    title: "Soalin AI - Quiz Generator",
    description:
      "Generate high‑quality quizzes instantly from your study materials.",
    images: [
      {
        url: "/logo_browser.svg",
        alt: "Soalin AI",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/logo_browser.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/logo_browser.svg",
    apple: "/logo_browser.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshi.variable} font-sans antialiased bg-grain`} style={{ fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif' }}>
        <AuthProvider>
          <QuizProvider>
            <div className="min-h-screen flex flex-col text-black">
              <Navbar />
              <GlobalSound />
              <PageTransition>
                <main className="flex-grow">{children}</main>
              </PageTransition>
              <Footer />
            </div>
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
