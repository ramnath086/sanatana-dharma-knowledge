export const evidenceTypes = new Set(['primary-text', 'secondary-source', 'traditional-account', 'scholarly-interpretation', 'modern-interpretation', 'regional-tradition'])
export const claimTypes = new Set(['definition', 'textual', 'historical', 'traditional', 'linguistic', 'ritual', 'philosophical', 'geographical', 'biographical', 'bibliographical'])
export const confidenceLevels = new Set(['high', 'medium', 'low', 'uncertain'])

export function validateEvidence(evidence, sourceIds, entityIds) {
  const errors = []
  if (!entityIds.has(evidence.entityId)) errors.push(`Unknown evidence entity: ${evidence.entityId}`)
  if (!sourceIds.has(evidence.sourceId)) errors.push(`Unknown evidence source: ${evidence.sourceId}`)
  if (!evidenceTypes.has(evidence.evidenceType)) errors.push(`Invalid evidence type: ${evidence.evidenceType}`)
  if (!confidenceLevels.has(evidence.confidence)) errors.push(`Invalid evidence confidence: ${evidence.confidence}`)
  return errors
}

export function validateClaim(claim, sourceIds, entityIds) {
  const errors = []
  if (!entityIds.has(claim.entityId)) errors.push(`Unknown claim entity: ${claim.entityId}`)
  if (!claimTypes.has(claim.claimType)) errors.push(`Invalid claim type: ${claim.claimType}`)
  for (const sourceId of claim.sourceIds ?? []) if (!sourceIds.has(sourceId)) errors.push(`Unknown claim source: ${sourceId}`)
  return errors
}

export function validateConflict(conflict, claimIds) {
  return conflict.claimIds.filter((claimId) => !claimIds.has(claimId)).map((claimId) => `Unknown conflict claim: ${claimId}`)
}
