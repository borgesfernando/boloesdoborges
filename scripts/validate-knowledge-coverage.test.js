#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data/knowledge/intents');
const expected = new Set(['about','trust','participation','payments','operations','bets','strategy','transparency','history','prizes','conversion','human','legal','contact','privacy']);
const actual = new Set();

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  actual.add(doc.domain);
}

for (const domain of expected) assert(actual.has(domain), `domínio fundacional ausente: ${domain}`);
console.log(`validate-knowledge-coverage.test.js: PASS (${actual.size} domains)`);
