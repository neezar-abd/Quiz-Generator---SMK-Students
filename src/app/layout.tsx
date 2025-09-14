import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QuizProvider } from "@/hooks/useQuizStore";

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

export const metadata: Metadata = {
  title: "AI Quiz Generator - Smart Learning for SMK Students", 
  description: "Upload study materials and generate AI-powered quizzes for SMK students and teachers. Enhance learning with intelligent quiz generation.",
  icons: {
    icon: [
      {
        url: "/logo_browser.svg",
        type: "image/svg+xml",
      }
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
            <body className={`${satoshi.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif' }}>
        <QuizProvider>
          <div className="min-h-screen flex flex-col bg-white text-black">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </QuizProvider>
      </body>
    </html>
  );
}
