import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // next dev would otherwise append its own block to CLAUDE.md whenever an AI agent
  // runs it. This repository's CLAUDE.md is written by hand.
  agentRules: false,

  // The proxy (ADR-0007): the browser only calls its own origin — first-party cookie, no
  // CORS. API_URL, never NEXT_PUBLIC_: that prefix would publish it in the bundle.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.API_URL}/:path*` },
    ]
  },
}

export default nextConfig
