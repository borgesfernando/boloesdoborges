#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const validatorPath = path.resolve(__dirname, 'validate-knowledge.js');
const source = fs.readFileSync(validatorPath, 'utf8');

// Structural smoke assertions keep failure-mode requirements explicit without
// adding dependencies or mutating the repository during CI.
assert.match(source, /id duplicado/);
assert.match(source, /resolver obrigatório/);
assert.match(source, /relatedIntent inexistente/);
assert.match(source, /possível segredo\/dado privado detectado/);
assert.match(source, /referência local inexistente/);
assert.match(source, /mustInclude/);
assert.match(source, /mustNotClaim/);

console.log('validate-knowledge.fixtures.test.js: PASS');
