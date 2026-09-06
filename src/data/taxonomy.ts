export const taxonomy = [
  'SHRUTI', 'VEDANGA', 'SMRITI', 'ITIHASA', 'PURANA', 'DHARMASHASTRA', 'DARSHANA', 'VEDANTA',
  'AGAMA', 'TANTRA', 'YOGA', 'PRACTICE', 'RITUAL', 'MANTRA', 'STOTRA', 'DEITY', 'RISHI',
  'ACHARYA', 'TEACHER', 'SAMPRADAYA', 'TRADITION', 'TEMPLE', 'PILGRIMAGE', 'FESTIVAL',
  'SANSKRIT', 'MANUSCRIPT', 'INSCRIPTION', 'COMMENTARY', 'TRANSLATION', 'BOOK', 'AUDIO', 'HISTORY',
  'VIDEO', 'ART', 'MUSIC', 'CULTURE', 'REGIONAL_TRADITION', 'CONCEPT', 'GLOSSARY', 'SCHOLARSHIP',
] as const
export type TaxonomyTerm = typeof taxonomy[number]

export const scriptureHierarchy = {
  veda: ['samhita', 'brahmana', 'aranyaka', 'upanishad'],
  itihasa: ['ramayana', 'mahabharata'],
  purana: ['mahapurana', 'upapurana'],
  dharma: ['dharma-sutra', 'smriti', 'grihya-sutra', 'shrauta-sutra'],
} as const

export const traditions = [
  { id: 'vaishnava', title: 'Vaiṣṇava', category: 'tradition' },
  { id: 'shaiva', title: 'Śaiva', category: 'tradition' },
  { id: 'shakta', title: 'Śākta', category: 'tradition' },
  { id: 'smarta', title: 'Smārta', category: 'tradition' },
  { id: 'advaita', title: 'Advaita Vedānta', category: 'philosophical-school' },
  { id: 'vishishtadvaita', title: 'Viśiṣṭādvaita', category: 'philosophical-school' },
  { id: 'dvaita', title: 'Dvaita', category: 'philosophical-school' },
  { id: 'bhedabheda', title: 'Bhedābheda', category: 'philosophical-school' },
] as const
