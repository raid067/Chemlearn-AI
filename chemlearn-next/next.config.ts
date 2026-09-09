import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import path from "path";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' https://apis.google.com https://*.googleapis.com https://www.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://recaptcha.net/;",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "font-src 'self' https://fonts.gstatic.com data:;",
      "img-src 'self' data: blob: https://*.googleusercontent.com https://*.firebaseapp.com https://lh3.googleusercontent.com https:;",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://generativelanguage.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://recaptcha.net https://www.google.com/recaptcha/ https://cdnjs.cloudflare.com https://www.gstatic.com https://cdn.jsdelivr.net;",
      "frame-src 'self' https://chemlearn-67.firebaseapp.com https://www.google.com/recaptcha/ https://recaptcha.net/;",
      "frame-ancestors 'none';",
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "upgrade-insecure-requests;",
    ].join(" "),
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(process.cwd(), "./"),
  turbopack: {},
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(nextConfig);
