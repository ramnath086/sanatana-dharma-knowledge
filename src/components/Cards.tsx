import type { ContentCardData, Scripture, Source } from '../types/content'

export function ContentCard({ item }: { item: ContentCardData }) {
  return <a className="content-card" href={item.href}>
    <div className="card-meta">{item.label && <span className="card-number">{item.label}</span>}{item.eyebrow && <span className="card-eyebrow">{item.eyebrow}</span>}</div>
    <h3>{item.title}{item.secondary && <small>{item.secondary}</small>}</h3>
    <p>{item.description}</p>
    <span className="card-link">Explore <span aria-hidden="true">→</span></span>
  </a>
}

export function ScriptureCard({ scripture }: { scripture: Scripture }) {
  return <ContentCard item={{ title: scripture.title, description: scripture.summary, href: `/${scripture.slug}`, eyebrow: scripture.tradition }} />
}

export function SourceCard({ source }: { source: Source }) {
  return <article className="source-card">
    <span className="card-eyebrow">{source.publisher}</span>
    <h3>{source.title}</h3>
    {source.note && <p>{source.note}</p>}
    <a href={source.url} target="_blank" rel="noreferrer">Visit source <span aria-hidden="true">↗</span></a>
  </article>
}
