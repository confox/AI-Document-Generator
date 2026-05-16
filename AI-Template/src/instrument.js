import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: `ai-docs-generator@${import.meta.env.VITE_APP_VERSION ?? "1.1.0"}`,
  debug: true, // TODO: remove after Sentry verification — logs SDK activity to console

  // Send default PII (e.g. IP address) with events
  sendDefaultPii: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Tracing — 100% in dev, 20% in production
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

  // This app is local-first with no backend API — trace localhost only
  tracePropagationTargets: ["localhost"],

  // Session Replay — 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable structured logging via Sentry.logger.*
  enableLogs: true,
});
