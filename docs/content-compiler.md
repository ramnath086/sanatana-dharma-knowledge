# Markdown Content Compiler

Markdown under `src/content/` is the canonical content layer. TypeScript does not duplicate those entities. The compiler discovers `.md` and `.mdx` records, parses frontmatter and body text, validates controlled fields and source references, compiles relationship records, creates search documents, hashes source content, and writes generated artifacts to `src/generated/`.

## Commands

```bash
npm run validate-content
npm run compile-content
npm run test-content
npm run build
```

`validate-content` runs the compiler in validation-only mode. `compile-content` writes generated data. `build` runs validation, compilation, TypeScript, and Vite in order.

## Frontmatter

Entity records require `id`, `title`, `type`, `language`, `sources`, `status`, `verification` and `classifications`. Lists can use inline arrays or YAML-style list blocks. IDs use lowercase kebab-case and remain stable when display titles or translations change.

Relationship records live in `src/content/relationships/` and use `id`, `from`, `relationship`, `to` and `sources`. They are not entities. Relationship endpoints must resolve to content entity IDs and every source must be registered.

## Publication

Only `status: published` is written to `entities.json` and `search-index.json`. Draft, researching, needs-review, verified and archived records remain available to the compiler and editorial workspace but are not public frontend entities. A source existing does not make an entity verified. Published records cannot reference sources with unknown copyright status.

## Generated output

`src/generated/entities.json`, `relationships.json`, `search-index.json`, `sources.json`, `manifest.json` and `index.ts` are generated. `src/generated/README.md` marks them as generated. Do not edit them directly; change Markdown or source registry data and rerun the compiler.

The manifest includes total entities, published/draft counts, entities by type, source and relationship counts, language coverage and compilation time. Each entity, relationship and source Markdown record carries a SHA-256 content hash for future research/change tracking.

## Frontend

The frontend imports the generated index. Dynamic entity URLs use `/{type}/{id}` and only resolve compiled published records. Adding a new published Markdown entity makes it available after `npm run build`; no App route or handwritten entity registry needs editing.

Content is treated as data. The compiler never executes Markdown or MDX JavaScript. A future MDX renderer must sanitize HTML and explicitly restrict executable components.
