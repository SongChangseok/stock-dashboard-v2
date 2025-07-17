import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chart library
          'charts': ['recharts'],
          // State management
          'state': ['zustand'],
          // Database
          'database': ['@supabase/supabase-js'],
          // Testing (only in dev)
          ...(process.env.NODE_ENV === 'development' ? {
            'testing': ['@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event']
          } : {})
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
