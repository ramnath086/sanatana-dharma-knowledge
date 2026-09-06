// DO NOT EDIT - GENERATED FROM MARKDOWN CONTENT
import type { ClaimRecord, EvidenceRecord, PublicationReadiness } from '../types/editorial'
import type { EntityRecord, Relationship, SearchDocument, SourceRecord } from '../types/knowledge'
import rawEntities from './entities.json'
import rawEditorialEntities from './editorial-entities.json'
import rawRelationships from './relationships.json'
import rawSearchIndex from './search-index.json'
import rawSources from './sources.json'
import rawEditorialSources from './editorial-sources.json'
import rawClaims from './claims.json'
import rawEvidence from './evidence.json'
import rawEditorialClaims from './editorial-claims.json'
import rawEditorialEvidence from './editorial-evidence.json'
import rawReadiness from './readiness.json'
import evidenceCoverage from './evidence-coverage.json'
import duplicateSuggestions from './duplicate-suggestions.json'
import orphanReports from './orphan-reports.json'
import manifest from './manifest.json'
const entities = rawEntities as EntityRecord[]
const editorialEntities = rawEditorialEntities as (EntityRecord & { publicationReadiness: PublicationReadiness })[]
const relationships = rawRelationships as Relationship[]
const searchIndex = rawSearchIndex as SearchDocument[]
const sources = rawSources as SourceRecord[]
const editorialSources = rawEditorialSources as SourceRecord[]
const claims = rawClaims as ClaimRecord[]
const evidence = rawEvidence as EvidenceRecord[]
const editorialClaims = rawEditorialClaims as ClaimRecord[]
const editorialEvidence = rawEditorialEvidence as EvidenceRecord[]
const readiness = rawReadiness as Record<string, PublicationReadiness>
export { entities, editorialEntities, relationships, searchIndex, sources, editorialSources, claims, evidence, editorialClaims, editorialEvidence, readiness, evidenceCoverage, duplicateSuggestions, orphanReports, manifest }
