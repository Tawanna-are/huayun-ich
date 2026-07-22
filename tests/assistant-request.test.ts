import { describe, expect, it } from "vitest";
import { parseAssistantRequest } from "@/lib/ai/assistant-request";

describe("assistant request parsing", () => {
  it("normalizes locale and keeps the latest valid chat messages", () => {
    const result = parseAssistantRequest({
      locale: "en",
      messages: [
        { role: "assistant", content: "Welcome" },
        { role: "user", content: "Tell me about Kunqu." }
      ]
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.locale : undefined).toBe("en");
    expect(result.ok ? result.messages : []).toEqual([
      { role: "assistant", content: "Welcome" },
      { role: "user", content: "Tell me about Kunqu." }
    ]);
  });

  it("rejects requests without a user question", () => {
    expect(parseAssistantRequest({ locale: "zh", messages: [] })).toEqual({
      ok: false,
      status: 400,
      error: "Missing user question."
    });
  });
});
