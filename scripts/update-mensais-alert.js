#!/usr/bin/env node
/**
 * Atualiza o JSON de alerta de projetos com janela pública manual.
 */
const fs = require('fs');
const path = require('path');

const ALERT_FILES = {
  'quina-mensal': path.join(__dirname, '..', 'data', 'quina-mensal-alert.json'),
  'lf-mensal': path.join(__dirname, '..', 'data', 'lf-mensal-alert.json'),
  'ds-mensal': path.join(__dirname, '..', 'data', 'ds-mensal-alert.json'),
  'mega-50mais': path.join(__dirname, '..', 'data', 'mega-50mais-alert.json'),
  milionaria: path.join(__dirname, '..', 'data', 'milionaria-alert.json'),
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
    throw new Error(`Informe ALERTA_PROJETO (${Object.keys(ALERT_FILES).join(', ')}).`);
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
    console.error(`[update-mensais-alert] Falha ao atualizar alerta: ${error.message}`);
    process.exit(1);
  }
}

main();
