/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        'src/types/database.generated.ts',
        'src/types/index.ts',
        'coverage/**',
        'dist/**',
        'e2e/**',
        'docs/**',
        '*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/components/index.ts',
        'src/pages/index.ts',
        'src/services/index.ts',
        'src/stores/index.ts',
        'src/hooks/index.ts',
        'src/utils/index.ts'
      ],
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80
        },
        // Critical business logic requires higher coverage
        'src/services/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90
        },
        'src/stores/**': {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85
        },
        'src/utils/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90
        }
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 75],
        lines: [50, 80]
      }
    },
    // Performance and quality metrics
    reporters: ['default', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/html/index.html'
    }
  },
})