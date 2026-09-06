export const navigationGroups = [
  { label: 'Explore', items: [['/scriptures', 'Scriptures'], ['/philosophy', 'Philosophy'], ['/practice', 'Practice'], ['/festivals', 'Culture']] },
  { label: 'Learn', items: [['/begin', 'Begin here'], ['/sanskrit', 'Sanskrit'], ['/glossary', 'Glossary']] },
  { label: 'Library', items: [['/library', 'Digital library'], ['/sources', 'Sources'], ['/research', 'Research']] },
] as const

export const footerGroups = [
  { title: 'Explore', links: [['/vedas', 'Vedas'], ['/upanishads', 'Upaniṣads'], ['/itihasa', 'Itihāsa'], ['/puranas', 'Purāṇas'], ['/philosophy', 'Philosophy'], ['/practice', 'Practice']] },
  { title: 'Learn', links: [['/begin', 'Begin here'], ['/sanskrit', 'Sanskrit'], ['/children', 'Children'], ['/glossary', 'Glossary']] },
  { title: 'Library', links: [['/library', 'Digital library'], ['/sources', 'Sources'], ['/research', 'Research']] },
  { title: 'About', links: [['/about', 'About'], ['/editorial-policy', 'Editorial policy'], ['/copyright', 'Copyright'], ['/contributing', 'Contribute'], ['/contact', 'Contact']] },
] as const
