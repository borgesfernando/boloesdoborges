#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, ['scripts/validate-knowledge.js'], {
  cwd: root,
  encoding: 'utf8'
});

assert.strictEqual(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Knowledge dataset válido:/);
console.log('validate-knowledge.test.js: PASS');
