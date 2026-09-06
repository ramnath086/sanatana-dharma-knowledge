export type EntityKind =
  | 'scripture'
  | 'book'
  | 'verse'
  | 'person'
  | 'concept'
  | 'tradition'
  | 'temple'
  | 'festival'
  | 'practice'
  | 'sanskrit-term'
  | 'source'

export interface Entity {
  id: string
  kind: EntityKind
  title: string
  summary: string
  slug: string
  relationships?: string[]
  sourceIds?: string[]
  status?: 'sample' | 'draft' | 'published'
}

export interface Source {
  id: string
  title: string
  publisher: string
  url: string
  accessed?: string
  note?: string
}

export interface Scripture extends Entity {
  kind: 'scripture'
  tradition?: string
  period?: string
  scope?: string
}

export interface Person extends Entity {
  kind: 'person'
  dates?: string
  traditions?: string[]
}

export interface Concept extends Entity {
  kind: 'concept'
  relatedTerms?: string[]
}

export interface Tradition extends Entity {
  kind: 'tradition'
  regions?: string[]
}

export interface Temple extends Entity {
  kind: 'temple'
  location?: string
  tradition?: string
}

export interface Festival extends Entity {
  kind: 'festival'
  season?: string
  regions?: string[]
}

export interface Practice extends Entity {
  kind: 'practice'
  category?: 'worship' | 'study' | 'ethics' | 'wellbeing' | 'community'
}

export interface ContentCardData {
  title: string
  description: string
  href: string
  eyebrow?: string
  label?: string
  secondary?: string
}
