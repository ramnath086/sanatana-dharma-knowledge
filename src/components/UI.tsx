import { useState } from 'react'

export function SearchBar({ compact = false, placeholder = 'Search scriptures, concepts, people, places...', value, onQueryChange }: { compact?: boolean; placeholder?: string; value?: string; onQueryChange?: (value: string) => void }) {
  const [localQuery, setLocalQuery] = useState('')
  const query = value ?? localQuery
  const updateQuery = (nextQuery: string) => { setLocalQuery(nextQuery); onQueryChange?.(nextQuery) }
  return <form className={`search-bar${compact ? ' search-bar-compact' : ''}`} action="/search" role="search">
    <label htmlFor={compact ? 'site-search-compact' : 'site-search'}>Search the knowledge portal</label>
    <input id={compact ? 'site-search-compact' : 'site-search'} name="q" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder={placeholder} />
    <button className="search-submit" type="submit" aria-label="Search">⌕</button>
  </form>
}

export function Breadcrumbs({ current }: { current: string }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>
}

export function SectionHeader({ eyebrow, title, description, href }: { eyebrow?: string; title: string; description?: string; href?: string }) {
  return <div className="section-header">
    <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {href && <a className="text-link" href={href}>View all <span aria-hidden="true">↗</span></a>}
  </div>
}

export function RelatedContent({ links }: { links: { title: string; href: string }[] }) {
  return <aside className="related-content"><span className="eyebrow">Continue exploring</span><ul>{links.map((link) => <li key={link.href}><a href={link.href}>{link.title}<span aria-hidden="true">↗</span></a></li>)}</ul></aside>
}

export function SkipLink() {
  return <a className="skip-link" href="#main-content">Skip to content</a>
}
