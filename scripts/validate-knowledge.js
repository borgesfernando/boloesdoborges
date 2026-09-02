#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT, 'data', 'knowledge');
const INTENTS_DIR = path.join(KNOWLEDGE_DIR, 'intents');
const SUPPORTED_SCHEMA = 1;
const VALID_ANSWER_TYPES = new Set(['canonical', 'dynamic', 'hybrid', 'human']);
const VALID_SOURCE_TYPES = new Set(['faq', 'documentation', 'operational_state', 'historical_dataset', 'terms']);

function fail(message) {
  throw new Error(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`${path.relative(ROOT, file)}: JSON inválido (${err.message})`);
  }
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertStringArray(value, label, { min = 0 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.some((v) => !nonEmptyString(v))) {
    fail(`${label}: esperado array de strings não vazias`);
  }
}

function validateSource(source, label) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) fail(`${label}: fonte inválida`);
  if (!VALID_SOURCE_TYPES.has(source.type)) fail(`${label}: tipo de fonte inválido: ${source.type}`);
  if (!nonEmptyString(source.reference)) fail(`${label}: reference obrigatório`);

  if (['faq', 'documentation', 'operational_state', 'historical_dataset', 'terms'].includes(source.type)) {
    const local = path.resolve(ROOT, source.reference);
    if (!local.startsWith(ROOT + path.sep) || !fs.existsSync(local)) {
      fail(`${label}: referência local inexistente: ${source.reference}`);
    }
  }
}

function scanSensitive(value, label) {
  const text = JSON.stringify(value);
  const forbidden = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /(?:api[_-]?key|access[_-]?token|secret)\s*[=:]\s*["']?[A-Za-z0-9_\-.]{16,}/i,
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
    /(?:pix|cpf|telefone|whatsapp|telegram)[_-]?(?:id|key|chave)?\s*[=:]\s*["'][^"']+["']/i
  ];
  if (forbidden.some((rx) => rx.test(text))) fail(`${label}: possível segredo/dado privado detectado`);
}

function main() {
  const schema = readJson(path.join(KNOWLEDGE_DIR, 'schema.json'));
  if (schema?.properties?.schemaVersion?.const !== SUPPORTED_SCHEMA) fail('schema.json: versão inesperada');

  if (!fs.existsSync(INTENTS_DIR)) fail('data/knowledge/intents inexistente');
  const files = fs.readdirSync(INTENTS_DIR).filter((f) => f.endsWith('.json')).sort();
  if (!files.length) fail('nenhum arquivo de intents encontrado');

  const ids = new Map();
  const related = [];
  let count = 0;

  for (const name of files) {
    const file = path.join(INTENTS_DIR, name);
    const doc = readJson(file);
    const rel = path.relative(ROOT, file);
    if (doc.schemaVersion !== SUPPORTED_SCHEMA) fail(`${rel}: schemaVersion inválido`);
    if (!nonEmptyString(doc.domain)) fail(`${rel}: domain obrigatório`);
    if (!Array.isArray(doc.intents)) fail(`${rel}: intents deve ser array`);
    scanSensitive(doc, rel);

    for (const [index, intent] of doc.intents.entries()) {
      const label = `${rel}#${index}`;
      if (!intent || typeof intent !== 'object' || Array.isArray(intent)) fail(`${label}: intent inválido`);
      if (!nonEmptyString(intent.id) || !/^[a-z0-9_.-]+$/.test(intent.id)) fail(`${label}: id inválido`);
      if (ids.has(intent.id)) fail(`${label}: id duplicado ${intent.id} (já em ${ids.get(intent.id)})`);
      ids.set(intent.id, label);
      if (!nonEmptyString(intent.intent)) fail(`${label}: intent obrigatório`);
      assertStringArray(intent.examples, `${label}.examples`, { min: 1 });
      if (!VALID_ANSWER_TYPES.has(intent.answerType)) fail(`${label}: answerType inválido`);
      if (!intent.response || !nonEmptyString(intent.response.short) || !nonEmptyString(intent.response.standard)) {
        fail(`${label}: response.short e response.standard são obrigatórios`);
      }
      if (!Array.isArray(intent.sources) || !intent.sources.length) fail(`${label}: sources obrigatório`);
      intent.sources.forEach((source, i) => validateSource(source, `${label}.sources[${i}]`));
      if ((intent.answerType === 'dynamic' || intent.answerType === 'hybrid') && !nonEmptyString(intent.resolver)) {
        fail(`${label}: resolver obrigatório para ${intent.answerType}`);
      }
      if (intent.sensitive === true) {
        assertStringArray(intent.mustInclude, `${label}.mustInclude`, { min: 1 });
        assertStringArray(intent.mustNotClaim, `${label}.mustNotClaim`, { min: 1 });
      }
      if (intent.relatedIntents !== undefined) {
        assertStringArray(intent.relatedIntents, `${label}.relatedIntents`);
        for (const target of intent.relatedIntents) related.push({ from: intent.id, target, label });
      }
      count += 1;
    }
  }

  for (const edge of related) {
    if (!ids.has(edge.target)) fail(`${edge.label}: relatedIntent inexistente ${edge.target}`);
  }

  console.log(`Knowledge dataset válido: ${count} intents em ${files.length} arquivo(s).`);
}

try {
  main();
} catch (err) {
  console.error(`Knowledge validation failed: ${err.message}`);
  process.exit(1);
}
