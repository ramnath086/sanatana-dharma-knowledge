# Source Model

Sources are registered once under `src/content/sources/` and referenced by stable IDs. Entity records use `sourceIds`; they do not duplicate source metadata. The compiler emits the generated source registry under `src/generated/sources.json`.

Each source records its organization, URL, source type, authority level, languages, license, copyright status, rights notes, reuse flags, topics, categories, monitoring status and verification dates. A public URL is not assumed to be reusable. Unknown, all-rights-reserved and permission-required sources default to link-only behavior.

A future source importer must preserve provenance and should record discovery, access and verification events separately from the source identity.
