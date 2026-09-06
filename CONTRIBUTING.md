# Contributing

Thank you for helping build a careful public knowledge resource.

## Before contributing

Read `EDITORIAL_POLICY.md`, `COPYRIGHT.md` and `SOURCES.md`. Keep changes focused, use original writing, and identify the sources behind factual claims.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

Content is currently represented in TypeScript under `src/data/` and the entity contracts live under `src/types/`. The long-term direction is Markdown/MDX-ready content with validated frontmatter and relationships.

## Content checklist

- Is the summary original and appropriately scoped?
- Are claims linked to a reliable source?
- Is variation between traditions or regions represented?
- Are sample or draft records clearly marked?
- Does the change preserve keyboard access and mobile readability?
