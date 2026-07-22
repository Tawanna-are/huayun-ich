type SentrySdk = typeof import("@sentry/nextjs");
type RouterTransitionArgs = Parameters<SentrySdk["captureRouterTransitionStart"]>;

let sentryPromise: Promise<SentrySdk> | null = null;
const queuedErrors: unknown[] = [];

function handleWindowError(event: ErrorEvent) {
  queuedErrors.push(event.error ?? event.message);
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  queuedErrors.push(event.reason);
}

function loadSentry() {
  if (!sentryPromise) {
    sentryPromise = import("@sentry/nextjs").then((Sentry) => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);

      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
        sendDefaultPii: false,
        ignoreErrors: [
          "ResizeObserver loop completed with undelivered notifications.",
          "ResizeObserver loop limit exceeded"
        ],
        beforeSend(event) {
          if (event.request?.cookies) {
            delete event.request.cookies;
          }

          return event;
        }
      });

      for (const error of queuedErrors.splice(0)) {
        Sentry.captureException(error);
      }

      return Sentry;
    });
  }

  return sentryPromise;
}

function scheduleSentry() {
  function startSentry() {
    window.removeEventListener("pointerdown", startSentry);
    window.removeEventListener("keydown", startSentry);
    void loadSentry();
  }

  window.addEventListener("pointerdown", startSentry, { once: true, passive: true });
  window.addEventListener("keydown", startSentry, { once: true });

  globalThis.setTimeout(() => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startSentry, { timeout: 2000 });
      return;
    }

    startSentry();
  }, 15_000);
}

if (typeof window !== "undefined") {
  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  if (document.readyState === "complete") {
    scheduleSentry();
  } else {
    window.addEventListener("load", scheduleSentry, { once: true });
  }
}

export function onRouterTransitionStart(...args: RouterTransitionArgs) {
  void loadSentry().then((Sentry) => Sentry.captureRouterTransitionStart(...args));
}
