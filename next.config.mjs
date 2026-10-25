/** @type {import('next').NextConfig} */
const backendUrl = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "")
).replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
