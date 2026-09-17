const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('restaura a hierarquia visual e a navegação institucional', () => {
  for (const marker of ['hero-container', 'hero-side-card', 'cards-linhas-principais', 'como-funciona', 'tecnologia-transparencia', 'faq-destaques', 'cta-final']) {
    assert.ok(html.includes(marker), `Ausente: ${marker}`);
  }
  for (const page of ['linhas-de-projetos.html', 'estrategias.html', 'ia.html', 'faq.html', 'prest.html']) {
    assert.ok(html.includes(`href="${page}"`), `Navegação ausente: ${page}`);
  }
});

test('preserva Publisher/Site Projection sem reativar as chamadas históricas', () => {
  assert.match(html, /id="atualizacoes-operacionais-home"/);
  assert.match(html, /src="js\/estado-operacional\.js"/);
  assert.doesNotMatch(html, /src="js\/(?:landing|acumulados-alert|mensais-alert)\.js"/);
  assert.doesNotMatch(html, /id="(?:avisoTopo|btnParticipar|abertura-janeiro|mega-acumulada-alert)"/);
});

test('GitHub Pages permanece arquivo e o domínio próprio continua canônico', () => {
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/site\.boloesdoborges\.shop\/"/);
  assert.match(html, /GitHub Pages: arquivo informativo, não é URL final de campanhas/);
  assert.doesNotMatch(html, /docs\.google\.com\/forms|wa\.me\/|(?:href|action)="[^"]*(?:pix|checkout)/i);
  assert.doesNotMatch(html, /Quero participar|Reservar minha vaga|Garantir sua cota|Entrar na Comunidade/i);
});

test('mantém informações responsáveis e Facebook sem prometer disponibilidade', () => {
  assert.match(html, /18\+\. Jogue com responsabilidade/);
  assert.match(html, /não existe garantia de prêmio/);
  assert.match(html, /sem vínculo, chancela ou patrocínio da Caixa/);
  assert.match(html, /https:\/\/www\.facebook\.com\/profile\.php\?id=61576639235105/);
  assert.match(html, /Este arquivo não confirma abertura de participação/);
});
