# SEO & Lighthouse Report

Date: 2026-06-06

Target URL: http://localhost:3000/

## Scores

| Category | Score | Target |
| --- | ---: | ---: |
| Performance | 92 | > 90 |
| SEO | 100 | > 95 |

## Core Metrics

| Metric | Result |
| --- | --- |
| First Contentful Paint | 1.0 s |
| Largest Contentful Paint | 2.8 s |
| Total Blocking Time | 220 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.9 s |

## Commands

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node_modules\.bin\lighthouse.cmd http://localhost:3000 --only-categories=performance,seo --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output-path=lighthouse-report.json --quiet
```

Raw Lighthouse JSON: `lighthouse-report.json`
