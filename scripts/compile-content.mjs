import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

export const root = resolve(process.cwd())
export const contentRoot = join(root, 'src', 'content')
export const generatedRoot = join(root, 'src', 'generated')
export const relationshipRoot = join(contentRoot, 'relationships')
export const sourceRoot = join(contentRoot, 'sources')
export const claimRoot = join(contentRoot, 'claims')
export const evidenceRoot = join(contentRoot, 'evidence')
export const allowedTypes = new Set(['scripture', 'text', 'verse', 'concept', 'person', 'rishi', 'acharya', 'teacher', 'tradition', 'philosophical-school', 'deity', 'temple', 'place', 'festival', 'practice', 'ritual', 'mantra', 'stotra', 'book', 'manuscript', 'audio-resource', 'video-resource', 'article', 'source', 'glossary-term'])
export const statuses = new Set(['draft', 'researching', 'needs-review', 'verified', 'published', 'archived'])
export const verifications = new Set(['unverified', 'partially-verified', 'verified', 'scholarly-review', 'traditional-review'])
export const languages = new Set(['en', 'sa', 'hi', 'ml', 'ta', 'te', 'kn', 'bn', 'gu', 'mr'])
export const relationshipTypes = new Set(['part-of', 'related-to', 'explains', 'references', 'commentary-on', 'authored-by', 'associated-with', 'tradition-of', 'located-at', 'celebrated-during', 'practiced-in', 'derived-from', 'contains', 'teaches', 'mentions', 'follows', 'variant-of', 'belongs-to-domain', 'subtype-of', 'translation-of', 'preserved-in', 'discussed-by', 'composed-by', 'attributed-to', 'taught-by'])
export const sourceTypes = new Set(['primary-text', 'government', 'academic', 'traditional-institution', 'digital-library', 'manuscript-archive', 'publisher', 'museum', 'archive', 'research-project', 'educational', 'community', 'other'])
export const authorityLevels = new Set(['primary', 'institutional', 'academic', 'traditional', 'secondary', 'community'])
export const copyrightStatuses = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'permission-required', 'link-only', 'all-rights-reserved', 'unknown'])
export const sourceStatuses = new Set(['active', 'temporarily-unavailable', 'moved', 'archived', 'dead-link', 'needs-review'])
export const evidenceTypes = new Set(['primary-text', 'secondary-source', 'traditional-account', 'scholarly-interpretation', 'modern-interpretation', 'regional-tradition'])
export const claimTypes = new Set(['definition', 'textual', 'historical', 'traditional', 'linguistic', 'ritual', 'philosophical', 'geographical', 'biographical', 'bibliographical'])
export const confidenceLevels = new Set(['high', 'medium', 'low', 'uncertain'])
export const taxonomyDomains = new Set(['SHRUTI', 'VEDIC', 'VEDIC HERITAGE', 'VEDANGA', 'SMRITI', 'ITIHASA', 'PURANA', 'DHARMASHASTRA', 'DARSHANA', 'VEDANTA', 'AGAMA', 'TANTRA', 'YOGA', 'PRACTICE', 'RITUAL', 'MANTRA', 'STOTRA', 'DEITY', 'RISHI', 'ACHARYA', 'TEACHER', 'SAMPRADAYA', 'TRADITION', 'TEMPLE', 'PILGRIMAGE', 'FESTIVAL', 'SANSKRIT', 'MANUSCRIPT', 'INSCRIPTION', 'COMMENTARY', 'TRANSLATION', 'BOOK', 'AUDIO', 'VIDEO', 'ART', 'MUSIC', 'CULTURE', 'REGIONAL_TRADITION', 'CONCEPT', 'GLOSSARY', 'SCHOLARSHIP', 'PHILOSOPHY', 'BIOGRAPHY', 'HISTORY', 'LIBRARY', 'RESEARCH'])
export const depthPriority = new Set(['rigveda', 'yajurveda', 'samaveda', 'atharvaveda', 'isha-upanishad', 'ramayana', 'mahabharata', 'bhagavad-gita', 'nyaya', 'vaisheshika', 'sankhya', 'yoga-darshana', 'purva-mimamsa', 'vedanta', 'advaita-vedanta', 'vishishtadvaita-vedanta', 'dvaita-vedanta', 'dharma', 'karma', 'moksha', 'samsara', 'brahman', 'purushartha', 'ashrama', 'varna', 'jnana', 'bhakti', 'vairagya', 'sandhyavandana', 'puja', 'japa', 'dhyana', 'yajna', 'vrata', 'samskara', 'tirtha', 'valmiki', 'vyasa', 'shankara', 'ramanuja', 'madhva', 'shiva', 'vishnu', 'devi', 'ganesha', 'surya', 'krishna', 'dipavali', 'holi', 'navaratri', 'mahashivaratri', 'janmashtami', 'ramanavami', 'ganesha-caturthi', 'onam', 'vaishnava', 'shaiva', 'shakta'])

function filesIn(directory) {
  if (!statSync(directory, { throwIfNoEntry: false })) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(path) : /\.mdx?$/.test(entry.name) ? [path] : []
  })
}

function scalar(value) {
  const clean = value.trim()
  if (!clean) return ''
  if (clean === 'true') return true
  if (clean === 'false') return false
  if ((clean.startsWith('[') && clean.endsWith(']')) || (clean.startsWith('{') && clean.endsWith('}'))) {
    try { return JSON.parse(clean.replaceAll("'", '"')) } catch { return clean.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) }
  }
  return clean.replace(/^['"]|['"]$/g, '')
}

const list = (value) => Array.isArray(value) ? value : value ? [value] : []

export function parseFrontmatter(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) throw new Error(`${relative(root, file)}\nField: frontmatter\nInvalid value: missing opening delimiter\nExpected: frontmatter between --- delimiters`)
  const end = text.indexOf('\n---', 4)
  if (end < 0) throw new Error(`${relative(root, file)}\nField: frontmatter\nInvalid value: missing closing delimiter\nExpected: closing --- delimiter`)
  const lines = text.slice(4, end).split('\n')
  const data = {}
  let activeList = null
  for (const line of lines) {
    if (!line.trim()) continue
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem && activeList) { data[activeList].push(scalar(listItem[1])); continue }
    const separator = line.indexOf(':')
    if (separator < 1) throw new Error(`${relative(root, file)}\nField: frontmatter\nInvalid value: ${line}\nExpected: key: value`)
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (!value) { data[key] = []; activeList = key } else { data[key] = scalar(value); activeList = null }
  }
  return { data, body: text.slice(end + 4).trim(), hash: createHash('sha256').update(text).digest('hex') }
}

function sourceRegistry(errors) {
  const records = []
  const ids = new Set()
  for (const file of filesIn(sourceRoot)) {
    let parsed
    try { parsed = parseFrontmatter(file) } catch (error) { errors.push(error.message); continue }
    const { data, body, hash } = parsed
    const label = relative(root, file)
    for (const field of ['id', 'name', 'organization', 'url', 'sourceType', 'authorityLevel', 'languages', 'license', 'copyrightStatus', 'accessDate', 'lastVerified', 'description', 'topics', 'reuseAllowed', 'redistributionAllowed', 'commercialUseAllowed']) if (data[field] === undefined || data[field] === '') errors.push(`${label}\nField: ${field}\nInvalid value: missing\nExpected: required source metadata`)
    if (ids.has(data.id)) errors.push(`Duplicate source ID: ${data.id}\nFile: ${label}`)
    ids.add(data.id)
    if (data.sourceType && !sourceTypes.has(data.sourceType)) errors.push(`${label}\nField: sourceType\nInvalid value: ${data.sourceType}\nExpected: ${[...sourceTypes].join(' | ')}`)
    if (data.authorityLevel && !authorityLevels.has(data.authorityLevel)) errors.push(`${label}\nField: authorityLevel\nInvalid value: ${data.authorityLevel}\nExpected: ${[...authorityLevels].join(' | ')}`)
    if (data.copyrightStatus && !copyrightStatuses.has(data.copyrightStatus)) errors.push(`${label}\nField: copyrightStatus\nInvalid value: ${data.copyrightStatus}\nExpected: ${[...copyrightStatuses].join(' | ')}`)
    if (data.availability && !sourceStatuses.has(data.availability)) errors.push(`${label}\nField: availability\nInvalid value: ${data.availability}\nExpected: ${[...sourceStatuses].join(' | ')}`)
    for (const language of list(data.languages)) if (!languages.has(language)) errors.push(`${label}\nField: languages\nInvalid value: ${language}\nExpected: ${[...languages].join(' | ')}`)
    records.push({ id: data.id, name: data.name, organization: data.organization, url: data.url, sourceType: data.sourceType, authorityLevel: data.authorityLevel, language: list(data.languages), license: data.license, copyrightStatus: data.copyrightStatus, description: data.description, topics: list(data.topics), categories: list(data.categories), rightsNotes: data.rightsNotes, licenseUrl: data.licenseUrl, reuseAllowed: data.reuseAllowed === true, redistributionAllowed: data.redistributionAllowed === true, commercialUseAllowed: data.commercialUseAllowed === true, availability: data.availability, lastChecked: data.lastChecked, lastContentChange: data.lastContentChange, howWeUse: list(data.howWeUse), dateAccessed: data.accessDate, accessDate: data.accessDate, lastVerified: data.lastVerified, verifiedBy: data.verifiedBy, verifiedAt: data.verifiedAt, verificationNotes: data.verificationNotes, notes: data.notes ?? body, contentHash: hash, sourceFile: label })
  }
  return records
}

function fail(errors) {
  if (errors.length) throw new Error(`Content compilation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join('\n')}`)
}

const publicSource = (source) => { const safeSource = { ...source }; delete safeSource.notes; delete safeSource.verificationNotes; delete safeSource.verifiedBy; delete safeSource.verifiedAt; delete safeSource.sourceFile; delete safeSource.contentHash; return safeSource }
const publicRelationship = (relationship) => { const safeRelationship = { ...relationship }; delete safeRelationship.editorialNote; delete safeRelationship.sourceFile; delete safeRelationship.contentHash; return safeRelationship }
const publicClaim = (claim) => { const safeClaim = { ...claim }; delete safeClaim.editorialNotes; delete safeClaim.sourceFile; delete safeClaim.contentHash; return safeClaim }
const publicEvidenceRecord = (item) => { const safeEvidence = { ...item }; delete safeEvidence.notes; delete safeEvidence.sourceFile; delete safeEvidence.contentHash; return safeEvidence }
const normalizeText = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\u0900-\u097F]/gu, '')
function readiness(record, sourceRecords, claims, evidence) {
  const checks = []
  const add = (id, category, status, severity, message) => checks.push({ id, category, status, severity, message })
  add('content-id', 'CONTENT', record.id ? 'PASS' : 'BLOCKED', record.id ? 'info' : 'error', record.id ? 'Stable entity ID is present.' : 'Entity ID is missing.')
  add('content-title', 'CONTENT', record.title ? 'PASS' : 'BLOCKED', record.title ? 'info' : 'error', record.title ? 'Title is present.' : 'Title is missing.')
  add('content-body', 'CONTENT', record.body ? 'PASS' : 'BLOCKED', record.body ? 'info' : 'error', record.body ? 'Content body is present.' : 'Content body is missing.')
  add('language', 'CONTENT', record.language.length ? 'PASS' : 'BLOCKED', record.language.length ? 'info' : 'error', record.language.length ? 'Language metadata is present.' : 'Language metadata is missing.')
  add('workflow-state', 'EDITORIAL', record.status === 'published' || record.workflowState === 'PUBLISHED' ? 'PASS' : 'BLOCKED', 'error', record.status === 'published' ? 'Record is explicitly published.' : 'Record is not in a publishable workflow state.')
  add('verification', 'EDITORIAL', ['verified', 'scholarly-review', 'traditional-review'].includes(record.verification) ? 'PASS' : 'BLOCKED', 'error', ['verified', 'scholarly-review', 'traditional-review'].includes(record.verification) ? 'Verification state is acceptable.' : 'Verification state requires review.')
  if (record.approvedHash) add('approval-hash', 'EDITORIAL', record.approvedHash === record.contentHash ? 'PASS' : 'BLOCKED', 'error', record.approvedHash === record.contentHash ? 'Approved content hash is current.' : 'Content changed after approval and requires re-review.')
  const sources = record.sourceIds.map((id) => sourceRecords.find((source) => source.id === id)).filter(Boolean)
  add('sources', 'SOURCE', sources.length === record.sourceIds.length && sources.length > 0 ? 'PASS' : 'BLOCKED', 'error', sources.length === record.sourceIds.length && sources.length > 0 ? 'All source IDs resolve.' : 'One or more required sources are missing.')
  const unknownRights = sources.filter((source) => ['unknown', 'all-rights-reserved', 'permission-required'].includes(source.copyrightStatus))
  add('rights', 'RIGHTS', unknownRights.length ? 'BLOCKED' : 'PASS', unknownRights.length ? 'error' : 'info', unknownRights.length ? `Rights require link-only handling: ${unknownRights.map((source) => source.name).join(', ')}.` : 'Referenced source rights are recorded.')
  const entityClaims = claims.filter((claim) => claim.entityId === record.id)
  const missingEvidence = entityClaims.filter((claim) => claim.evidenceIds.some((id) => !evidence.some((item) => item.id === id)))
  add('evidence', 'EVIDENCE', missingEvidence.length ? 'BLOCKED' : entityClaims.length ? 'PASS' : 'NOT_APPLICABLE', missingEvidence.length ? 'error' : 'info', missingEvidence.length ? 'One or more claims have unresolved evidence.' : entityClaims.length ? 'Claim evidence resolves.' : 'No claims recorded.')
  const publishable = checks.every((check) => check.status !== 'BLOCKED')
  return { publishable, blockers: checks.filter((check) => check.status === 'BLOCKED').map((check) => ({ code: check.id.toUpperCase(), message: check.message, severity: 'error' })), warnings: checks.filter((check) => check.status === 'WARNING').map((check) => check.message), checks }
}

export function compileContent() {
  const errors = []
  const files = filesIn(contentRoot).filter((file) => !file.startsWith(relationshipRoot) && !file.startsWith(sourceRoot) && !file.startsWith(claimRoot) && !file.startsWith(evidenceRoot))
  const relationshipFiles = filesIn(relationshipRoot)
  const sourceRecords = sourceRegistry(errors)
  const sourceIds = new Set(sourceRecords.map((source) => source.id))
  const claimFiles = filesIn(claimRoot)
  const evidenceFiles = filesIn(evidenceRoot)
  const claims = []
  const evidence = []
  for (const file of evidenceFiles) { const { data, body, hash } = parseFrontmatter(file); const label = relative(root, file); if (!data.id || !data.entityId || !data.sourceId || !data.evidenceType || !data.confidence) errors.push(`${label}\nField: evidence\nInvalid value: missing required evidence metadata\nExpected: id, entityId, sourceId, evidenceType, confidence`); if (!sourceIds.has(data.sourceId)) errors.push(`${label}\nField: sourceId\nInvalid value: ${data.sourceId}\nExpected: registered source ID`); if (!evidenceTypes.has(data.evidenceType)) errors.push(`${label}\nField: evidenceType\nInvalid value: ${data.evidenceType}\nExpected: supported evidence type`); if (!confidenceLevels.has(data.confidence)) errors.push(`${label}\nField: confidence\nInvalid value: ${data.confidence}\nExpected: high | medium | low | uncertain`); evidence.push({ ...data, notes: data.notes ?? body, contentHash: hash, sourceFile: label }) }
  for (const file of claimFiles) { const { data, body, hash } = parseFrontmatter(file); const label = relative(root, file); if (!data.id || !data.entityId || !data.claim || !data.claimType || !data.confidence) errors.push(`${label}\nField: claim\nInvalid value: missing required claim metadata\nExpected: id, entityId, claim, claimType, confidence`); if (!claimTypes.has(data.claimType)) errors.push(`${label}\nField: claimType\nInvalid value: ${data.claimType}\nExpected: supported claim type`); if (!confidenceLevels.has(data.confidence)) errors.push(`${label}\nField: confidence\nInvalid value: ${data.confidence}\nExpected: high | medium | low | uncertain`); claims.push({ ...data, sourceIds: list(data.sources), evidenceIds: list(data.evidence), editorialNotes: data.editorialNotes ?? body, contentHash: hash, sourceFile: label }) }
  const records = []
  const ids = new Set()
  for (const file of files) {
    let parsed
    try { parsed = parseFrontmatter(file) } catch (error) { errors.push(error.message); continue }
    const { data, body, hash } = parsed
    const label = relative(root, file)
    const required = ['id', 'title', 'type', 'language', 'sources', 'status', 'verification', 'classifications']
    for (const field of required) if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) errors.push(`${label}\nField: ${field}\nInvalid value: missing\nExpected: required value`)
    if (data.id && ids.has(data.id)) errors.push(`Duplicate entity ID: ${data.id}\nFiles: ${label}`)
    if (data.id) ids.add(data.id)
    if (data.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.id)) errors.push(`${label}\nField: id\nInvalid value: ${data.id}\nExpected: lowercase kebab-case stable ID`)
    if (data.type && !allowedTypes.has(data.type)) errors.push(`${label}\nField: type\nInvalid value: ${data.type}\nExpected: ${[...allowedTypes].join(' | ')}`)
    if (data.status && !statuses.has(data.status)) errors.push(`${label}\nField: status\nInvalid value: ${data.status}\nExpected: ${[...statuses].join(' | ')}`)
    if (data.verification && !verifications.has(data.verification)) errors.push(`${label}\nField: verification\nInvalid value: ${data.verification}\nExpected: ${[...verifications].join(' | ')}`)
    for (const language of list(data.language)) if (!languages.has(language)) errors.push(`${label}\nField: language\nInvalid value: ${language}\nExpected: ${[...languages].join(' | ')}`)
    for (const source of list(data.sources)) if (!sourceIds.has(source)) errors.push(`${label}\nField: sources\nInvalid value: ${source}\nExpected: registered source ID`)
    for (const relationship of list(data.relationships)) if (typeof relationship !== 'string') errors.push(`${label}\nField: relationships\nInvalid value: ${relationship}\nExpected: relationship ID string`)
    for (const classification of list(data.classifications)) if (!taxonomyDomains.has(String(classification).toUpperCase())) errors.push(`${label}\nField: classification\nInvalid value: ${classification}\nExpected: controlled master taxonomy domain`)
    const description = data.description ?? body.split(/\n\s*\n/)[0].replaceAll('\n', ' ').trim()
    if (!description) errors.push(`${label}\nField: description\nInvalid value: missing\nExpected: frontmatter description or non-empty Markdown body`)
    records.push({ ...data, description, sourceIds: list(data.sources), relationshipIds: list(data.relationships), classifications: list(data.classifications), language: list(data.language), aliases: list(data.aliases), body, contentHash: hash, sourceFile: label })
  }
  const recordIds = new Set(records.map((record) => record.id))
  for (const claim of claims) { if (!recordIds.has(claim.entityId)) errors.push(`Claim ${claim.id}\nField: entityId\nInvalid value: ${claim.entityId}\nExpected: entity ID in compiled content`); for (const sourceId of claim.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`Claim ${claim.id}\nField: sources\nInvalid value: ${sourceId}\nExpected: registered source ID`) }
  for (const item of evidence) if (!recordIds.has(item.entityId)) errors.push(`Evidence ${item.id}\nField: entityId\nInvalid value: ${item.entityId}\nExpected: entity ID in compiled content`)
  const relationships = []
  const relationshipIds = new Set()
  for (const file of relationshipFiles) {
    let parsed
    try { parsed = parseFrontmatter(file) } catch (error) { errors.push(error.message); continue }
    const { data, body, hash } = parsed
    const label = relative(root, file)
    for (const field of ['id', 'from', 'relationship', 'to', 'sources']) if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) errors.push(`${label}\nField: ${field}\nInvalid value: missing\nExpected: required relationship value`)
    if (relationshipIds.has(data.id)) errors.push(`Duplicate relationship ID: ${data.id}\nFile: ${label}`)
    relationshipIds.add(data.id)
    if (data.relationship && !relationshipTypes.has(data.relationship)) errors.push(`${label}\nField: relationship\nInvalid value: ${data.relationship}\nExpected: ${[...relationshipTypes].join(' | ')}`)
    for (const source of list(data.sources)) if (!sourceIds.has(source)) errors.push(`${label}\nField: sources\nInvalid value: ${source}\nExpected: registered source ID`)
    relationships.push({ id: data.id, from: data.from, relationship: data.relationship, to: data.to, sourceIds: list(data.sources), editorialNote: body, contentHash: hash, sourceFile: label })
  }
  for (const relationship of relationships) {
    if (!recordIds.has(relationship.from)) errors.push(`Relationship ${relationship.id}\nField: from\nInvalid value: ${relationship.from}\nExpected: entity ID in compiled content`)
    if (!recordIds.has(relationship.to)) errors.push(`Relationship ${relationship.id}\nField: to\nInvalid value: ${relationship.to}\nExpected: entity ID in compiled content`)
    if (!relationshipTypes.has(relationship.relationship)) errors.push(`Relationship ${relationship.id}\nField: relationship\nInvalid value: ${relationship.relationship}\nExpected: ${[...relationshipTypes].join(' | ')}`)
    for (const source of relationship.sourceIds) if (!sourceIds.has(source)) errors.push(`Relationship ${relationship.id}\nField: sourceIds\nInvalid value: ${source}\nExpected: registered source ID`)
  }
  const duplicateSuggestions = []
  const titles = new Map()
  const aliases = new Map()
  for (const record of records) {
    const titleKey = normalizeText(record.title)
    if (titles.has(titleKey)) duplicateSuggestions.push({ kind: 'DUPLICATE_TITLE', entityIds: [titles.get(titleKey), record.id], reason: `Canonical titles normalize to ${titleKey}.`, recommendation: 'Editorial review; do not merge automatically.' })
    titles.set(titleKey, record.id)
    for (const alias of record.aliases) {
      const aliasKey = normalizeText(alias)
      if (aliases.has(aliasKey) && aliases.get(aliasKey) !== record.id) duplicateSuggestions.push({ kind: 'ALIAS_COLLISION', entityIds: [aliases.get(aliasKey), record.id], reason: `Alias collision: ${alias}.`, recommendation: 'Review aliases and canonical identity.' })
      aliases.set(aliasKey, record.id)
    }
  }
  const evidenceCoverage = records.map((record) => {
    const linkedSources = record.sourceIds.map((id) => sourceRecords.find((source) => source.id === id)).filter(Boolean)
    const entityClaims = claims.filter((claim) => claim.entityId === record.id)
    const entityEvidence = evidence.filter((item) => item.entityId === record.id)
    const warnings = []
    if (!linkedSources.length) warnings.push('No source linked.')
    if (entityClaims.length && !entityEvidence.length) warnings.push('Claims have no evidence records.')
    const statusLabel = entityClaims.length === 0 ? (linkedSources.length ? 'NOT_APPLICABLE' : 'NEEDS_EVIDENCE') : entityEvidence.length && !warnings.length ? 'STRONG' : 'NEEDS_EVIDENCE'
    return { entityId: record.id, title: record.title, type: record.type, status: record.status, sourceCount: linkedSources.length, claimCount: entityClaims.length, evidenceCount: entityEvidence.length, primarySource: linkedSources.some((source) => source.authorityLevel === 'primary'), institutionalSource: linkedSources.some((source) => source.authorityLevel === 'institutional'), scholarlySource: linkedSources.some((source) => source.authorityLevel === 'academic'), traditionalSource: linkedSources.some((source) => source.authorityLevel === 'traditional'), statusLabel, warnings }
  })
  const orphanReports = records.map((record) => { const issues = []; if (!record.sourceIds.length) issues.push('No source'); if (!record.classifications.length) issues.push('No classification'); if (!record.body?.trim()) issues.push('No description'); if (!relationships.some((relationship) => relationship.from === record.id || relationship.to === record.id)) issues.push('No relationships'); const onlyRelationshipGap = issues.length === 1 && issues[0] === 'No relationships'; return { entityId: record.id, title: record.title, status: record.status, issues, classification: issues.length >= 3 ? 'ORPHAN' : onlyRelationshipGap && record.sourceIds.length && record.classifications.length && record.body?.trim() ? 'VALID_ISOLATED_ENTITY' : issues.length ? 'NEEDS_REVIEW' : 'VALID_ISOLATED_ENTITY' } })
  const depthAudit = records.filter((record) => depthPriority.has(record.id)).map((record) => { const relationshipCount = relationships.filter((relationship) => relationship.from === record.id || relationship.to === record.id).length; const claimCount = claims.filter((claim) => claim.entityId === record.id).length; const evidenceCount = evidence.filter((item) => item.entityId === record.id).length; return { entityId: record.id, title: record.title, type: record.type, status: record.status, sourceCount: record.sourceIds.length, relationshipCount, claimCount, evidenceCount, needsWork: [record.sourceIds.length ? null : 'source', record.classifications.length ? null : 'classification', record.body?.trim() ? null : 'description', claimCount ? null : 'claim', evidenceCount ? null : 'evidence', relationshipCount ? null : 'relationship'].filter(Boolean) } })
  for (const source of sourceRecords) if (!source.url || !/^https?:\/\//.test(source.url)) errors.push(`Source ${source.id}\nField: url\nInvalid value: ${source.url}\nExpected: http(s) URL`)
  for (const record of records.filter((item) => item.status === 'published')) for (const sourceId of record.sourceIds) {
    const source = sourceRecords.find((item) => item.id === sourceId)
    if (!source?.copyrightStatus || source.copyrightStatus === 'unknown') errors.push(`${record.sourceFile}\nField: sources\nInvalid value: ${sourceId}\nExpected: published content may only reference sources with known copyright status`)
  }
  const readinessById = Object.fromEntries(records.map((record) => [record.id, readiness(record, sourceRecords, claims, evidence)]))
  fail(errors)
  const published = records.filter((record) => record.status === 'published')
  const publicRecords = published.filter((record) => readinessById[record.id].publishable).map((record) => { const safeRecord = { ...record }; delete safeRecord.sourceFile; delete safeRecord.notes; return safeRecord })
  const publicEntityIds = new Set(publicRecords.map((record) => record.id))
  const publicRelationships = relationships.filter((relationship) => publicEntityIds.has(relationship.from) && publicEntityIds.has(relationship.to))
  const publicClaims = claims.filter((claim) => claim.status === 'approved' && publicEntityIds.has(claim.entityId))
  const publicEvidenceIds = new Set(publicClaims.flatMap((claim) => claim.evidenceIds))
  const publicEvidence = evidence.filter((item) => publicEvidenceIds.has(item.id) && item.reviewStatus === 'accepted')
  const searchIndex = publicRecords.map((record) => ({ id: record.id, title: record.title, aliases: record.aliases, sanskritTitle: record.sanskrit ?? record.transliteration ?? '', description: record.description, type: record.type, classification: record.classifications, language: record.language, tags: record.tags ?? [], relatedEntityIds: record.relationshipIds }))
  const entitiesByType = records.reduce((groups, record) => { (groups[record.type] ??= []).push(record); return groups }, {})
  const manifest = { entities: records.length, published: published.length, draft: records.filter((record) => record.status === 'draft').length, entitiesByType, sources: sourceRecords.length, relationships: relationships.length, languages: [...new Set(records.flatMap((record) => record.language))].sort(), compiledAt: new Date().toISOString() }
  mkdirSync(generatedRoot, { recursive: true })
  const editorialEntities = records.map((record) => ({ ...record, publicationReadiness: readinessById[record.id] }))
  const generated = { entities: publicRecords, editorialEntities, relationships: publicRelationships.map(publicRelationship), editorialRelationships: relationships, searchIndex, sources: sourceRecords.map(publicSource), claims: publicClaims.map(publicClaim), evidence: publicEvidence.map(publicEvidenceRecord), editorialClaims: claims, editorialEvidence: evidence, readiness: readinessById, evidenceCoverage, duplicateSuggestions, orphanReports, depthAudit, manifest }
  if (!process.argv.includes('--validate-only')) {
    const publicSources = sourceRecords.map(publicSource)
    for (const [name, data] of Object.entries({ entities: publicRecords, 'editorial-entities': editorialEntities, relationships: publicRelationships.map(publicRelationship), 'editorial-relationships': relationships, 'search-index': searchIndex, sources: publicSources, 'editorial-sources': sourceRecords, claims: publicClaims.map(publicClaim), evidence: publicEvidence.map(publicEvidenceRecord), 'editorial-claims': claims, 'editorial-evidence': evidence, readiness: readinessById, 'evidence-coverage': evidenceCoverage, 'duplicate-suggestions': duplicateSuggestions, 'orphan-reports': orphanReports, 'depth-audit': depthAudit, manifest })) writeFileSync(join(generatedRoot, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
    writeFileSync(join(generatedRoot, 'index.ts'), `// DO NOT EDIT - GENERATED FROM MARKDOWN CONTENT\nimport type { ClaimRecord, EvidenceRecord, PublicationReadiness } from '../types/editorial'\nimport type { EntityRecord, Relationship, SearchDocument, SourceRecord } from '../types/knowledge'\nimport rawEntities from './entities.json'\nimport rawEditorialEntities from './editorial-entities.json'\nimport rawRelationships from './relationships.json'\nimport rawSearchIndex from './search-index.json'\nimport rawSources from './sources.json'\nimport rawEditorialSources from './editorial-sources.json'\nimport rawClaims from './claims.json'\nimport rawEvidence from './evidence.json'\nimport rawEditorialClaims from './editorial-claims.json'\nimport rawEditorialEvidence from './editorial-evidence.json'\nimport rawReadiness from './readiness.json'\nimport evidenceCoverage from './evidence-coverage.json'\nimport duplicateSuggestions from './duplicate-suggestions.json'\nimport orphanReports from './orphan-reports.json'\nimport manifest from './manifest.json'\nconst entities = rawEntities as EntityRecord[]\nconst editorialEntities = rawEditorialEntities as (EntityRecord & { publicationReadiness: PublicationReadiness })[]\nconst relationships = rawRelationships as Relationship[]\nconst searchIndex = rawSearchIndex as SearchDocument[]\nconst sources = rawSources as SourceRecord[]\nconst editorialSources = rawEditorialSources as SourceRecord[]\nconst claims = rawClaims as ClaimRecord[]\nconst evidence = rawEvidence as EvidenceRecord[]\nconst editorialClaims = rawEditorialClaims as ClaimRecord[]\nconst editorialEvidence = rawEditorialEvidence as EvidenceRecord[]\nconst readiness = rawReadiness as Record<string, PublicationReadiness>\nexport { entities, editorialEntities, relationships, searchIndex, sources, editorialSources, claims, evidence, editorialClaims, editorialEvidence, readiness, evidenceCoverage, duplicateSuggestions, orphanReports, manifest }\n`)
    writeFileSync(join(generatedRoot, 'README.md'), '# Generated Content\n\nDO NOT EDIT. These files are generated from `src/content/` by `npm run compile-content`.\n')
    const publishedDomains = [...new Set(publicRecords.flatMap((record) => record.classifications.map((classification) => classification.toLowerCase().replaceAll(' ', '-'))))]
    const publicRoutes = ['/', '/begin', '/scriptures', '/philosophy', '/practice', '/festivals', '/temples', '/sanskrit', '/library', '/search', '/sources', '/about', ...publishedDomains.map((domain) => `/knowledge/${domain}`), ...publicRecords.map((record) => `/${record.type}/${record.id}`)]
    writeFileSync(join(root, 'public', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes.map((route) => `  <url><loc>${route}</loc></url>`).join('\n')}\n</urlset>\n`)
  }
  return generated
}

if (process.argv[1]?.endsWith('compile-content.mjs')) {
  try { const result = compileContent(); console.log(`Content compilation passed: ${result.entities.length} published entity(s), ${result.relationships.length} relationship(s), ${result.searchIndex.length} search document(s).`) } catch (error) { console.error(error.message); process.exitCode = 1 }
}
