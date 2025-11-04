import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if geo cookies already exist
  const geoCountry = request.cookies.get('geo_country')
  const geoRegion = request.cookies.get('geo_region')

  // Only set geo cookies if they don't exist (to avoid unnecessary API calls)
  if (!geoCountry || !geoRegion) {
    // Set a flag to trigger client-side geo detection
    // We'll do this client-side to avoid blocking the request
    response.cookies.set('geo_pending', 'true', {
      maxAge: 60, // 1 minute
      path: '/',
      sameSite: 'lax',
    })
  }

  // Note: Legacy article URLs (/articles/slug) are handled via /articles-legacy/[slug] route
  // Middleware redirect removed to avoid route conflicts
  // Legacy URLs will 404, but internal links use new format anyway

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml, manifest.json (SEO files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|manifest.webmanifest).*)',
  ],
}
