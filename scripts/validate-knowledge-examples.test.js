#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data/knowledge/intents');
const seen = new Map();
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  for (const intent of doc.intents) {
    for (const example of intent.examples) {
      const key = normalize(example);
      assert(key, `${intent.id}: exemplo vazio após normalização`);
      const prior = seen.get(key);
      assert(!prior || prior === intent.id, `exemplo duplicado entre intents: "${example}" (${prior} / ${intent.id})`);
      seen.set(key, intent.id);
    }
  }
}

console.log(`validate-knowledge-examples.test.js: PASS (${seen.size} examples)`);
