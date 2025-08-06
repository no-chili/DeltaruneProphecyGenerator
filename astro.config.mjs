// @ts-check
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  server: {
    allowedHosts: true,
  },
  site: "https://www.example.com",
  integrations: [
    react(),
    sitemap(),
    partytown({ config: { forward: ["dataLayer.push", "gtag"] } }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
