import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("modern heritage explorer homepage", () => {
  it("keeps CMS loading on the server and mounts only the approved homepage modules", () => {
    const page = readFileSync("app/[locale]/page.tsx", "utf8");
    const content = readFileSync("components/home/home-cms-content.tsx", "utf8");

    expect(page).toContain("const itemsPromise = getHeritageItems()");
    expect(page).toContain("<HomeCmsContent itemsPromise={itemsPromise}");
    expect(content).toContain("const items = await itemsPromise");
    expect(content).toContain("items.filter((item) => item.featured)");
    expect(content).toContain("<HeritageExplorerHero");
    expect(content).toContain("<HomeContactEntry");
    expect(content).not.toContain("<FeaturedGrid");
    expect(content).not.toContain("<CollectionCategoryIndex");
    expect(content).not.toContain("Inheritor");
  });

  it("renders the approved two-line brand statement without hero actions", () => {
    const path = "components/home/heritage-explorer-hero.tsx";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const explorer = readFileSync(path, "utf8");
    expect(explorer).toContain("让中国千年文化");
    expect(explorer).toContain("被全世界看见");
    expect(explorer).not.toContain("让中国千年文化，");
    expect(explorer).not.toContain("探索非遗");
    expect(explorer).not.toContain("支持传承");
  });

  it("uses one full-width fixed main visual without visual rails", () => {
    const path = "components/home/heritage-explorer-hero.tsx";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const explorer = readFileSync(path, "utf8");
    expect(explorer).toContain('data-heritage-main-visual="true"');
    expect(explorer).toContain("block h-full w-full");
    expect(explorer).not.toContain('data-heritage-visual-rail="true"');
    expect(explorer).not.toContain("railItems");
    expect(explorer).toContain("item.image || item.heroImage");
    expect(explorer).toContain("`/heritage/${mainItem.slug}`");
    expect(explorer).not.toContain("item.name");
    expect(explorer).not.toContain("item.region");
    expect(explorer).not.toContain("item.categoryName");
    expect(explorer).not.toContain("item.summary");
    expect(explorer).not.toContain("onMouseMove");
    expect(explorer).not.toContain("useState");
  });

  it("uses only the approved homepage navigation", () => {
    const header = readFileSync("components/home/home-header.tsx", "utf8");

    for (const label of ["首页", "传承文化", "非遗项目", "注册", "登录", "联系我们"]) {
      expect(header).toContain(label);
    }
    expect(header).not.toContain("传承故事");
    expect(header).not.toContain("/inheritors");
    expect(header).toContain("HomeMobileMenu");
    expect(header).toContain("getAlternateLocale");
    expect(header).toContain("locale={alternateLocale}");
    expect(header).toContain("localeMeta[alternateLocale].label");
  });

  it("provides complete English copy for the homepage", () => {
    const header = readFileSync("components/home/home-header.tsx", "utf8");
    const explorer = readFileSync("components/home/heritage-explorer-hero.tsx", "utf8");
    const contact = readFileSync("components/home/home-contact-entry.tsx", "utf8");

    expect(header).toContain("Huayun Heritage");
    expect(header).toContain("Heritage Projects");
    expect(explorer).toContain("Let China's ancient culture");
    expect(explorer).toContain("be seen by the world");
    expect(explorer).toContain("locale: AppLocale");
    expect(contact).toContain("Connect tradition with today");
    expect(contact).toContain("Contact us");
    expect(contact).toContain("locale: AppLocale");
  });

  it("preserves the inner-page header", () => {
    const siteHeader = readFileSync("components/layout/site-header.tsx", "utf8");
    const englishMessages = JSON.parse(readFileSync("messages/en.json", "utf8"));
    const chineseMessages = JSON.parse(readFileSync("messages/zh.json", "utf8"));

    expect(siteHeader).toContain('pathname === "/"');
    for (const key of ["collectionBrand", "register", "signIn", "contactUs"]) {
      expect(siteHeader).toContain(`t("${key}")`);
    }
    expect(englishMessages.Site).toMatchObject({
      collectionBrand: "Huayun Collection",
      register: "Register",
      signIn: "Sign in",
      contactUs: "Contact us"
    });
    expect(chineseMessages.Site).toMatchObject({
      collectionBrand: "华韵收藏",
      register: "注册",
      signIn: "登录",
      contactUs: "联系我们"
    });
  });
});
