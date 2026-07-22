import * as Sentry from "@sentry/nextjs";

type PrimitiveContextValue = string | number | boolean | null | undefined;

export type AppExceptionContext = {
  module: "ai" | "search" | "supabase" | "api" | "admin";
  operation: string;
  tags?: Record<string, string>;
  extra?: Record<string, PrimitiveContextValue | PrimitiveContextValue[] | Record<string, PrimitiveContextValue>>;
};

export function captureAppException(error: unknown, context: AppExceptionContext) {
  Sentry.captureException(error, {
    tags: {
      module: context.module,
      operation: context.operation,
      ...context.tags
    },
    extra: context.extra
  });
}
