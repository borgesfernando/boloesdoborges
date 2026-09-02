#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const protectedFiles = [
  'faq.json',
  'scripts/generate-faq-html.js',
  'scripts/summarize-faq.js',
  '.github/workflows/sync-faq-novo-site.yml',
  'js/estado-operacional.js'
];

for (const rel of protectedFiles) {
  assert(fs.existsSync(path.join(root, rel)), `${rel}: contrato existente ausente`);
}

// This foundation intentionally exposes no runtime loader. Consumers are a later phase.
assert(!fs.existsSync(path.join(root, 'js/knowledge.js')), 'runtime knowledge loader não pertence à fase fundacional');
console.log('validate-knowledge-no-production-wiring.test.js: PASS');
