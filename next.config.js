/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 DEPLOYMENT CONFIGURATION
  // For static export deployment to Host Africa, uncomment these lines:
  // For static export deployment to Host Africa, uncomment this to export a fully static site.
  // Note: API routes and server-only pages are incompatible with `output: 'export'`.
  // Disabled for Vercel/server builds so API routes work correctly.
  // output: 'export',
  // basePath: '/demo', // Uncomment this for subdirectory deployment (e.g., '/veltrix')
  trailingSlash: true,
  
  reactStrictMode: true,
  
  // Ignore build errors for static export (backend files won't be included)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    // For static export, images must be unoptimized
    // Uncomment this line when deploying with output: 'export'
    unoptimized: true,
    
    domains: [
      'localhost',
      // Social media CDNs
      'scontent.cdninstagram.com',
      'scontent.xx.fbcdn.net',
      'pbs.twimg.com',
      'media.licdn.com',
      'p16-sign-va.tiktokcdn.com',
      'p16-sign.tiktokcdn-us.com',
    ],
  },
  // Webpack configuration for better performance
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
