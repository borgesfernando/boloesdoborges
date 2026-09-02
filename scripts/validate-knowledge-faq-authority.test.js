#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

assert.match(read('README.md'), /faq\.json` continua como fonte de verdade|faq\.json.*fonte de verdade/is);
assert.match(read('scripts/generate-faq-html.js'), /const faqPath = 'faq\.json'/);
assert.match(read('scripts/summarize-faq.js'), /input: 'faq\.json'/);
assert.match(read('.github/workflows/sync-faq-novo-site.yml'), /cp faq\.json novo-site\/src\/data\/faq\.json/);

console.log('validate-knowledge-faq-authority.test.js: PASS');
