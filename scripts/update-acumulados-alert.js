#!/usr/bin/env node
/**
 * Atualiza o JSON de alerta dos projetos estratégicos manuais
 * (mega-50mais ou milionaria).
 */
const fs = require('fs');
const path = require('path');

const ALERT_FILES = {
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
    throw new Error('Informe ALERTA_PROJETO (mega-50mais ou milionaria).');
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
    console.error(`[update-acumulados-alert] Falha ao atualizar acumulados-alert: ${error.message}`);
    process.exit(1);
  }
}

main();
