import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { canonicalOrigin, claimRoot, compileContent, contentRoot, evidenceRoot, isEditorialRoute, parseFrontmatter, root, sourceRoot } from './compile-content.mjs'
import { validateClaim, validateConflict, validateEvidence } from './editorial-validation.mjs'
import { canTransition } from './editorial-workflow.mjs'

const testRoot = join(contentRoot, '__compiler-tests__')
const writeTest = (name, frontmatter) => { mkdirSync(testRoot, { recursive: true }); const file = join(testRoot, name); writeFileSync(file, `---\n${frontmatter}\n---\n\nTest body.`); return file }
const writeSourceTest = (name, frontmatter) => { mkdirSync(sourceRoot, { recursive: true }); const file = join(sourceRoot, name); writeFileSync(file, `---\n${frontmatter}\n---\n\nSource test.`); return file }
const writeRecord = (directory, name, frontmatter) => { mkdirSync(directory, { recursive: true }); const file = join(directory, name); writeFileSync(file, `---\n${frontmatter}\n---\n\nTest record.`); return file }
const expectsFailure = (name, frontmatter, expected) => { const file = writeTest(name, frontmatter); try { assert.throws(() => compileContent(), new RegExp(expected)) } finally { rmSync(file, { force: true }) } }

try {
  const parsed = parseFrontmatter(join(contentRoot, 'scriptures', 'rigveda.md'))
  assert.equal(parsed.data.id, 'rigveda')
  assert.deepEqual(parsed.data.language, ['sa', 'en'])
  const compiled = compileContent()
  assert.ok(Array.isArray(compiled.entities))
  assert.equal(compiled.entities.some((entity) => entity.status !== 'published'), false, 'draft records must not enter generated public entities')
  assert.equal(compiled.searchIndex.length, compiled.entities.length, 'search index must include every published entity')
  assert.ok(compiled.relationships.every((relationship) => relationship.from && relationship.to))
  assert.ok(compiled.manifest.languages.includes('en'))
  const sitemap = readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8')
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.equal(canonicalOrigin, 'https://sanatana-dharma-knowledge.ramnath86.workers.dev')
  assert.ok(sitemapUrls.length > 0, 'sitemap must contain public routes')
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URLs must be unique')
  for (const url of sitemapUrls) assert.equal(new URL(url).origin, canonicalOrigin, 'sitemap URLs must use the absolute production origin')
  const sitemapPaths = new Set(sitemapUrls.map((url) => new URL(url).pathname))
  assert.equal(sitemapPaths.has('/search'), false, 'search must not be in the sitemap')
  for (const route of ['/editorial', '/editorial/login', '/editorial/review', '/editorial/sources', '/editorial/evidence', '/editorial/content/concept/dharma', '/editorial/preview/concept/dharma']) {
    assert.equal(isEditorialRoute(route), true, 'editorial routes, including the namespace root, must be private')
    assert.equal(sitemapPaths.has(route), false, 'private editorial routes must not be in the sitemap')
  }
  assert.equal(isEditorialRoute('/sources/gretil'), false, 'public source profiles must remain public')
  assert.equal(isEditorialRoute('/editorial-policy'), false, 'the public editorial-policy link is not an internal workspace route')
  for (const route of ['/', '/begin', '/scriptures', '/philosophy', '/practice', '/festivals', '/temples', '/sanskrit', '/library', '/sources', '/about']) assert.ok(sitemapPaths.has(route), `public portal route ${route} must remain in the sitemap`)
  for (const entity of compiled.entities) {
    assert.ok(sitemapPaths.has(`/${entity.type}/${entity.id}`), `published content route /${entity.type}/${entity.id} must remain in the sitemap`)
    for (const domain of entity.classifications) assert.ok(sitemapPaths.has(`/knowledge/${domain.toLowerCase().replaceAll(' ', '-')}`), 'published knowledge domains must remain in the sitemap')
  }
  assert.ok(readFileSync(join(root, 'index.html'), 'utf8').includes(`<link rel="canonical" href="${canonicalOrigin}/" />`), 'initial HTML canonical must be the absolute production homepage')
  assert.ok(readFileSync(join(root, 'public', 'robots.txt'), 'utf8').split(/\r?\n/).includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'robots.txt must advertise the absolute production sitemap')
  assert.equal(compiled.sources.find((source) => source.id === 'gretil').reuseAllowed, false, 'unknown rights must default to link-only behavior')
  assert.equal(canTransition('DRAFT', 'SOURCE_CHECK'), true)
  assert.equal(canTransition('DRAFT', 'PUBLISHED'), false)
  assert.equal(compiled.readiness.dharma.publishable, true)
  const publicEntities = JSON.parse(readFileSync(join(root, 'src', 'generated', 'entities.json'), 'utf8'))
  const publicSources = JSON.parse(readFileSync(join(root, 'src', 'generated', 'sources.json'), 'utf8'))
  const publicRelationships = JSON.parse(readFileSync(join(root, 'src', 'generated', 'relationships.json'), 'utf8'))
  const publicClaims = JSON.parse(readFileSync(join(root, 'src', 'generated', 'claims.json'), 'utf8'))
  const publicEvidence = JSON.parse(readFileSync(join(root, 'src', 'generated', 'evidence.json'), 'utf8'))
  assert.equal(publicEntities.some((entity) => entity.status !== 'published'), false, 'public entities must exclude drafts')
  assert.equal(publicEntities.some((entity) => 'sourceFile' in entity || 'notes' in entity), false, 'private entity metadata must not be public')
  assert.equal(publicSources.some((source) => 'sourceFile' in source || 'notes' in source || 'verifiedBy' in source), false, 'private source metadata must not be public')
  assert.equal(publicRelationships.some((relationship) => 'editorialNote' in relationship || 'sourceFile' in relationship), false, 'editorial relationship metadata must not be public')
  assert.equal(publicClaims.some((claim) => claim.status !== 'approved'), false, 'unapproved claims must not be public')
  assert.equal(publicEvidence.some((item) => item.reviewStatus !== 'accepted'), false, 'unaccepted evidence must not be public')
  assert.equal(publicEntities.some((entity) => entity.classifications.includes('SHRUTI')), true, 'published taxonomy must contain discoverable domains')
  expectsFailure('duplicate.md', 'id: rigveda\ntitle: Duplicate\ntype: concept\nlanguage: [en]\nsources: [gretil]\nstatus: draft\nverification: unverified\nclassifications: [philosophy]', 'Duplicate entity ID')
  expectsFailure('invalid-type.md', 'id: compiler-invalid-type\ntitle: Invalid\ntype: no-such-type\nlanguage: [en]\nsources: [gretil]\nstatus: draft\nverification: unverified\nclassifications: [philosophy]', 'Field: type')
  expectsFailure('invalid-domain.md', 'id: compiler-invalid-domain\ntitle: Invalid domain\ntype: concept\nlanguage: [en]\nsources: [gretil]\nstatus: draft\nverification: unverified\nclassifications: [NOT_A_DOMAIN]', 'Field: classification')
  expectsFailure('missing-source.md', 'id: compiler-missing-source\ntitle: Missing Source\ntype: concept\nlanguage: [en]\nsources: [no-such-source]\nstatus: draft\nverification: unverified\nclassifications: [philosophy]', 'registered source ID')
  const licensedSource = writeSourceTest('licensed-test.md', 'id: licensed-test\nname: Licensed test\norganization: Test organization\nurl: https://example.org/licensed\nsourceType: educational\nauthorityLevel: institutional\nlanguages: [en]\nlicense: CC BY 4.0\ncopyrightStatus: cc-by\naccessDate: 2026-09-06\nlastVerified: 2026-09-06\ndescription: Test source\ntopics: [testing]\nreuseAllowed: true\nredistributionAllowed: true\ncommercialUseAllowed: true\navailability: active')
  const publishedFile = writeTest('published.md', 'id: compiler-published\ntitle: Published sample\ntype: concept\nlanguage: [en, sa]\naliases: [Published]\nsources: [licensed-test]\nstatus: published\nverification: verified\nclassifications: [philosophy]')
  try {
    const publishedCompilation = compileContent()
    assert.equal(publishedCompilation.entities.some((entity) => entity.id === 'compiler-published'), true)
    assert.equal(publishedCompilation.searchIndex.some((document) => document.id === 'compiler-published'), true)
    assert.equal(publishedCompilation.sources.find((source) => source.id === 'licensed-test').reuseAllowed, true)
  } finally { rmSync(publishedFile, { force: true }); rmSync(licensedSource, { force: true }) }
  assert.equal(compileContent().sources.find((source) => source.id === 'gretil').reuseAllowed, false)
  const sourceIds = new Set(['gretil']); const entityIds = new Set(['dharma']); const claimIds = new Set(['claim-dharma'])
  assert.deepEqual(validateEvidence({ entityId: 'dharma', sourceId: 'gretil', evidenceType: 'primary-text', confidence: 'high' }, sourceIds, entityIds), [])
  assert.ok(validateClaim({ entityId: 'dharma', claimType: 'historical', sourceIds: ['missing'] }, sourceIds, entityIds).length > 0)
  assert.ok(validateConflict({ claimIds: ['claim-missing'] }, claimIds).length > 0)
  const evidenceFile = writeRecord(evidenceRoot, 'test-evidence.md', 'id: evidence-test\nentityId: dharma\nsourceId: gretil\nevidenceType: primary-text\nconfidence: medium\nreviewStatus: needs-review')
  const claimFile = writeRecord(claimRoot, 'test-claim.md', 'id: claim-test\nentityId: dharma\nclaim: A test editorial claim\nclaimType: definition\nsources: [gretil]\nevidence: [evidence-test]\nconfidence: medium\nstatus: draft')
  try { const withClaims = compileContent(); assert.equal(withClaims.editorialClaims.some((claim) => claim.id === 'claim-test'), true); assert.equal(withClaims.editorialEvidence.some((item) => item.id === 'evidence-test'), true); assert.equal(withClaims.claims.some((claim) => claim.id === 'claim-test'), false) } finally { rmSync(evidenceFile, { force: true }); rmSync(claimFile, { force: true }) }
  console.log('Content compiler tests passed: valid content, duplicate IDs, invalid types, missing sources, draft exclusion, search generation, multilingual metadata, relationship validation, and SEO (canonical sitemap/HTML/robots, search/editorial exclusion, and published route preservation).')
} finally { rmSync(testRoot, { recursive: true, force: true }); compileContent() }
