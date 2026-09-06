import type { EntityRecord, SourceRecord } from '../types/knowledge'
import type { ClaimRecord, EvidenceRecord, EvidenceCoverage, OrphanReport } from '../types/editorial'

export function evidenceCoverage(entities: EntityRecord[], sources: SourceRecord[], claims: ClaimRecord[], evidence: EvidenceRecord[]): EvidenceCoverage[] {
  return entities.map((entity) => {
    const linkedSources = entity.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as SourceRecord[]
    const entityClaims = claims.filter((claim) => claim.entityId === entity.id)
    const entityEvidence = evidence.filter((item) => item.entityId === entity.id)
    const warnings = []
    if (!linkedSources.length) warnings.push('No source linked.')
    if (entityClaims.length && !entityEvidence.length) warnings.push('Claims have no evidence records.')
    const primarySource = linkedSources.some((source) => source.authorityLevel === 'primary')
    const institutionalSource = linkedSources.some((source) => source.authorityLevel === 'institutional')
    const scholarlySource = linkedSources.some((source) => source.authorityLevel === 'academic')
    const traditionalSource = linkedSources.some((source) => source.authorityLevel === 'traditional')
    const statusLabel = entityClaims.length === 0 ? (linkedSources.length ? 'NOT_APPLICABLE' : 'NEEDS_EVIDENCE') : entityEvidence.length && warnings.length === 0 ? 'STRONG' : 'NEEDS_EVIDENCE'
    return { entityId: entity.id, title: entity.title, type: entity.type, status: entity.status, sourceCount: linkedSources.length, claimCount: entityClaims.length, evidenceCount: entityEvidence.length, primarySource, institutionalSource, scholarlySource, traditionalSource, statusLabel, warnings }
  })
}

export function orphanReports(entities: EntityRecord[], relationshipPairs: { from: string; to: string }[]): OrphanReport[] {
  return entities.map((entity) => {
    const issues = []
    if (!entity.sourceIds.length) issues.push('No source')
    if (!entity.classifications.length) issues.push('No classification')
    if (!entity.description?.trim()) issues.push('No description')
    if (!relationshipPairs.some((pair) => pair.from === entity.id || pair.to === entity.id)) issues.push('No relationships')
    return { entityId: entity.id, title: entity.title, status: entity.status, issues, classification: issues.length >= 3 ? 'ORPHAN' : issues.length ? 'NEEDS_REVIEW' : 'VALID_ISOLATED_ENTITY' }
  })
}