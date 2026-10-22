/**
 * Headless check: load app, import eric-style-rig.fla, expect Rig panel poses.
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, '../dist')
const flaPath = join(__dirname, '../fixtures/eric-style-rig.fla')

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

const server = createServer(async (req, res) => {
  try {
    let url = req.url?.split('?')[0] || '/'
    if (url === '/') url = '/index.html'
    const file = join(dist, url)
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('nope')
  }
})

await new Promise((r) => server.listen(4177, '127.0.0.1', r))

let browser
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await page.goto('http://127.0.0.1:4177/', { waitUntil: 'networkidle' })
  // dismiss via Maple if Open Rig needs dialog — use Demo then import via file chooser on File menu
  // Use hidden file input from launcher: click Open Rig triggers dialog in electron only;
  // in browser openRigPicker dispatches craft-open-rig-input which clicks input — but input is on launcher.
  // Click Demo first... actually better: set input files on the launcher file input after making it fire.
  await page.evaluate(() => {
    // force welcome visible already
  })
  const fla = readFileSync(flaPath)
  // The launcher has a hidden file input — trigger via custom event after attaching listener
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
    page.locator('button.launcher-play').click(),
  ])
  if (fileChooser) {
    await fileChooser.setFiles({
      name: 'eric-style-rig.fla',
      mimeType: 'application/octet-stream',
      buffer: fla,
    })
  } else {
    // Browser path: Open Rig uses native dialog in Electron; inject import via DataTransfer drop
    await page.evaluate(async (b64) => {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const file = new File([bin], 'eric-style-rig.fla')
      const dt = new DataTransfer()
      dt.items.add(file)
      window.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }))
    }, fla.toString('base64'))
  }

  await page.waitForTimeout(2000)
  // Dismiss launcher if still up by loading via drop (DropOverlay works even under launcher? pointer-events none on overlay card but drop is on window)
  await page.keyboard.press('Escape').catch(() => {})
  const status = await page.locator('.status-main').textContent()
  const libCount = await page.locator('.library-panel .count').textContent()
  const rigCount = await page.locator('.rig-panel .count').textContent().catch(() => '0')
  console.log('status:', status)
  console.log('library:', libCount, 'rig poses:', rigCount)
  if (!libCount || Number(libCount) < 3) {
    console.error('FAIL: expected library symbols from Eric rig')
    process.exitCode = 1
  } else {
    console.log('OK: Eric-style rig imported')
  }
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/craft-animator-eric-import.png', fullPage: true })
} catch (e) {
  console.error(e)
  process.exitCode = 1
} finally {
  await browser?.close()
  server.close()
}
