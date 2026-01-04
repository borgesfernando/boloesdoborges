#!/usr/bin/env node
/**
 * Atualiza o JSON de alerta do projeto mensal (quina-mensal ou lf-mensal).
 */
const fs = require('fs');
const path = require('path');

const ALERT_FILES = {
  'quina-mensal': path.join(__dirname, '..', 'data', 'quina-mensal-alert.json'),
  'lf-mensal': path.join(__dirname, '..', 'data', 'lf-mensal-alert.json'),
};

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'sim';
}

function loadPayload() {
  const projeto = (process.env.ALERTA_PROJETO || '').trim();
  if (!ALERT_FILES[projeto]) {
    throw new Error('Informe ALERTA_PROJETO (quina-mensal ou lf-mensal).');
  }
  const ativo = parseBoolean(process.env.ALERTA_ATIVO);

  return {
    projeto,
    ativo,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

function main() {
  try {
    const payload = loadPayload();
    const outputPath = ALERT_FILES[payload.projeto];
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`Arquivo atualizado em ${outputPath}`);
  } catch (error) {
    console.error(`[update-mensais-alert] Falha ao atualizar mensais-alert: ${error.message}`);
    process.exit(1);
  }
}

main();
