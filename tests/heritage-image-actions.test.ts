import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage image actions", () => {
  it("adds image-specific favorite and like controls", () => {
    const componentPath = "components/heritage/heritage-image-actions.tsx";

    expect(existsSync(componentPath)).toBe(true);

    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain('targetType="heritage_image"');
    expect(source).toContain('targetId={imageId}');
    expect(source).toContain("/api/engagement/image-likes");
    expect(source).toContain("heritageItemId");
    expect(source).toContain("imageId");
    expect(source).toContain('router.push("/login")');
  });

  it("synchronizes duplicate controls for the same image", () => {
    const source = readFileSync("components/heritage/heritage-image-actions.tsx", "utf8");

    expect(source).toContain("huayun:image-engagement");
    expect(source).toContain("CustomEvent");
    expect(source).toContain("addEventListener");
    expect(source).toContain("removeEventListener");
  });

  it("keeps image favorites associated with their heritage item", () => {
    const source = readFileSync("components/user/favorite-button.tsx", "utf8");

    expect(source).toContain("onChange?: (favorite: boolean) => void");
    expect(source).toContain('targetType === "heritage" || targetType === "heritage_image"');
    expect(source).toContain("onChange?.(false)");
    expect(source).toContain("onChange?.(true)");
  });
});
