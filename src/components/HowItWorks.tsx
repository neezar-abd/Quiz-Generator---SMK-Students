import Section from "@/components/ui/Section";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Upload Materials",
    description: "Upload PDF or DOC files and let AI analyze your study content.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    number: "02", 
    title: "AI Generation",
    description: "Smart AI creates relevant quizzes based on your materials.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Track Progress",
    description: "Monitor your learning progress with detailed analytics.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <Section className="bg-gray-50/50">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">
          How It Works
        </h2>
        <p className="text-lg lg:text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
          Get started with AI-powered quiz generation in three simple steps
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="group relative bg-white rounded-2xl p-8 border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Number Badge */}
            <div className="absolute -top-4 left-8">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                {step.number}
              </div>
            </div>

            {/* Icon */}
            <div className="mt-4 mb-6">
              <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center text-black/70 group-hover:bg-black/10 transition-colors duration-300">
                {step.icon}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-black mb-3 tracking-tight">
              {step.title}
            </h3>
            <p className="text-black/60 leading-relaxed">
              {step.description}
            </p>

            {/* Connection Line (except last item) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-16 -right-6 lg:-right-12">
                <svg className="w-12 lg:w-24 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7l5 5m0 0l-5 5m5-5H6" className="text-black/20" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <Link
          href="/upload"
          prefetch
          className="inline-flex items-center px-6 py-3 bg-black !text-white rounded-xl font-medium hover:bg-black/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          aria-label="Start creating quizzes by uploading your materials"
        >
          Ready to get started?
          <svg className="ml-2 w-5 h-5 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </Section>
  );
}