import type { NextConfig } from "next";

/**
 * No `output: "export"` — public pages use SSR + `GET /api/public/cms` at request time.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
