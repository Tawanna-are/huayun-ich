import { describe, expect, it } from "vitest";
import { buildProxiedTusLocation } from "@/lib/admin/tus-proxy";

describe("admin TUS proxy", () => {
  it("returns a same-origin relative upload location", () => {
    expect(
      buildProxiedTusLocation(
        "https://example.supabase.co/storage/v1/upload/resumable/upload-token",
        "https://example.supabase.co/storage/v1/upload/resumable"
      )
    ).toBe("/api/admin/media/tus/upload-token");
  });
});
