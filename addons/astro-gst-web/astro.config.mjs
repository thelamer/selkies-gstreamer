// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [
    react({
      include: ['**/react/*'],
      experimentalReactChildren: true,
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      assetsDir: 'lib/scripts',
      copyPublicDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core WebRTC related chunks
            if (id.includes('/lib/scripts/')) {
              return 'webrtc/core';
            }

            if (id.includes('node_modules')) {
              // WebRTC adapter and related
              if (id.includes('webrtc-adapter')) {
                return 'webrtc/adapter';
              }
              // React and related
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor/react';
              }
              // UI Components
              if (id.includes('@radix-ui') || id.includes('framer-motion')) {
                return 'vendor/ui';
              }
              // State management and utilities
              if (id.includes('zustand') || id.includes('clsx') || 
                  id.includes('tailwind-merge')) {
                return 'vendor/utils';
              }
              return 'vendor/others';
            }

            // Application code
            if (id.includes('/components/')) {
              return 'app/components';
            }
            if (id.includes('/lib/')) {
              return 'app/lib';
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    }
  }
});
