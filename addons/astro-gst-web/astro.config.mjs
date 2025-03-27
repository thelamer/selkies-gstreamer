// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  base: '/',
  integrations: [
    react({
      include: ['**/react/*'],
      experimentalReactChildren: true,
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
//  vite: {
//    build: {
//      chunkSizeWarningLimit: 1000,
//      rollupOptions: {
//        output: {
//          manualChunks(id) {
//            if (id.includes('node_modules')) {
//              if (id.includes('webrtc-adapter')) {
//                return 'webrtc/adapter';
//              }
//              if (id.includes('react') || id.includes('scheduler')) {
//                return 'vendor/react';
//              }
//              if (id.includes('@radix-ui') || id.includes('framer-motion')) {
//                return 'vendor/ui';
//              }
//              if (id.includes('zustand') || id.includes('clsx') || 
//                  id.includes('tailwind-merge')) {
//                return 'vendor/utils';
//              }
//              return 'vendor/others';
//            }
//          }
//        }
//      }
//    },
//    resolve: {
//      alias: {
//        '@': '/src',
//      },
//    }
//  }
});
