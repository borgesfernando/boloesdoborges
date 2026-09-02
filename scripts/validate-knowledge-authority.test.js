#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data/knowledge/intents');

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  for (const intent of doc.intents) {
    if (!['dynamic', 'hybrid'].includes(intent.answerType)) continue;
    assert(intent.resolver, `${intent.id}: resolver ausente`);
    assert(
      intent.sources.some((s) => s.type === 'operational_state') || intent.answerType === 'human',
      `${intent.id}: resposta mutável sem fonte operational_state`
    );
  }
}

console.log('validate-knowledge-authority.test.js: PASS');
