/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: "http://localhost:8000/api/:path*/",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*/",
      },
    ];
  },
};

module.exports = nextConfig;