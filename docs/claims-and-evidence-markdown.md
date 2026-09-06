# Claims and Evidence Markdown

Claims live under `src/content/claims/` and evidence under `src/content/evidence/`. They are separate Markdown records, not a second database.

A claim records `id`, `entityId`, `claim`, `claimType`, `sources`, `evidence`, `confidence`, `status` and optional perspective/editorial notes. Evidence records `id`, `entityId`, `sourceId`, `evidenceType`, `confidence`, review status and a locator or bibliographic note. Full copyrighted quotations are not required and should not be copied when rights are unclear.

The compiler validates entity IDs, source IDs, claim/evidence types and confidence values, then emits editorial-only claim/evidence data. Public output remains empty unless the containing entity passes its publication gates.
