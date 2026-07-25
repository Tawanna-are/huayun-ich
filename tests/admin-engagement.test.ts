import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin engagement queues", () => {
  it.each([
    "app/api/admin/comments/route.ts",
    "app/api/admin/comments/[id]/route.ts",
    "app/api/admin/contact-submissions/route.ts",
    "app/api/admin/contact-submissions/[id]/route.ts"
  ])("protects %s with the existing admin request guard", (path) => {
    const source = readFileSync(path, "utf8");

    expect(source).toContain("verifyAdminRequest");
    expect(source).toContain("status: 401");
  });

  it("limits comment and submission status transitions", () => {
    const comments = readFileSync("app/api/admin/comments/[id]/route.ts", "utf8");
    const submissions = readFileSync("app/api/admin/contact-submissions/[id]/route.ts", "utf8");

    expect(comments).toContain('["approved", "rejected"]');
    expect(comments).toContain("moderated_at");
    expect(submissions).toContain('["new", "in_progress", "resolved"]');
  });

  it("mounts both queues in the existing admin page", () => {
    const page = readFileSync("app/[locale]/admin/page.tsx", "utf8");
    const client = readFileSync("components/admin/engagement-admin-client.tsx", "utf8");

    expect(page).toContain("EngagementAdminClient");
    expect(client).toContain("heritage_comments");
    expect(client).toContain("contact_submissions");
  });
});
