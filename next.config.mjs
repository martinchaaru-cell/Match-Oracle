/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.api-sports.io', 'ssl.gstatic.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
