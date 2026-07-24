import { describe, expect, it } from "vitest";
import { validateContactSubmission } from "@/lib/engagement/validation";

describe("contact submission validation", () => {
  it("accepts and normalizes a valid visitor submission", () => {
    const result = validateContactSubmission({
      kind: "supporter",
      name: "  Lin  ",
      email: " LIN@example.com ",
      organization: " Heritage Lab ",
      message: " I want to help document this traditional craft. ",
      consent: true,
      website: ""
    });

    expect(result).toEqual({
      ok: true,
      value: {
        kind: "supporter",
        name: "Lin",
        email: "lin@example.com",
        organization: "Heritage Lab",
        message: "I want to help document this traditional craft.",
        heritageItemId: null
      }
    });
  });

  it.each([
    [{ kind: "bad", name: "Lin", email: "lin@example.com", message: "A valid message", consent: true }, "invalid_kind"],
    [{ kind: "general", name: "L", email: "lin@example.com", message: "A valid message", consent: true }, "invalid_name"],
    [{ kind: "general", name: "Lin", email: "bad", message: "A valid message", consent: true }, "invalid_email"],
    [{ kind: "general", name: "Lin", email: "lin@example.com", message: "short", consent: true }, "invalid_message"],
    [{ kind: "general", name: "Lin", email: "lin@example.com", message: "A valid message", consent: false }, "consent_required"],
    [{ kind: "general", name: "Lin", email: "lin@example.com", message: "A valid message", consent: true, website: "bot" }, "spam_detected"]
  ])("rejects invalid input with %s", (input, error) => {
    expect(validateContactSubmission(input)).toEqual({ ok: false, error });
  });
});
