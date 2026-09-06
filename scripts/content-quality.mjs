import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compileContent } from './compile-content.mjs'

const result = compileContent()
const publicEntities = JSON.parse(readFileSync(join(process.cwd(), 'src', 'generated', 'entities.json'), 'utf8'))
const publicSearch = JSON.parse(readFileSync(join(process.cwd(), 'src', 'generated', 'search-index.json'), 'utf8'))
const publicSources = JSON.parse(readFileSync(join(process.cwd(), 'src', 'generated', 'sources.json'), 'utf8'))
const privacyFields = ['sourceFile', 'editorialNote', 'verifiedBy', 'verificationNotes', 'notes']
const leaks = [...publicEntities, ...publicSearch, ...publicSources].flatMap((item) => privacyFields.filter((field) => field in item).map((field) => `${item.id ?? item.title}: ${field}`))
if (leaks.length) { console.error(`Public artifact privacy check failed:\n${leaks.join('\n')}`); process.exitCode = 1 } else { console.log(`Content quality\n---------------\nEntities: ${result.manifest.entities}\nPublished: ${publicEntities.length}\nSearch documents: ${publicSearch.length}\nSources: ${publicSources.length}\nDuplicate suggestions: ${result.duplicateSuggestions.length}\nOrphan diagnostics: ${result.orphanReports.filter((item) => item.classification !== 'VALID_ISOLATED_ENTITY').length}\nPublic privacy: PASS`) }
