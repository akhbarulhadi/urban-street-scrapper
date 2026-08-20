/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 uses Turbopack by default.
  // Phaser is a browser-only library — dynamic import with { ssr: false }
  // in page.js already prevents server-side execution.
  // No webpack/turbopack config needed for Phaser to work.
  turbopack: {},
};

export default nextConfig;
