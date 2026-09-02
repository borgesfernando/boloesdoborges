#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/schema.json'), 'utf8'));
const dir = path.join(root, 'data/knowledge/intents');

assert.strictEqual(schema.properties.schemaVersion.const, 1);
const allowedTypes = new Set(schema.properties.intents.items.properties.answerType.enum);
const sourceTypes = new Set(schema.properties.intents.items.properties.sources.items.properties.type.enum);

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  assert.strictEqual(doc.schemaVersion, 1, `${name}: schemaVersion`);
  for (const intent of doc.intents) {
    assert(allowedTypes.has(intent.answerType), `${intent.id}: answerType fora do schema`);
    for (const source of intent.sources) assert(sourceTypes.has(source.type), `${intent.id}: source.type fora do schema`);
  }
}

console.log('validate-knowledge-schema.test.js: PASS');
