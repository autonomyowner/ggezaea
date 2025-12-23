import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vematcha.xyz';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/chat/',
          '/checkout/',
          '/flash-session/',
          '/voice-mobile/',
          '/voice-test/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
