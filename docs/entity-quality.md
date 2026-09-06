# Entity Quality

Compiler output includes duplicate/alias suggestions and orphan diagnostics. Suggestions never merge records automatically. Orphans can be legitimate isolated records, so diagnostics distinguish ORPHAN, NEEDS_REVIEW and VALID_ISOLATED_ENTITY.

Run `npm run content-quality` for a public artifact privacy audit and quality summary.
