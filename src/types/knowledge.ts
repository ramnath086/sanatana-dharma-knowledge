export const entityKinds = [
  'scripture', 'text', 'verse', 'concept', 'person', 'rishi', 'acharya', 'teacher',
  'tradition', 'philosophical-school', 'deity', 'temple', 'place', 'festival',
  'practice', 'ritual', 'mantra', 'stotra', 'book', 'manuscript', 'audio-resource',
  'video-resource', 'article', 'source', 'glossary-term',
] as const
export type EntityKind = typeof entityKinds[number]

export const contentStatuses = ['draft', 'researching', 'needs-review', 'verified', 'published', 'archived'] as const
export type ContentStatus = typeof contentStatuses[number]
export const verificationStates = ['unverified', 'partially-verified', 'verified', 'scholarly-review', 'traditional-review'] as const
export type VerificationState = typeof verificationStates[number]
export const languageCodes = ['en', 'sa', 'hi', 'ml', 'ta', 'te', 'kn', 'bn', 'gu', 'mr'] as const
export type LanguageCode = typeof languageCodes[number]

export interface Translation { title?: string; summary?: string; body?: string; aliases?: string[] }
export type Translations = Partial<Record<LanguageCode, Translation>>

export interface EntityRecord {
  id: string
  title: string
  type: EntityKind
  aliases?: string[]
  description: string
  classifications: string[]
  language: LanguageCode[]
  traditionIds?: string[]
  sourceIds: string[]
  relationshipIds?: string[]
  status: ContentStatus
  verification: VerificationState
  translations?: Translations
  notes?: string[]
  body?: string
  contentHash?: string
  sourceFile?: string
  workflowState?: string
}

export const sourceTypes = ['primary-text', 'government', 'academic', 'traditional-institution', 'digital-library', 'manuscript-archive', 'publisher', 'museum', 'archive', 'research-project', 'educational', 'community', 'other'] as const
export type SourceType = typeof sourceTypes[number]
export const authorityLevels = ['primary', 'institutional', 'academic', 'traditional', 'secondary', 'community'] as const
export type AuthorityLevel = typeof authorityLevels[number]
export const copyrightStatuses = ['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'permission-required', 'link-only', 'all-rights-reserved', 'unknown'] as const
export type CopyrightStatus = typeof copyrightStatuses[number]
export const sourceStatuses = ['active', 'temporarily-unavailable', 'moved', 'archived', 'dead-link', 'needs-review'] as const
export type SourceStatus = typeof sourceStatuses[number]

export interface SourceRecord {
  id: string
  name: string
  organization: string
  url: string
  sourceType: SourceType
  authorityLevel: AuthorityLevel
  language: LanguageCode[]
  license: string
  copyrightStatus: CopyrightStatus
  description: string
  topics: string[]
  dateAccessed: string
  lastVerified: string
  accessDate?: string
  categories?: string[]
  rightsNotes?: string
  licenseUrl?: string
  reuseAllowed: boolean
  redistributionAllowed: boolean
  commercialUseAllowed: boolean
  availability?: SourceStatus
  lastChecked?: string
  lastContentChange?: string
  verifiedBy?: string
  verifiedAt?: string
  verificationNotes?: string
  howWeUse?: ('reference' | 'catalogue' | 'link' | 'metadata' | 'full-text' | 'image' | 'audio' | 'video')[]
  notes?: string
}

export const relationshipTypes = ['part-of', 'related-to', 'explains', 'references', 'commentary-on', 'authored-by', 'associated-with', 'tradition-of', 'located-at', 'celebrated-during', 'practiced-in', 'derived-from', 'contains', 'teaches', 'mentions', 'follows', 'variant-of', 'primary-source', 'secondary-source', 'further-reading', 'catalogue-entry', 'text-edition', 'translation', 'commentary', 'manuscript-source'] as const
export type RelationshipType = typeof relationshipTypes[number]
export interface Relationship { id: string; from: string; relationship: RelationshipType; to: string; sourceIds: string[]; editorialNote?: string }

export interface ScriptureRecord extends EntityRecord { type: 'scripture'; hierarchy?: string[]; category?: 'veda' | 'upanishad' | 'itihasa' | 'purana' | 'dharmashastra' | 'other' }
export interface PersonRecord extends EntityRecord { type: 'person' | 'rishi' | 'acharya' | 'teacher'; period?: string }
export interface TraditionRecord extends EntityRecord { type: 'tradition' | 'philosophical-school'; parentTraditionId?: string; regions?: string[] }
export interface GlossaryTermRecord extends EntityRecord { type: 'glossary-term'; term: string; sanskrit?: string; transliteration?: string; pronunciation?: string; shortMeaning: string; relatedTermIds?: string[] }

export interface LibraryResource {
  id: string
  title: string
  author?: string
  translator?: string
  publisher?: string
  year?: string
  language: LanguageCode[]
  type: 'book' | 'manuscript' | 'translation' | 'commentary' | 'article' | 'audio' | 'video' | 'research-paper' | 'catalogue' | 'archive'
  edition?: string
  sourceId: string
  license?: string
  copyrightStatus: SourceRecord['copyrightStatus']
  externalUrl: string
  downloadUrl?: string
  description: string
  topics: string[]
  status: ContentStatus
}

export interface SearchDocument { id: string; title: string; aliases: string[]; sanskritTitle: string; description: string; type: EntityKind; classification: string[]; language: LanguageCode[]; tags: string[]; relatedEntityIds: string[] }
