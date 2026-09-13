import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_PROXY_URL
      || (process.env.NODE_ENV === 'production' ? 'https://webxebackend.vercel.app' : 'http://localhost:5000');

    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
