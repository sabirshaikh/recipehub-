import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Seed data images and Google OAuth avatars
      { protocol: "https", hostname: "images.unsplash.com" },
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
