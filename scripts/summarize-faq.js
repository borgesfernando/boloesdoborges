#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_MAX = 700;
const DEFAULT_TOTAL_MAX = 0;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { input: 'faq.json', output: 'minifaq.json', max: DEFAULT_MAX, totalMax: DEFAULT_TOTAL_MAX };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const val = args[++i];
    if (val === undefined) {
      console.error(`Erro: a flag ${a} requer um valor.`);
      process.exit(1);
    }
    if (a === '--in' || a === '-i') opts.input = val;
    else if (a === '--out' || a === '-o') opts.output = val;
    else if (a === '--max') opts.max = parseInt(val, 10) || DEFAULT_MAX;
    else if (a === '--total-max') opts.totalMax = parseInt(val, 10) || DEFAULT_TOTAL_MAX;
  }
  if (path.resolve(opts.input) === path.resolve(opts.output)) {
    console.error('Erro: --in e --out não podem apontar para o mesmo arquivo.');
    process.exit(1);
  }
  return opts;
}

function stripAnchors(html) {
  return html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
}

function stripTags(html) {
  return html
    .replace(/<\/?(strong|em|b|i)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPlainText(html) {
  return stripTags(html)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(html) {
  return html
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.!?;:])\s*/g, '$1 ')
    .replace(/(\d),\s+(\d{2})/g, '$1,$2')
    .replace(/\s*<\/(p|li)>\s*/gi, '</$1>')
    .replace(/>\s*</g, '><')
    .trim();
}

function limitText(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastDot = cut.lastIndexOf('. ');
  const lastSpace = cut.lastIndexOf(' ');
  const last = Math.max(lastDot, lastSpace);
  return cut.slice(0, last > 0 ? last : max).trim() + '…';
}

function extractListItems(listHtml) {
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  const items = [];
  let m;
  while ((m = liRegex.exec(listHtml)) !== null) {
    const t = stripTags(stripAnchors(m[1] || ''));
    if (t) items.push(t);
  }
  return items;
}

function renderList(items, maxItems = 5, itemMaxLen = 140) {
  const slice = items.slice(0, maxItems);
  if (!slice.length) return '';
  return '<ul>' + slice.map(t => `<li>${limitText(t, itemMaxLen)}</li>`).join('') + '</ul>';
}

function fitList(items, budget, maxItems = 5, itemMaxLen = 120) {
  if (!items.length || budget <= 0) return '';
  const maxN = Math.min(maxItems, items.length);
  for (let n = maxN; n >= 1; n--) {
    const perItem = Math.max(20, Math.floor((budget - 9) / n) - 9);
    const html = renderList(items, n, Math.min(itemMaxLen, perItem));
    if (html.length <= budget) return html;
  }
  return '';
}

function summarizeAnswer(html, maxLen) {
  const original = html.trim();

  if (original.length <= maxLen) {
    const full = normalize(stripAnchors(original));
    return { html: full, plain: toPlainText(full) };
  }

  const noA = stripAnchors(original);
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const paras = [];
  let pm;
  while ((pm = pRegex.exec(noA)) !== null) paras.push(pm[1]);
  const firstP = paras.length ? stripTags(paras[0]).replace(/\s+/g, ' ').trim() : stripTags(noA);

  const listMatch = noA.match(/<(ul|ol)\b[^>]*>[\s\S]*?<\/(ul|ol)>/i);
  const listItems = listMatch ? extractListItems(listMatch[0]) : [];

  const maxUl = Math.max(80, Math.floor(maxLen * 0.4));
  const maxP = Math.max(0, maxLen - maxUl);
  const pText = limitText(firstP, maxP);
  const pHtml = pText ? `<p>${pText}</p>` : '';
  const ulHtml = fitList(listItems, maxLen - pHtml.length, 5, 120);
  const result = normalize(pHtml + ulHtml);

  return { html: result, plain: toPlainText(result) };
}

function summarizeEntries(entries, max) {
  return entries.map(entry => {
    if (!entry || typeof entry !== 'object') return entry;
    const e = { ...entry };
    if (typeof e.answerHtml === 'string') {
      const { html, plain } = summarizeAnswer(e.answerHtml, max);
      e.answerHtml = html;
      e.answerPlain = plain;
    }
    return e;
  });
}

function main() {
  const opts = parseArgs();
  const absIn = path.resolve(opts.input);
  const absOut = path.resolve(opts.output);

  let raw;
  try {
    raw = fs.readFileSync(absIn, 'utf8');
  } catch (err) {
    console.error(`Erro: não foi possível ler '${absIn}': ${err.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Erro: JSON inválido em '${absIn}': ${err.message}`);
    process.exit(1);
  }

  let max = opts.max;
  let updated = summarizeEntries(data, max);
  let json = JSON.stringify(updated, null, 2) + '\n';

  if (opts.totalMax > 0) {
    let attempts = 0;
    while (json.length > opts.totalMax && max > 200 && attempts < 10) {
      max = Math.floor(max * 0.8);
      updated = summarizeEntries(data, max);
      json = JSON.stringify(updated, null, 2) + '\n';
      attempts++;
    }
    if (json.length > opts.totalMax) {
      console.warn(`Aviso: saída ainda tem ${json.length} caracteres (limite ${opts.totalMax}). Use --max menor.`);
    }
  }

  fs.writeFileSync(absOut, json, 'utf8');
  console.log(`FAQ resumida salva em: ${absOut} (${updated.length} itens, ${json.length} bytes)`);
}

if (require.main === module) main();
