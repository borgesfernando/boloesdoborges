#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data/knowledge/intents');
let sensitiveCount = 0;

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  for (const intent of doc.intents) {
    if (intent.sensitive !== true) continue;
    sensitiveCount += 1;
    assert(Array.isArray(intent.mustInclude) && intent.mustInclude.length > 0, `${intent.id}: mustInclude ausente`);
    assert(Array.isArray(intent.mustNotClaim) && intent.mustNotClaim.length > 0, `${intent.id}: mustNotClaim ausente`);
  }
}

assert(sensitiveCount > 0, 'nenhum intent sensível de referência');
console.log(`validate-knowledge-sensitive.test.js: PASS (${sensitiveCount} sensitive)`);
