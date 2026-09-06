import { useState, type ReactNode } from 'react'
import { footerGroups, navigationGroups } from '../data/navigation'
import { SearchBar, SkipLink } from '../components/UI'

function Wordmark() {
  return <a className="wordmark" href="/" aria-label="Sanātana Dharma home"><span className="wordmark-mark" aria-hidden="true">ॐ</span><span>SANĀTANA<br /><em>DHARMA</em></span></a>
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="site-shell"><SkipLink />
    <header className="site-header">
      <Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">{navigationGroups.map((group) => <div className="nav-group" key={group.label}><span>{group.label}</span><div>{group.items.slice(0, 3).map(([href, label]) => <a href={href} key={href}>{label}</a>)}</div></div>)}</nav>
      <div className="header-actions"><a className="header-search" href="/search" aria-label="Search the portal">⌕ <span>Search</span></a><button className="language-button" type="button" aria-label="Change language">EN <span aria-hidden="true">⌄</span></button><button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span className="menu-icon" aria-hidden="true">☰</span><span className="sr-only">Menu</span></button></div>
    </header>
    {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{navigationGroups.map((group) => <div key={group.label}><span>{group.label}</span>{group.items.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</div>)}</nav>}
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="footer-intro"><Wordmark /><p>Preserving knowledge. Connecting traditions. Making Sanātana Dharma accessible to all.</p></div><div className="footer-links">{footerGroups.map((group) => <div key={group.title}><span>{group.title}</span>{group.links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</div>)}</div><small>Built as a careful, open foundation for learning. Content is being developed with source transparency.</small></footer>
  </div>
}

export function PageFrame({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <SiteLayout><div className="page-intro"><div className="container"><span className="eyebrow">Knowledge portal</span><h1>{title}</h1><p>{description}</p><SearchBar compact /></div></div><div className="container page-content">{children}</div></SiteLayout>
}
