# Public and Editorial Separation

Public generated artifacts contain published entities, sanitized sources, public relationships, search documents and the public sitemap. Editorial artifacts contain drafts, readiness reports, source notes, claims, evidence, duplicate suggestions and orphan diagnostics.

Regression tests inspect public JSON for internal fields such as `sourceFile`, `editorialNote`, `verifiedBy`, `verificationNotes` and private notes. The current static app still ships editorial route code in the same JavaScript bundle; this is a code-splitting limitation, not an authorization boundary. Production editorial security requires a later server boundary.
