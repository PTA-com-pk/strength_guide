/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize logo loading
    minimumCacheTTL: 60,
  },
  // Compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
  // Enable experimental features for better performance
  experimental: {
    // optimizeCss requires 'critters' package - disabled to avoid build errors
    optimizePackageImports: ['@/components', '@/lib'],
    serverComponentsExternalPackages: ['paapi5-nodejs-sdk'],
  },
  // Webpack configuration to fix module resolution issues
  webpack: (config, { isServer }) => {
    // Fix for paapi5-nodejs-sdk module resolution issues
    if (isServer) {
      // Use preferRelative to handle relative imports in paapi5-nodejs-sdk
      config.resolve.preferRelative = true
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

