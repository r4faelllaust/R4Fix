import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Smoke test uses the built parser via dynamic import of TS through vite-node isn't available;
// reimplement a minimal ZIP/DOMDocument presence check + JSZip parse.
import JSZip from 'jszip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fla = readFileSync(join(__dirname, '../fixtures/sample-rig.fla'))
const zip = await JSZip.loadAsync(fla)
const dom = zip.file('DOMDocument.xml')
if (!dom) {
  console.error('FAIL: no DOMDocument.xml')
  process.exit(1)
}
const xml = await dom.async('string')
if (!xml.includes('libraryItemName="Ball"')) {
  console.error('FAIL: Ball instance missing')
  process.exit(1)
}
const ball = zip.file('LIBRARY/Ball.xml')
const eyes = zip.file('LIBRARY/Eyes.xml')
if (!ball || !eyes) {
  console.error('FAIL: library symbols missing')
  process.exit(1)
}
console.log('OK: sample-rig.fla structure looks good')
void createRequire
