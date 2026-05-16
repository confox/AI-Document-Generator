import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps to Sentry on production builds.
    // Requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT env vars.
    // Safe to omit in development — plugin no-ops when SENTRY_AUTH_TOKEN is unset.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true, // suppress output when not configured
    }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    // "hidden" emits source maps to disk but doesn't link them in the bundle,
    // so they are only available to Sentry, not to end users.
    sourcemap: "hidden",
  },
});
