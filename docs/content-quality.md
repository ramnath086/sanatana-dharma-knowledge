# Content Quality

Phase 9 quality reports are generated during compilation:

- `evidence-coverage.json` tracks source, claim and evidence coverage without ranking truth.
- `duplicate-suggestions.json` flags duplicate titles, alias collisions and possible duplicate identities without merging.
- `orphan-reports.json` identifies records needing review because they lack sources, classifications, descriptions or relationships.

Run `npm run content-quality` for a public artifact privacy audit and summary. Unicode-aware normalization preserves Sanskrit and Devanagari aliases when checking collisions.

Every entity should have a stable ID, title, type, classification, language metadata, concise original description, source IDs, appropriate relationships, editorial status and verification state.

Quality is not a truth score. It is source-aware completeness and editorial readiness. Traditions, regional forms and scholarly interpretations should remain distinct when they differ. Rights uncertainty defaults to link-only behavior.

The compiler rejects duplicate IDs, unknown taxonomy domains, broken source references, broken relationships, unsupported languages and malformed claims/evidence.
