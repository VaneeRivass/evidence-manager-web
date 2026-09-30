import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Next's guide adds @vitejs/plugin-react; it is left out on purpose: its current release
// pulls a pre-release of Babel 8 that conflicts with this project, and Vitest already
// reads JSX and TypeScript on its own. The plugin's value is fast refresh, not tests.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL('./', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
