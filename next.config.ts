import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // next dev would otherwise append its own block to CLAUDE.md whenever an AI agent
  // runs it. This repository's CLAUDE.md is written by hand.
  agentRules: false,

  // The proxy (ADR-0007): the browser only ever calls its own origin, so the session
  // cookie is first-party and there is no CORS. API_URL is read here, on Next's server —
  // never NEXT_PUBLIC_, which would inline the API origin into the client bundle.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.API_URL}/:path*` },
    ]
  },
}

export default nextConfig
