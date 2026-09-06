import type { ContentCardData } from '../types/content'

export const practiceCards: ContentCardData[] = [
  ...['Pūjā', 'Mantra', 'Japa', 'Dhyāna', 'Sandhyāvandanam', 'Saṃskāra', 'Vrata', 'Yajña'].map((title) => ({ title, description: 'A structured placeholder for a future, tradition-aware practice guide.', href: '/practice', label: 'Coming carefully' })),
]
