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

function parseISODate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Data ISO inválida: ${value}`);
  }
  return date.toISOString();
}

function loadPayload() {
  const projeto = (process.env.ALERTA_PROJETO || '').trim();
  if (!ALERT_FILES[projeto]) {
    throw new Error('Informe ALERTA_PROJETO (quina-mensal ou lf-mensal).');
  }
  const ativo = parseBoolean(process.env.ALERTA_ATIVO);
  const janelaInicio = parseISODate(process.env.JANELA_INICIO);
  const janelaFim = parseISODate(process.env.JANELA_FIM);

  if (ativo && (!janelaInicio || !janelaFim)) {
    throw new Error('Para ativar o alerta, informe JANELA_INICIO e JANELA_FIM em ISO-8601.');
  }

  return {
    projeto,
    ativo,
    janelaInicio,
    janelaFim,
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
