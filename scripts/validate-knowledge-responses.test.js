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
    const response = JSON.stringify(intent.response);
    assert(!/ROTA_[A-Z0-9_]+/.test(response), `${intent.id}: token de rota não resolvido em resposta`);
    assert(!/<script\b/i.test(response), `${intent.id}: script não permitido em resposta`);
  }
}

console.log('validate-knowledge-responses.test.js: PASS');
