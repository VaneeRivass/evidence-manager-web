import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Without Vitest's globals, Testing Library cannot unmount between tests by itself
afterEach(cleanup)
