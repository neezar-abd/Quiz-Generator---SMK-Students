import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Place for global instrumentation (left intentionally minimal).
}

// Capture request errors from nested React Server Components, as recommended by Sentry
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
export function onRequestError(err: unknown) {
  Sentry.captureRequestError(err);
}
