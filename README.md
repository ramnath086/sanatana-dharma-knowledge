# Sanātana Dharma Knowledge Portal

A free, source-aware public foundation for exploring the knowledge, scriptures, philosophy, traditions, practices and cultural heritage of Sanātana Dharma.

This repository is intentionally an architectural beginning, not the finished knowledge repository. It is static-first, lightweight and designed to grow toward a Markdown/MDX content system, digital library catalogue, scripture explorer, multilingual resource and knowledge graph.

## Stack

- React 19 and TypeScript
- Vite
- Tailwind CSS through `@tailwindcss/vite`
- Static data with typed entity contracts
- Git

## Structure

```text
src/
  components/  reusable cards, search, navigation and section UI
  layouts/     shared site and page layouts
  pages/       homepage and future page-level surfaces
  data/        typed sample records and navigation data
  content/     reserved for Markdown/MDX content
  types/       entity and relationship contracts
  utils/       reserved for content and search helpers
  styles/      reserved for style modules and tokens
public/
  images/      project imagery
  icons/       project icons
docs/          architecture and editorial notes
```

## Routes

The initial route surface includes `/`, `/begin`, `/scriptures`, `/vedas`, `/itihasa`, `/puranas`, `/philosophy`, `/dharma`, `/practice`, `/festivals`, `/temples`, `/sanskrit`, `/library`, `/search`, `/sources` and `/about`. It uses the browser path directly for now, keeping the first build dependency-light; a router can be introduced when nested content and navigation state require it.

## Run locally

```bash
npm install
npm run dev
npm run validate-content
npm run build
npm run lint
npm run test-content
npm run editorial-check
```

Open the local Vite URL printed by `npm run dev`.

## Knowledge engine

Phase 3 and 4 add typed entity models under `src/types/knowledge.ts`, Markdown content under `src/content/`, and generated entity, relationship, search and manifest artifacts under `src/generated/`. Phase 5 adds canonical Markdown source records, explicit rights metadata, evidence/claim models, editorial completeness, source profiles, and internal review dashboards. Phase 6 adds publication readiness, controlled workflow transitions, draft previews, editorial workspaces, source verification actions, and a development-only auth abstraction. See `docs/content-model.md`, `docs/source-model.md`, `docs/source-intelligence.md`, `docs/rights-and-licensing.md`, `docs/evidence-model.md`, `docs/claims.md`, `docs/editorial-workflow.md`, `docs/editorial-workbench.md`, `docs/publication-gates.md`, `docs/authentication.md`, `docs/claims-and-evidence-markdown.md`, `docs/editorial-activity-log.md`, `docs/draft-preview.md`, `docs/relationships.md`, `docs/content-workflow.md`, `docs/content-compiler.md` and `docs/multilingual.md`.

Phase 7 adds the master taxonomy, a curated foundational seed, sourced graph relationships, initial claim/evidence records, and a compiled beginner path. Phase 8 expands the corpus category-by-category across Vedāṅga, concepts, practices, festivals, sampradāya categories and Sanskrit domains while preserving publication gates. See `docs/master-taxonomy.md`, `docs/knowledge-domains.md`, `docs/source-map.md`, `docs/foundational-content.md`, `docs/knowledge-graph.md`, `docs/beginner-path.md`, `docs/knowledge-expansion.md`, `docs/research-pipeline.md`, `docs/claim-evidence-workflow.md` and `docs/content-quality.md`.

Phase 9/10 add evidence coverage, duplicate and orphan quality reports, taxonomy discovery, related knowledge navigation, public artifact privacy audits, bundle measurement, and a documented future persistence boundary. See `docs/evidence-coverage.md`, `docs/entity-quality.md`, `docs/taxonomy-discovery.md`, `docs/relationship-navigation.md`, `docs/public-editorial-separation.md`, `docs/publication-batches.md` and `docs/persistence-boundary.md`.

Phase 11 adds a focused evidence-rich expansion, high-priority depth auditing, conservative claim/evidence records, and `npm run evidence-audit`. No backend, database or authentication is introduced.

Phase 12 splits editorial route code from the initial public bundle. Phase 13 adds a source-linked graph expansion across Vedāṅga, Darśana, Vedānta, concepts and practices while retaining draft maturity safeguards. See `docs/phase-12.md`, `docs/phase-13.md`, `docs/performance.md`, `docs/code-splitting.md`, `docs/knowledge-depth.md`, `docs/graph-expansion.md` and `docs/publication-readiness.md`.

`npm run validate-content` checks duplicate and stable IDs, required frontmatter, supported types/statuses/languages, source IDs, relationship endpoints, and library copyright rules. `npm run build` runs this validator before typechecking and bundling.

## Content safety

The initial records are clearly marked sample content. No scripture, Sanskrit or historical claims should be fabricated. Use original summaries, source links and the guidance in `EDITORIAL_POLICY.md`, `COPYRIGHT.md` and `SOURCES.md`.

## Next architectural steps

1. Define validated frontmatter for Markdown/MDX entities and source references.
2. Add a content loader and static index generation for relationships and search.
3. Introduce a real router once content pages need nested layouts and route metadata.
4. Add tests for content validation, search indexing and accessibility smoke checks.
