import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compileContent } from './compile-content.mjs'

const result = compileContent()
const coverage = result.evidenceCoverage
console.log(`Evidence audit\n--------------\nEditorial claims: ${result.editorialClaims.length}\nEditorial evidence: ${result.editorialEvidence.length}\nPublic approved claims: ${result.claims.length}\nPublic accepted evidence: ${result.evidence.length}\nStrong: ${coverage.filter((item) => item.statusLabel === 'STRONG').length}\nAdequate: ${coverage.filter((item) => item.statusLabel === 'ADEQUATE').length}\nNeeds evidence: ${coverage.filter((item) => item.statusLabel === 'NEEDS_EVIDENCE').length}\nNot applicable: ${coverage.filter((item) => item.statusLabel === 'NOT_APPLICABLE').length}`)
const publicEntities = JSON.parse(readFileSync(join(process.cwd(), 'src', 'generated', 'entities.json'), 'utf8'))
const publicClaims = JSON.parse(readFileSync(join(process.cwd(), 'src', 'generated', 'claims.json'), 'utf8'))
if (publicClaims.length && publicEntities.length === 0) process.exitCode = 1
