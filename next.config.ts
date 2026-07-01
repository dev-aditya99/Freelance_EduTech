import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.31.169", "10.55.246.128", "192.168.1.8"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    qualities: [10, 20, 30, 40, 50, 60, 70, 75, 80, 90, 100],
  },
  output: "standalone",
  trailingSlash: false,
};

export default nextConfig;
