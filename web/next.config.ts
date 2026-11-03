import type { NextConfig } from "next";

// En-têtes de sécurité de base. La CSP stricte (avec nonce) est traitée au Sprint 3.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Images du blog : 3 Mo max (vérifié côté serveur) + marge multipart. Défaut Next.js : 1 Mo.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  serverExternalPackages: ["@node-rs/argon2"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
