#!/usr/bin/env bash
set -euo pipefail

node scripts/validate-knowledge.js
node scripts/validate-knowledge.test.js
node scripts/validate-knowledge.fixtures.test.js
node scripts/validate-knowledge-schema.test.js
node scripts/validate-knowledge-sensitive.test.js
node scripts/validate-knowledge-authority.test.js
node scripts/validate-knowledge-faq-authority.test.js
node scripts/validate-knowledge-coverage.test.js
node scripts/validate-knowledge-responses.test.js
node scripts/validate-knowledge-no-production-wiring.test.js
