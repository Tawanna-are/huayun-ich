import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";

type SearchRequestSuccess = {
  ok: true;
  query: string;
  locale: AppLocale;
  category?: string;
  province?: string;
  limit: number;
};

type SearchRequestFailure = {
  ok: false;
  status: 400;
  error: string;
};

const defaultLimit = 12;
const maxLimit = 24;
const maxQueryLength = 160;

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeLimit(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return defaultLimit;
  }

  return Math.max(1, Math.min(maxLimit, Math.floor(value)));
}

export function parseSearchRequest(value: unknown): SearchRequestSuccess | SearchRequestFailure {
  if (typeof value !== "object" || value === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid request body."
    };
  }

  const body = value as {
    query?: unknown;
    locale?: string;
    category?: unknown;
    province?: unknown;
    limit?: unknown;
  };
  const query = typeof body.query === "string" ? body.query.trim().slice(0, maxQueryLength) : "";

  if (!query) {
    return {
      ok: false,
      status: 400,
      error: "Missing search query."
    };
  }

  return {
    ok: true,
    query,
    locale: isAppLocale(body.locale) ? body.locale : defaultLocale,
    category: optionalText(body.category),
    province: optionalText(body.province),
    limit: normalizeLimit(body.limit)
  };
}
