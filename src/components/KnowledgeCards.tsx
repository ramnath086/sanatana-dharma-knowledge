import type { LibraryResource, Relationship, ScriptureRecord } from '../types/knowledge'

export function ScriptureEntityCard({ scripture }: { scripture: ScriptureRecord }) {
  return <a className="content-card" href={`/scriptures/${scripture.id}`}><span className="card-eyebrow">{scripture.classifications.join(' · ')}</span><h3>{scripture.title}</h3><p>{scripture.description}</p><span className="card-link">Explore <span aria-hidden="true">→</span></span></a>
}

export function RelationshipCard({ relationship, fromTitle, toTitle }: { relationship: Relationship; fromTitle: string; toTitle: string }) {
  return <article className="relationship-card"><span className="card-eyebrow">{relationship.relationship}</span><strong>{fromTitle}</strong><span aria-hidden="true">↓</span><strong>{toTitle}</strong>{relationship.editorialNote && <p>{relationship.editorialNote}</p>}</article>
}

export function LibraryResourceCard({ resource }: { resource: LibraryResource }) {
  return <article className="source-card"><span className="card-eyebrow">{resource.type} · {resource.status}</span><h3>{resource.title}</h3><p>{resource.description}</p><a href={resource.externalUrl} target="_blank" rel="noreferrer">Open resource <span aria-hidden="true">↗</span></a></article>
}
