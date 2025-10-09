import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Script from 'next/script';

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  return (
    <>
      <Script
        id="ld-json-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Soalin AI',
            url: siteUrl,
            logo: `${siteUrl}/logo_browser.svg`,
            image: `${siteUrl}/img_hero.png`,
            description: 'AI-powered quiz generator for SMK students and teachers',
            sameAs: [
              // Tambahkan social media URLs di sini kalau ada
            ],
          }),
        }}
      />
      <Script
        id="ld-json-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Soalin AI',
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <Script
        id="ld-json-app"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Soalin AI',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            url: siteUrl,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
      <Hero />
      <HowItWorks />
    </>
  );
}
