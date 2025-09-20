#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { max: 700 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--in' || a === '-i') opts.input = args[++i];
    else if (a === '--out' || a === '-o') opts.output = args[++i];
    else if (a === '--max') opts.max = parseInt(args[++i], 10) || opts.max;
  }
  if (!opts.input || !opts.output) {
    console.error('Uso: node scripts/summarize-faq.js --in faq.json --out faq.json [--max 700]');
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

function normalize(html) {
  return html
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.!?;:])\s*/g, '$1 ')
    .replace(/\s*<\/(p|li)>\s*/gi, '</$1>')
    .replace(/>\s*</g, '><')
    .trim();
}

function limitText(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const last = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf(' '));
  return cut.slice(0, last > 0 ? last : max).trim() + '…';
}

function reduceList(ulHtml, maxItems = 5, itemMaxLen = 140) {
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  const items = [];
  let m;
  while ((m = liRegex.exec(ulHtml)) !== null) {
    const t = stripTags(stripAnchors(m[1] || ''));
    if (t) items.push(limitText(t, itemMaxLen));
  }
  const slice = items.slice(0, maxItems);
  if (!slice.length) return '';
  return '<ul>' + slice.map(t => `<li>${t}</li>`).join('') + '</ul>';
}

function summarizeAnswer(html, maxLen) {
  const original = html.trim();
  if (original.length <= maxLen) return normalize(stripAnchors(original));

  const noA = stripAnchors(original);
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const paras = [];
  let pm;
  while ((pm = pRegex.exec(noA)) !== null) paras.push(pm[1]);
  const firstP = paras.length ? stripTags(paras[0]).replace(/\s+/g, ' ').trim() : stripTags(noA);

  // Captura a primeira lista se existir
  const ulMatch = noA.match(/<ul\b[^>]*>[\s\S]*?<\/ul>/i);
  let ulReduced = '';
  if (ulMatch) {
    ulReduced = reduceList(ulMatch[0], 5, 120);
  }

  // Monta resposta reduzida
  let result = `<p>${limitText(firstP, Math.floor(maxLen * 0.55))}</p>` + (ulReduced || '');

  // Se ainda passar do limite, reduza novamente
  if (result.length > maxLen) {
    const shorterP = `<p>${limitText(firstP, Math.floor(maxLen * 0.45))}</p>`;
    const shorterUl = ulReduced ? reduceList(ulReduced, 4, 90) : '';
    result = shorterP + shorterUl;
  }

  return normalize(result);
}

function main() {
  const { input, output, max } = parseArgs();
  const absIn = path.resolve(input);
  const absOut = path.resolve(output);
  const raw = fs.readFileSync(absIn, 'utf8');
  const data = JSON.parse(raw);
  const updated = data.map(entry => {
    if (!entry || typeof entry !== 'object') return entry;
    const e = { ...entry };
    if (typeof e.answerHtml === 'string') {
      e.answerHtml = summarizeAnswer(e.answerHtml, max);
    }
    return e;
  });
  const json = JSON.stringify(updated, null, 2) + '\n';
  fs.writeFileSync(absOut, json, 'utf8');
  console.log(`FAQ resumida salva em: ${absOut}`);
}

if (require.main === module) main();

