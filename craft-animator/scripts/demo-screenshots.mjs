import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const outDir = '/opt/cursor/artifacts/screenshots'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({
  path: join(outDir, 'craft-animator-welcome.png'),
  fullPage: true,
})

await page.getByRole('button', { name: /Open Maple demo puppet/i }).click()
await page.waitForTimeout(800)
await page.screenshot({
  path: join(outDir, 'craft-animator-maple.png'),
  fullPage: true,
})

await page.getByRole('button', { name: 'Happy' }).click()
await page.getByRole('button', { name: 'Open' }).first().click()
await page.waitForTimeout(300)
await page.screenshot({
  path: join(outDir, 'craft-animator-poses.png'),
  fullPage: true,
})

await page.getByRole('button', { name: 'Play' }).click()
await page.waitForTimeout(900)
await page.screenshot({
  path: join(outDir, 'craft-animator-playing.png'),
  fullPage: true,
})

const libText = await page.locator('.library-panel .count').textContent()
console.log('Library count:', libText)
await browser.close()
console.log('Screenshots written to', outDir)
