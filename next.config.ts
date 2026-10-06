import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Seed data images (scripts/seed-data.ts) and Google OAuth avatars
      { protocol: "https", hostname: "www.themealdb.com", pathname: "/images/**" },
      { protocol: "https", hostname: "www.thecocktaildb.com", pathname: "/images/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Tree-shake icon/component barrels
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
