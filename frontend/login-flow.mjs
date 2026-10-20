import { chromium } from 'playwright'

const test = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const log = (...a) => console.log('>>', ...a)
  page.on('response', async (r) => {
    if (r.url().includes('/api/')) {
      let body = ''
      try { body = (await r.text()).slice(0, 160) } catch { body = '<no body>' }
      log(`RESP ${r.request().method()} ${r.url().replace('http://127.0.0.1:5199','')} ${r.status()} ${body}`)
    }
  })
  page.on('framenavigated', (f) => log('NAV ->', f.url()))

  await page.goto('http://127.0.0.1:5199/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="text"]', 'superadmin')
  await page.fill('input[type="password"]', 'SuperAdmin#123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1000)
  log('localstorage after submit:', await page.evaluate(() => JSON.stringify({
    access: localStorage.getItem('st_access_token')?.slice(0, 20),
    user: localStorage.getItem('st_user'),
  })))
  await page.waitForTimeout(3000)
  log('final URL:', page.url())
  log('localstorage final:', await page.evaluate(() => JSON.stringify({
    access: localStorage.getItem('st_access_token')?.slice(0, 20),
    user: localStorage.getItem('st_user'),
  })))
  const h1 = await page.locator('h1').first().textContent().catch(() => null)
  log('h1:', h1)
  await browser.close()
}
test().catch((e) => { console.error('SCRIPT FAILED:', e); process.exit(1) })
