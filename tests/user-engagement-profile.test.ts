import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile engagement status", () => {
  it("shows comments and applications without removing favorites or history", () => {
    const source = readFileSync("components/user/profile-dashboard.tsx", "utf8");

    expect(source).toContain("heritage_comments");
    expect(source).toContain("contact_submissions");
    expect(source).toContain("user_favorites");
    expect(source).toContain("user_browsing_history");
    expect(source).toContain("HeritageCommentStatus");
    expect(source).toContain("ContactSubmissionStatus");
  });
});
