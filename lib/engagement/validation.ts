import type { ContactSubmissionKind } from "@/lib/types/database";

const contactKinds = new Set<ContactSubmissionKind>(["general", "supporter", "cooperation", "licensing"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ContactSubmissionValue = {
  kind: ContactSubmissionKind;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  heritageItemId: string | null;
};

export type ContactSubmissionValidationResult =
  | { ok: true; value: ContactSubmissionValue }
  | { ok: false; error: string };

export type CommentValidationResult = { ok: true; value: string } | { ok: false; error: "invalid_comment" };

function asRecord(input: unknown): Record<string, unknown> | null {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactSubmission(input: unknown): ContactSubmissionValidationResult {
  const record = asRecord(input);
  if (!record) return { ok: false, error: "invalid_payload" };

  if (text(record.website)) return { ok: false, error: "spam_detected" };

  const kind = text(record.kind) as ContactSubmissionKind;
  if (!contactKinds.has(kind)) return { ok: false, error: "invalid_kind" };

  const name = text(record.name);
  if (name.length < 2 || name.length > 80) return { ok: false, error: "invalid_name" };

  const email = text(record.email).toLowerCase();
  if (email.length > 254 || !emailPattern.test(email)) return { ok: false, error: "invalid_email" };

  const organization = text(record.organization);
  if (organization.length > 120) return { ok: false, error: "invalid_organization" };

  const message = text(record.message);
  if (message.length < 10 || message.length > 2000) return { ok: false, error: "invalid_message" };

  if (record.consent !== true) return { ok: false, error: "consent_required" };

  const heritageItemId = text(record.heritageItemId);
  if (heritageItemId && !uuidPattern.test(heritageItemId)) return { ok: false, error: "invalid_heritage_item" };

  return {
    ok: true,
    value: {
      kind,
      name,
      email,
      organization: organization || null,
      message,
      heritageItemId: heritageItemId || null
    }
  };
}

export function validateComment(input: unknown): CommentValidationResult {
  const value = text(input);
  return value.length >= 2 && value.length <= 800
    ? { ok: true, value }
    : { ok: false, error: "invalid_comment" };
}
