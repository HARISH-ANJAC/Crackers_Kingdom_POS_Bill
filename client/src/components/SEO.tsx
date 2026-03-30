import { Helmet } from "react-helmet-async";
import {
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  ADDRESS_STREET,
  SHOP_NAME,
} from "@/lib/businessInfo";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
}

const SEO = ({
  title = "Crackers Kingdom — Premium Fireworks & Sparklers in Sivakasi",
  description = "Crackers Kingdom is your trusted destination for premium quality fireworks, sparklers, and festive crackers from Sivakasi. Safe, certified, and perfect for every celebration.",
  canonical = "https://crackerskingdom.in",
  ogType = "website",
  ogImage = "/og-image.png",
  twitterHandle = "@CrackersKingdom",
}: SEOProps) => {
  const siteName = SHOP_NAME;
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#fbbf24" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Search Engine Directives */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data for Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": SHOP_NAME,
          "image": "https://crackerskingdom.in/logo.png",
          "description": "Premium fireworks and crackers shop in Sivakasi.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": ADDRESS_STREET,
            "addressLocality": ADDRESS_LOCALITY,
            "addressRegion": ADDRESS_REGION,
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "9.4533",
            "longitude": "77.8024"
          },
          "url": "https://crackerskingdom.in",
          "telephone": "+91 81442 71571"
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
