import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50/30 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
        {/* Left Column - Content */}
        <div className="mb-12 lg:mb-0">
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/5 text-black/70 border border-black/10">
              ✨ Powered by AI Technology
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 tracking-tight leading-none">
            AI-Powered
            <br />
            <span className="text-black/70">Quiz Generator</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-black/60 mb-8 max-w-2xl leading-relaxed">
            Transform your study materials into intelligent quizzes. Perfect for SMK 
            students and teachers who want to enhance learning through AI-generated 
            assessments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black border border-transparent rounded-xl hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start Creating Quizzes
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-black/20 rounded-xl hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 hover:-translate-y-0.5"
            >
              View Dashboard
            </Link>
          </div>
          
          <div className="mt-12 flex items-center space-x-8 text-sm text-black/50">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Free to use
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              AI-powered
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Instant results
            </div>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="relative">
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
          <div className="absolute inset-0 -z-10 transform translate-x-4 translate-y-4">
            <div className="w-full h-full bg-black/5 rounded-2xl"></div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}