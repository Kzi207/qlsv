import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

            if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|zustand)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+)[\\/]/.test(id)) {
              return 'vendor-charts';
            }
            if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
              return 'vendor-motion';
            }
            if (/[\\/]node_modules[\\/](html5-qrcode|qrcode|qrcode.react)[\\/]/.test(id)) {
              return 'vendor-qr';
            }
            if (/[\\/]node_modules[\\/](lucide-react|react-hot-toast)[\\/]/.test(id)) {
              return 'vendor-ui';
            }
            if (/[\\/]node_modules[\\/]axios[\\/]/.test(id)) {
              return 'vendor-http';
            }

            return 'vendor';
          },
        },
      },
    },
    server: {
      port: 5173,
      allowedHosts: ['azt.kzii.site', 'myctut.kzii.site'],
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: apiTarget.startsWith('https'),
          // Strip cookie Domain attribute so browser accepts it on localhost
          cookieDomainRewrite: { '*': '' },
        }
      }
    }
  }
})
