import Link from "next/link";
import Image from "next/image";
import { SectionAnimated } from "./animations";
import { BadgeCheck, Cpu, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-16">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-black/5 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-80px] w-[520px] h-[520px] rounded-full bg-black/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <SectionAnimated className="mb-12 lg:mb-0">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/5 text-black/70 border border-black/10">
                Powered by AI Technology
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 tracking-tight leading-[0.95]">
              AI‑Powered
              <br />
              <span className="text-black/70">Quiz Generator</span>
            </h1>

            <p className="text-lg lg:text-xl text-black/60 mb-8 max-w-2xl leading-relaxed">
              Transform your study materials into intelligent quizzes. Perfect for SMK
              students and teachers who want to enhance learning through AI‑generated
              assessments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/upload"
                prefetch
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium !text-white bg-black border border-transparent rounded-xl hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              >
                Start Creating Quizzes
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/dashboard"
                prefetch
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-black/20 rounded-xl hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 hover:-translate-y-0.5"
              >
                View Dashboard
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-black/60">
              <div className="flex items-center gap-2" aria-label="Free to use">
                <BadgeCheck className="w-4 h-4 text-green-600" aria-hidden="true" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2" aria-label="AI-powered">
                <Cpu className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span>AI‑powered</span>
              </div>
              <div className="flex items-center gap-2" aria-label="Instant results">
                <Zap className="w-4 h-4 text-purple-600" aria-hidden="true" />
                <span>Instant results</span>
              </div>
            </div>
          </SectionAnimated>

          {/* Right Column - Hero Image */}
          <SectionAnimated delay={120} className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/img_hero.png"
                alt="AI Quiz Generator Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4">
              <div className="w-full h-full bg-black/5 rounded-2xl"></div>
            </div>
          </SectionAnimated>
        </div>
      </div>
    </section>
  );
}
