import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ponytail: hostname is best-effort from public knowledge of this dataset,
      // unverified (no network access in dev sandbox). If next/image 404s on
      // real photos, check the actual URL host in the API response and fix here.
      {
        protocol: "https",
        hostname: "www.pet.gov.tw",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "asms.coa.gov.tw",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
