/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
  },
  // Client-only configuration - no server-side rendering for API routes
  trailingSlash: false,
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Output configuration for different deployment targets
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Asset optimization
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
