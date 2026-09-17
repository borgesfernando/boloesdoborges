const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://127.0.0.1:8765/';
const OUT = path.join(ROOT, 'artifacts', 'home-visual');

async function inspectPage(page, viewportName) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(response.status(), 200, `${viewportName}: homepage HTTP status`);
  await page.locator('#atualizacoes-operacionais-home').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const text = document.querySelector('#atualizacoes-operacionais-home')?.textContent || '';
    return !text.includes('Carregando atualizações públicas');
  }, { timeout: 15000 });
  const panel = await page.locator('#atualizacoes-operacionais-home').innerText();
  assert.ok(panel.trim(), `${viewportName}: painel vazio`);
  assert.ok(/Agora na comunidade|Atualizações factuais indisponíveis/i.test(panel), `${viewportName}: painel sem renderização ou fallback explícito`);
  assert.equal(errors.length, 0, `${viewportName}: JavaScript errors: ${errors.join(' | ')}`);
  assert.equal(await page.locator('h1').count(), 1, `${viewportName}: H1 único`);
  assert.equal(await page.locator('.hero-side-card').count(), 1, `${viewportName}: destaque lateral`);
  assert.equal(await page.locator('.project-card.linha-card').count(), 3, `${viewportName}: cards de projetos`);
  const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert.ok(overflow.scroll <= overflow.viewport + 2, `${viewportName}: overflow horizontal ${overflow.scroll} > ${overflow.viewport}`);
  const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(a => a.getAttribute('href')));
  for (const href of links) {
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href) || href.startsWith('//')) continue;
    const local = href.split(/[?#]/)[0];
    if (!local) continue;
    assert.ok(fs.existsSync(path.join(ROOT, local)), `${viewportName}: link local inexistente ${href}`);
  }
  assert.equal(await page.locator('a[href*="docs.google.com/forms"],a[href*="wa.me"],a[href*="pix"]').count(), 0, `${viewportName}: links de adesão direta`);
  await page.screenshot({ path: path.join(OUT, `home-${viewportName}.png`), fullPage: true });
}

test('home restaurada funciona em Chromium desktop e mobile', { timeout: 90000 }, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      try { await inspectPage(page, name); } finally { await page.close(); }
    }
  } finally { await browser.close(); }
});
