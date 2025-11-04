import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://strengthguide.net'

  return {
  name: 'StrengthGuide - Your Ultimate Strength Training Resource',
  short_name: 'StrengthGuide',
    description: 'Get expert advice on muscle building, fat loss, nutrition, and strength training. Free workouts, diet plans, and fitness tips.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['health', 'fitness', 'lifestyle'],
    lang: 'en-US',
    dir: 'ltr',
  }
}

