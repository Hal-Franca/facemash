import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-native: App Router + SSG, no custom server.
  // Security headers applied at edge (Vercel respects next.config headers).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
