import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Script from 'next/script';

export default function Home() {
  return (
    <>
      <Script
        id="ld-json-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Soalin AI',
            url:
              process.env.NEXT_PUBLIC_SITE_URL ||
              process.env.NEXT_PUBLIC_APP_URL ||
              'http://localhost:3000',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${
                process.env.NEXT_PUBLIC_SITE_URL ||
                process.env.NEXT_PUBLIC_APP_URL ||
                'http://localhost:3000'
              }/search?q={search_term_string}`,
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
            url:
              process.env.NEXT_PUBLIC_SITE_URL ||
              process.env.NEXT_PUBLIC_APP_URL ||
              'http://localhost:3000',
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
