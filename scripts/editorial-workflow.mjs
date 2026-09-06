export const workflowTransitions = {
  DISCOVERED: ['RESEARCHING'], RESEARCHING: ['DRAFT'], DRAFT: ['SOURCE_CHECK'], SOURCE_CHECK: ['EDITORIAL_REVIEW'],
  EDITORIAL_REVIEW: ['TRADITIONAL_REVIEW', 'APPROVED', 'DRAFT'], TRADITIONAL_REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'], PUBLISHED: ['ARCHIVED', 'SOURCE_CHECK'], ARCHIVED: [],
}
export const canTransition = (from, to) => workflowTransitions[from]?.includes(to) ?? false
