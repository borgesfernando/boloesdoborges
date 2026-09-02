#!/usr/bin/env bash
set -euo pipefail

node scripts/validate-knowledge.js
node scripts/validate-knowledge.test.js
node scripts/validate-knowledge.fixtures.test.js
node scripts/validate-knowledge-schema.test.js
