# Multilingual Content

One entity ID represents one underlying entity across languages. Translations belong under the entity's `translations` map, keyed by supported language codes such as `en`, `sa`, `hi`, `ml`, `ta`, `te`, `kn`, `bn`, `gu` and `mr`.

Translations are not assumed to be word-for-word equivalents. Each translation may carry its own title, summary, aliases and body. Devanagari, IAST and regional-script forms should resolve to the same stable entity through aliases and translation metadata.

Font tokens for Sanskrit/Devanagari and Malayalam already exist in the frontend CSS so language-specific typography can be expanded without replacing the main interface font.
