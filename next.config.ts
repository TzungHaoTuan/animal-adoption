import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ponytail: Vercel Hobby's Image Optimization quota (unique url+width+quality
    // combos/month) gets exhausted by ~1000 cached animal photos × responsive
    // srcset widths, causing 402s. Source photos are already-compressed gov
    // images we don't control, so skip Vercel's optimizer entirely.
    unoptimized: true,
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
