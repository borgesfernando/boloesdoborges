#!/usr/bin/env bash
set -euo pipefail

git config core.hooksPath .githooks
chmod +x .githooks/* || true

echo "Git hooks configurados. O pre-commit agora gera data/projetos.json automaticamente."

