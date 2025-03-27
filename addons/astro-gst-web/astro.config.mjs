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
  ]
});
