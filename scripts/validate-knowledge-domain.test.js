#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data/knowledge/intents');

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  assert.strictEqual(doc.domain, path.basename(name, '.json'), `${name}: domain deve coincidir com o nome do arquivo`);
  for (const intent of doc.intents) assert(intent.id.startsWith(`${doc.domain}.`), `${intent.id}: prefixo deve coincidir com domain`);
}

console.log('validate-knowledge-domain.test.js: PASS');
