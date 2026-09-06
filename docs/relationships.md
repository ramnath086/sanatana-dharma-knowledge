# Relationships

Relationships are many-to-many records in `src/data/relationships.ts`. Each record has a stable ID, `from`, relationship type, `to`, source IDs and an editorial note.

Supported types include `part-of`, `related-to`, `explains`, `references`, `commentary-on`, `authored-by`, `associated-with`, `tradition-of`, `located-at`, `celebrated-during`, `practiced-in`, `derived-from`, `contains`, `teaches`, `mentions`, `follows` and `variant-of`.

Relationships must not be inferred or silently generated. Add a source or explicit editorial justification, and distinguish broad conceptual association from a claim of equivalence.
