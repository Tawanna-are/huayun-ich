import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("assistant vector schema", () => {
  it("defines pgvector storage and retrieval for assistant RAG", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain('create extension if not exists "vector"');
    expect(schema).toContain("create table if not exists public.assistant_documents");
    expect(schema).toContain("embedding vector(1536)");
    expect(schema).toContain("public.match_assistant_documents");
  });
});
