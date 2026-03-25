/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Include data files in serverless function bundles
    outputFileTracingIncludes: {
      "/api/**": ["./data/**"],
    },
  },
};

export default nextConfig;
