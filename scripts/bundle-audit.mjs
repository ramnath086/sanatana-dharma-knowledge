import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist', 'assets')
const files = statSync(dist, { throwIfNoEntry: false }) ? readdirSync(dist).filter((file) => file.endsWith('.js')) : []
const sizes = files.map((file) => ({ file, bytes: readFileSync(join(dist, file)).byteLength })).sort((a, b) => b.bytes - a.bytes)
console.log('Bundle audit')
console.log('------------')
if (!sizes.length) console.log('No built JavaScript assets found.')
for (const asset of sizes) console.log(`${asset.file}: ${(asset.bytes / 1024).toFixed(1)} kB`)
console.log('Note: public and editorial route code currently share the static SPA bundle; production route protection requires a later server boundary.')
