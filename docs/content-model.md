# Content Model

The knowledge engine uses stable kebab-case IDs, typed entity kinds, controlled status and verification states, source IDs, classifications, translations and optional relationships.

Markdown records live under `src/content/` and use frontmatter. The compiler generates the typed frontend registry and relationship/search artifacts under `src/generated/`; there is no handwritten entity registry to maintain.

Required Markdown fields are `id`, `title`, `type`, `language`, `sources`, `status`, `verification` and `classifications`. The body should be original editorial material, not copied scripture or copyrighted translation text.

Only records marked `published` should be included in a public content build. `draft`, `researching`, `needs-review`, `verified` and `archived` records remain editorial workspace material until a publication policy promotes them.
