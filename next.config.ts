import type { NextConfig } from 'next';

const nextConfig: NextConfig = process.env.NETLIFY ? { output: 'export' } : {};

export default nextConfig;
