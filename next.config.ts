import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  rewrites: async () => [
    //App shell for react router
    {
      source: "/((?!api/).*)",
      destination: "/static-app-shell",
    },
  ],
};

export default nextConfig;
