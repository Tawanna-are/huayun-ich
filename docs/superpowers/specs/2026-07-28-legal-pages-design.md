# Legal Pages Design

## Goal

Add bilingual legal information to Huayun Heritage without changing the existing visual design, CMS, Feishu synchronization, uploads, comments, favorites, analytics, or other business behavior.

## Routes

Create four localized public routes:

- `/[locale]/disclaimer`: Disclaimer / 免责声明
- `/[locale]/privacy`: Privacy Policy / 隐私政策
- `/[locale]/copyright`: Image Copyright Policy / 图片版权声明
- `/[locale]/terms`: Terms of Service / 用户协议

Both `zh` and `en` versions are indexable. Each route provides its own localized title, description, canonical URL, Open Graph metadata, Twitter metadata, and language alternatives through the existing metadata helper.

## Content

### Disclaimer

Explain that the site provides cultural information and educational display, that reasonable care is taken but completeness and permanent availability are not guaranteed, and that external links and user-submitted material remain subject to their respective owners and sources. The operator is identified only as “华韵非遗网站运营方” in Chinese and “Huayun Heritage Website Operator” in English. Contact is handled through the existing contact page.

### Privacy Policy

Describe the limited information processed when visitors browse or submit forms, including technical logs, account-related data where applicable, form submissions, cookies or similar browser storage, and website usage statistics. Explicitly disclose Google Analytics data collection, its use of cookies or similar identifiers, the categories of usage and device information involved, the purpose of aggregate traffic analysis, and visitors’ ability to restrict cookies through browser settings or relevant Google controls. State that data is not sold and describe reasonable security, retention, third-party service, international processing, and contact practices without making unsupported legal guarantees.

### Image Copyright Policy

Include the approved notice:

> 本站尊重所有图片、文字及相关资料的知识产权。
>
> 部分文化资料来自公开信息整理，用于文化展示与交流。
>
> 如权利人认为本站内容涉及版权问题，请通过联系我们页面提交证明材料，我们将在核实后进行处理。

The English page carries an accurate equivalent. It also explains that attribution or transformation does not automatically replace permission, users must not reuse site media without confirming rights, and rights holders should submit the work, page URL, ownership evidence, and requested action through the contact form.

### Terms of Service

Cover acceptable cultural and personal use, account responsibility, prohibited infringement or misuse, rules for comments and submissions, moderation rights, intellectual-property boundaries, service availability, limitation language appropriate for a general informational website, and changes to the terms. Contact points to the existing contact page.

The pages are general website notices rather than jurisdiction-specific legal advice. They do not claim compliance certifications the operator has not established.

## Presentation

Use one shared legal-page presentation component so all four pages have the same structure and remain easy to maintain. The presentation uses the existing light rice/paper palette, constrained content width, serif page heading, readable section hierarchy, generous spacing, and existing responsive container utilities. No new navigation system or visual theme is introduced.

Each page includes:

- Localized page title and short introduction
- Last-updated date
- Clearly separated content sections
- Localized link to the existing contact page where contact is referenced

## Footer

Add a compact localized legal-navigation row to the existing footer with four links. Preserve the current branding and description and do not restore previously removed exploration or vendor links.

## Sitemap

Add the four route families to the existing sitemap generator using the current localized entry helper. Each route receives Chinese and English URLs plus language alternates. Legal pages use a low change frequency and moderate priority because they are important trust pages but not primary discovery content.

## Testing And Verification

Follow the existing Vitest source-level test pattern and add tests before production changes. Verify:

- All four localized route implementations exist and use localized metadata.
- The footer exposes exactly the four requested legal destinations in localized navigation.
- The privacy copy includes cookies, website analytics, and Google Analytics disclosure in both languages.
- The copyright copy includes the approved rights-holder process in both languages.
- The sitemap contains all four legal paths through the localized entry generator.
- Existing footer exclusions remain intact.
- Targeted tests and `npm run build` pass.

## Files Expected To Change

- `app/[locale]/disclaimer/page.tsx`
- `app/[locale]/privacy/page.tsx`
- `app/[locale]/copyright/page.tsx`
- `app/[locale]/terms/page.tsx`
- A shared legal content/presentation module under `components` or `lib`
- `components/layout/site-footer.tsx`
- `app/sitemap.ts`
- Relevant Vitest files under `tests`

No CMS repository, Feishu synchronization, upload API, comments, likes, favorites, authentication, or Google Analytics implementation will be modified.
