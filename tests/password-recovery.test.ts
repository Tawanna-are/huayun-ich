import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("password recovery", () => {
  it("provides localized recovery and reset routes", () => {
    expect(readFileSync("app/[locale]/reset-password/page.tsx", "utf8")).toContain("PasswordResetForm");
    expect(readFileSync("components/user/password-reset-form.tsx", "utf8")).toContain("updateUser");
  });

  it("lets users request a recovery email from the login form", () => {
    const source = readFileSync("components/user/login-form.tsx", "utf8");
    expect(source).toContain("resetPasswordForEmail");
    expect(source).toContain("reset-password");
  });
});
