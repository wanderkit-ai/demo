/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Must stay relative — Next resolves it under `frontend/` only; never use `%USERPROFILE%` or other external dirs (breaks `require('react/jsx-runtime')`). */
  distDir: '.next',
  /**
   * Putting `.next` outside the repo (outside `frontend/`) breaks server bundle resolution
   * (`next/dist/compiled/...`, `react/jsx-runtime`).
   *
   * If OneDrive locks files under `.next`, exclude `frontend/.next` from sync or run from a
   * folder outside OneDrive.
   */
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      // Avoid disk-pack cache renames that fail on some OneDrive / AV setups
      config.cache = { type: 'memory' }
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
