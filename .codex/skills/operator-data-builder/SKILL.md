---
name: operator-data-builder
description: Use when adding, enriching, normalizing, or updating internal travel operator/vendor data. Trigger for requests to research a new operator from an official website or user-provided URL, convert operator info into the existing operators.json schema, append/update data/operators/operators.json, scrape destination/operator cover images, or generate image source manifests for demo use. Also use for Chinese requests such as 整理 operator 信息, 抓 operator 官网图片, 加到 operators.json, 新增旅行社数据, or operator 封面图.
---

# Operator Data Builder

Use this skill to maintain the internal operator dataset for demos and product prototypes.

The goal is to take a new operator name, website, URL, or rough notes; research official sources; normalize the data into the project schema; append or update the existing JSON; and optionally collect usable cover images.

## Default Files

Use the current project structure:

```text
data/operators/operators.json
data/operators/images/
data/operators/images/manifest.json
```

Operator cover images should be saved as:

```text
data/operators/images/{operator_id}.jpg
```

Default image target:

```text
1200 x 800 JPG
```

## Inputs

The user may provide:

- one operator name
- one website URL
- a list/table of operators
- partial notes such as WhatsApp, contact person, price score, or luxury fit
- a destination/route, such as Nepal, Everest Base Camp, Annapurna, Bhutan, or Tibet
- a request to scrape or find images for a given operator or destination

Support both user-provided URLs and web research/search when URLs are missing or incomplete.

## Workflow

1. Read the existing dataset from `data/operators/operators.json`.
2. Check if the operator already exists by comparing name, website domain, and normalized `id`.
3. If the operator exists, update missing fields only. Do not overwrite verified fields unless new evidence is stronger.
4. If the operator is new, create a stable snake_case `id` and append a new object using the existing schema.
5. Research official sources first: homepage, contact, about, team, FAQ, package/product, and destination pages.
6. Use third-party sources only when official pages are missing or insufficient.
7. Add source URLs for researched claims.
8. Mark uncertain fields clearly with `needs verification`.
9. Preserve the current JSON schema. See `references/operator_schema.md` when schema details are needed.
10. Validate JSON after editing.
11. If images are requested, scrape/select images from user-provided pages first, then official operator pages.
12. If no usable image exists, say so clearly. Do not fabricate image paths unless creating explicit placeholders.

## Verification Status

Use one of:

```text
verified_from_official_site
partially_verified
partially_verified_third_party
needs_verification
```

## Image Rules

When collecting images:

1. Prefer user-provided URLs, official operator pages, official package pages, and official destination pages.
2. Prefer `og:image`, hero images, destination landscape images, and package/trip cover images.
3. Skip logos, favicons, icons, SVGs, social icons, team headshots, maps, payment badges, tiny thumbnails, and unrelated UI assets.
4. Prefer landscape images at least `640 x 360`.
5. Save one cover image per operator as `{operator_id}.jpg`.
6. Crop/resize to `1200 x 800`.
7. Update or create `data/operators/images/manifest.json`.
8. If a site blocks scraping with bot verification, report that and ask for a manually downloaded image or image URL.

## Bundled Script

Prefer the bundled script for image scraping instead of rewriting scraper logic:

```bash
python3 .codex/skills/operator-data-builder/scripts/scrape_operator_images.py
```

The script expects to run from the project root and reads:

```text
data/operators/operators.json
```

It visits each operator's `source_urls` and `websites`, scores public image candidates, saves cover images, and writes:

```text
data/operators/images/manifest.json
```

For single-operator work, adapt the script or run a focused scrape using the same candidate filtering rules.

## Validation

After editing operator data:

```bash
python3 -m json.tool data/operators/operators.json
```

After editing image manifest:

```bash
python3 -m json.tool data/operators/images/manifest.json
```

Count saved cover images:

```bash
find data/operators/images -maxdepth 1 -name '*.jpg' | wc -l
```

Optional visual QA:

- generate a contact sheet
- inspect all covers for logo/team-photo/bad-crop issues
- replace weak images manually when needed

## Final Response

Report:

- operators added
- operators updated
- image files saved
- operators missing images
- fields still marked `needs verification`
- source URLs used
- whether JSON validation passed

Always mention that scraped images are for internal demo use and rights should be verified before public or commercial use.
