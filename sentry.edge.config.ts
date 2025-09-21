import * as Sentry from '@sentry/nextjs';

// Edge runtime init (works for route handlers marked as edge)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: true,
  });
}
