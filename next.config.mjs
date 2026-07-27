/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'pg', 'jszip'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse tries to load test files, prevent webpack from bundling them
      config.externals = config.externals || [];
      config.externals.push('pdf-parse');
    }
    return config;
  },
};

export default nextConfig;
