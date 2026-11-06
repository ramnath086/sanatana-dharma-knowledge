import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Route-level regression tests for the editorial namespace.
// App.tsx is transpiled with the existing TypeScript devDependency and evaluated
// with stubbed modules, so these tests assert real routing/metadata behaviour
// without a DOM, a test runner, or any new dependency. EditorialRoutes itself is
// never executed: authentication/authorization stays owned by that module.

const root = resolve(process.cwd())
const canonicalOrigin = 'https://sanatana-dharma-knowledge.ramnath86.workers.dev'
const source = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  fileName: 'App.tsx',
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
})

const publishedEntity = { id: 'dharma', type: 'concept', status: 'published', title: 'Dharma', description: 'A published concept.', language: ['en'], classifications: ['CONCEPT'], sourceIds: ['gretil'], aliases: [] }
const publicSource = { id: 'gretil', name: 'GRETIL', organization: 'Test', url: 'https://example.org/', description: 'A source.', sourceType: 'digital-library', authorityLevel: 'institutional', copyrightStatus: 'link-only', license: 'Link only', reuseAllowed: false, howWeUse: ['reference'] }

function collect(node, visit) {
  if (node === null || node === undefined) return
  if (Array.isArray(node)) { for (const child of node) collect(child, visit); return }
  if (typeof node !== 'object') return
  // Expand local function components (NotFound, EntityPage, ...) so assertions see
  // real rendered output. The lazy editorial type is an object, never a function,
  // so EditorialRoutes/auth/Supabase are deliberately never executed here.
  if (typeof node.type === 'function') { collect(node.type(node.props ?? {}), visit); return }
  visit(node)
  if (node.props) collect(node.props.children, visit)
}

function renderPath(pathname) {
  const effects = []
  const lazyTypes = []
  const navigation = []
  const suspense = Symbol('suspense')
  const tags = {
    'meta[name="description"]': { attrs: {}, setAttribute(name, value) { this.attrs[name] = value } },
    'meta[name="robots"]': { attrs: {}, setAttribute(name, value) { this.attrs[name] = value } },
    'link[rel="canonical"]': { attrs: {}, setAttribute(name, value) { this.attrs[name] = value } },
  }
  const document = { title: '', querySelector: (selector) => tags[selector] ?? null }
  const location = { pathname, search: '' }
  Object.defineProperty(location, 'href', {
    configurable: true,
    get: () => `https://example.test${pathname}`,
    set: (value) => { navigation.push(value) },
  })

  const stubs = {
    react: {
      Suspense: suspense,
      lazy: (loader) => { const type = { $$lazy: true, loader }; lazyTypes.push(type); return type },
      useEffect: (effect) => { effects.push(effect) },
      useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    },
    'react/jsx-runtime': {
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
    },
    './App.css': {},
    './components/Cards': { ContentCard: 'ContentCard', SourceCard: 'SourceCard' },
    './components/UI': { Breadcrumbs: 'Breadcrumbs', RelatedContent: 'RelatedContent', SearchBar: 'SearchBar' },
    './generated': { entities: [publishedEntity], relationships: [], searchIndex: [], sources: [publicSource] },
    './data/library': { libraryFilters: ['All'] },
    './data/scriptures': { scriptureHierarchy: [] },
    './data/practices': { practiceCards: [] },
    './data/taxonomy': { taxonomy: [] },
    './pages/Home': { Home: 'Home' },
    './layouts/SiteLayout': { PageFrame: 'PageFrame' },
  }

  const moduleObject = { exports: {} }
  const context = {
    module: moduleObject,
    exports: moduleObject.exports,
    require: (id) => {
      if (id in stubs) return stubs[id]
      throw new Error(`Unexpected module in App.tsx route test: ${id}`)
    },
    window: { location },
    document,
    console,
    URLSearchParams,
  }
  runInNewContext(outputText, context, { filename: 'App.transpiled.js' })
  assert.equal(lazyTypes.length, 1, 'App must lazy-load exactly one editorial module')
  const tree = moduleObject.exports.default()

  const editorial = []
  const publicNotFound = []
  const suspenseNodes = []
  const pageTitles = []
  collect(tree, (node) => {
    if (node.type === lazyTypes[0]) editorial.push(node)
    if (node.type === suspense) suspenseNodes.push(node)
    if (node.type === 'PageFrame') {
      pageTitles.push(node.props?.title)
      if (node.props?.title === 'Page not found') publicNotFound.push(node)
    }
  })
  for (const effect of effects) effect()

  return {
    tree,
    editorial,
    editorialType: lazyTypes[0],
    publicNotFound,
    suspenseNodes,
    pageTitles,
    navigation,
    title: document.title,
    robots: tags['meta[name="robots"]'].attrs.content,
    canonical: tags['link[rel="canonical"]'].attrs.href,
    description: tags['meta[name="description"]'].attrs.content,
  }
}

// 1. Bare `/editorial` and `/editorial/` must enter the editorial route.
for (const [pathname, expectedPath] of [['/editorial', '/editorial'], ['/editorial/', '/editorial']]) {
  const result = renderPath(pathname)
  assert.equal(result.editorial.length, 1, `${pathname} must render the editorial route`)
  assert.equal(result.editorial[0].props.path, expectedPath, `${pathname} must forward the normalized path to EditorialRoutes`)
  assert.equal(result.suspenseNodes.length, 1, `${pathname} must keep the lazy editorial Suspense boundary`)
  assert.equal(result.publicNotFound.length, 0, `${pathname} must not render the public NotFound page`)
  assert.equal(result.robots, 'noindex,nofollow', `${pathname} must stay noindex,nofollow`)
  assert.equal(result.canonical, `${canonicalOrigin}${expectedPath}`, `${pathname} must keep the production canonical`)
  assert.equal(result.navigation.length, 0, `${pathname} must not redirect in App; the auth guard stays in EditorialRoutes`)
}

// 2. `/editorial/login` keeps its existing behaviour and metadata.
{
  const result = renderPath('/editorial/login')
  assert.equal(result.editorial.length, 1, '/editorial/login must render the editorial route')
  assert.equal(result.editorial[0].props.path, '/editorial/login')
  assert.equal(result.publicNotFound.length, 0, '/editorial/login must not render the public NotFound page')
  assert.equal(result.robots, 'noindex,nofollow')
  assert.equal(result.canonical, `${canonicalOrigin}/editorial/login`)
  assert.equal(result.navigation.length, 0, 'App must not bypass the editorial sign-in route')
}

// 3. Editorial descendants stay editorial and noindex,nofollow.
for (const pathname of ['/editorial/review', '/editorial/sources', '/editorial/evidence', '/editorial/content/concept/dharma', '/editorial/preview/concept/dharma']) {
  const result = renderPath(pathname)
  assert.equal(result.editorial.length, 1, `${pathname} must render the editorial route`)
  assert.equal(result.editorial[0].props.path, pathname)
  assert.equal(result.publicNotFound.length, 0, `${pathname} must not render the public NotFound page`)
  assert.equal(result.robots, 'noindex,nofollow', `${pathname} must stay noindex,nofollow`)
  assert.equal(result.canonical, `${canonicalOrigin}${pathname}`)
}

// 4. Public routes are unchanged and remain index,follow.
for (const pathname of ['/', '/begin', '/scriptures', '/concept/dharma', '/sources/gretil', '/knowledge/concept', '/library', '/search']) {
  const result = renderPath(pathname)
  assert.equal(result.editorial.length, 0, `${pathname} must not enter the editorial route`)
  assert.equal(result.robots, 'index,follow', `${pathname} must stay index,follow`)
  assert.equal(result.canonical, `${canonicalOrigin}${pathname}`, `${pathname} must keep the production canonical`)
}
assert.equal(renderPath('/').pageTitles.includes('Page not found'), false)
assert.equal(renderPath('/concept/dharma').pageTitles.includes('Dharma'), true, 'published entity routing must be unchanged')

// 5. The editorial guard must not swallow neighbouring public paths or unknown URLs.
for (const pathname of ['/editorial-policy', '/no-such-page']) {
  const result = renderPath(pathname)
  assert.equal(result.editorial.length, 0, `${pathname} must not enter the editorial route`)
  assert.equal(result.publicNotFound.length, 1, `${pathname} must keep the existing public NotFound behaviour`)
  assert.equal(result.robots, 'index,follow', `${pathname} metadata must be unchanged`)
}

console.log('Editorial route tests passed: /editorial, /editorial/, /editorial/login, editorial descendants, noindex/nofollow + canonical preservation, unchanged public routes, and no App-level auth redirect.')
