import { compileContent } from './compile-content.mjs'

try {
  const result = compileContent()
  const blocked = Object.values(result.readiness).filter((item) => !item.publishable).length
  const needsReview = Object.values(result.readiness).filter((item) => item.checks.some((check) => check.status === 'WARNING' || check.status === 'BLOCKED')).length
  console.log(`Editorial readiness\n-------------------\nEntities: ${result.manifest.entities}\nSources: ${result.sources.length}\nClaims: ${result.claims.length}\nEvidence: ${result.evidence.length}\nRelationships: ${result.relationships.length}\n\nPublishable: ${result.entities.length}\nBlocked: ${blocked}\nNeeds review: ${needsReview}`)
} catch (error) { console.error(error.message); process.exitCode = 1 }
