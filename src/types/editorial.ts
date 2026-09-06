import type { LanguageCode, SourceRecord } from './knowledge'

export const evidenceTypes = ['primary-text', 'secondary-source', 'traditional-account', 'scholarly-interpretation', 'modern-interpretation', 'regional-tradition'] as const
export type EvidenceType = typeof evidenceTypes[number]
export const confidenceLevels = ['high', 'medium', 'low', 'uncertain'] as const
export type Confidence = typeof confidenceLevels[number]
export const reviewStatuses = ['needs-review', 'in-review', 'accepted', 'rejected', 'conflict'] as const
export type ReviewStatus = typeof reviewStatuses[number]
export const claimTypes = ['definition', 'textual', 'historical', 'traditional', 'linguistic', 'ritual', 'philosophical', 'geographical', 'biographical', 'bibliographical'] as const
export type ClaimType = typeof claimTypes[number]
export const editorialStages = ['discovered', 'researching', 'draft', 'source-check', 'editorial-review', 'traditional-review', 'approved', 'published'] as const
export type EditorialStage = typeof editorialStages[number]
export const workflowStates = ['DISCOVERED', 'RESEARCHING', 'DRAFT', 'SOURCE_CHECK', 'EDITORIAL_REVIEW', 'TRADITIONAL_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const
export type WorkflowState = typeof workflowStates[number]
export const workflowTransitions: Record<WorkflowState, WorkflowState[]> = {
  DISCOVERED: ['RESEARCHING'], RESEARCHING: ['DRAFT'], DRAFT: ['SOURCE_CHECK'], SOURCE_CHECK: ['EDITORIAL_REVIEW'],
  EDITORIAL_REVIEW: ['TRADITIONAL_REVIEW', 'APPROVED', 'DRAFT'], TRADITIONAL_REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'], PUBLISHED: ['ARCHIVED', 'SOURCE_CHECK'], ARCHIVED: [],
}

export interface EvidenceRecord { id: string; entityId: string; claim?: string; sourceId: string; location?: string; evidenceType: EvidenceType; confidence: Confidence; reviewStatus: ReviewStatus; perspective?: 'traditional-account' | 'historical-scholarly-account' | 'modern-interpretation' | 'regional-tradition' | 'sampradaya-specific'; notes?: string }
export interface ClaimRecord { id: string; entityId: string; claim: string; claimType: ClaimType; sourceIds: string[]; evidenceIds: string[]; status: EditorialStage; confidence: Confidence; editorialNotes?: string; conflictGroupId?: string }
export interface ConflictRecord { id: string; claimIds: string[]; type: 'conflict' | 'variant' | 'different-tradition' | 'different-edition' | 'uncertain'; notes?: string }
export interface EditorialRecord { entityId: string; stage: EditorialStage; outstandingIssues: string[]; sourceReview: boolean; rightsReview: boolean; factualReview: boolean; traditionalReview: boolean; translationReview: boolean; relationshipReview: boolean; completeness: number }
export interface SourceDashboardStats { total: number; verifiedRights: number; needsReview: number; unknownRights: number; byCategory: Record<string, number>; byAuthority: Record<string, number> }
export interface ReadinessCheck { id: string; category: 'CONTENT' | 'EDITORIAL' | 'SOURCE' | 'RIGHTS' | 'EVIDENCE' | 'CLAIMS' | 'CONFLICTS' | 'RELATIONSHIPS' | 'ACCESSIBILITY' | 'SEO'; status: 'PASS' | 'WARNING' | 'BLOCKED' | 'NOT_APPLICABLE'; severity: 'error' | 'warning' | 'info'; message: string }
export interface PublicationReadiness { publishable: boolean; blockers: { code: string; message: string; severity: 'error' }[]; warnings: string[]; checks: ReadinessCheck[] }
export interface WorkflowEvent { id: string; actor: string; action: string; entityId: string; previousState: WorkflowState; newState: WorkflowState; timestamp: string; reason?: string }
export interface SourceVerification { sourceId: string; verifiedBy: string; verifiedAt: string; verificationNotes: string }
export interface AuthenticatedUser { id: string; displayName: string; roles: ('EDITOR' | 'SENIOR_EDITOR' | 'TRADITIONAL_REVIEWER' | 'ADMIN')[] }
export interface EvidenceCoverage { entityId: string; title: string; type: string; status: string; sourceCount: number; claimCount: number; evidenceCount: number; primarySource: boolean; institutionalSource: boolean; scholarlySource: boolean; traditionalSource: boolean; statusLabel: 'STRONG' | 'ADEQUATE' | 'NEEDS_EVIDENCE' | 'NOT_APPLICABLE'; warnings: string[] }
export interface DuplicateSuggestion { kind: 'DUPLICATE_ID' | 'DUPLICATE_TITLE' | 'ALIAS_COLLISION' | 'POSSIBLE_DUPLICATE'; entityIds: string[]; reason: string; recommendation: string }
export interface OrphanReport { entityId: string; title: string; status: string; issues: string[]; classification: 'ORPHAN' | 'NEEDS_REVIEW' | 'VALID_ISOLATED_ENTITY' }

export function editorialCompleteness(entity: { sourceIds: string[]; language: LanguageCode[]; relationshipIds?: string[]; status: string }, sources: SourceRecord[]) {
  const checks = [entity.sourceIds.length > 0, entity.sourceIds.some((id) => sources.find((source) => source.id === id)?.authorityLevel === 'primary'), entity.sourceIds.every((id) => sources.find((source) => source.id === id)?.copyrightStatus !== 'unknown'), entity.language.length > 0, Boolean(entity.relationshipIds?.length), entity.status === 'published']
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}