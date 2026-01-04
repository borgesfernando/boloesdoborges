#!/usr/bin/env node
/**
 * Atualiza data/mensais-alert.json com a janela de chamada dos projetos mensais.
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mensais-alert.json');

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
  const ativo = parseBoolean(process.env.ALERTA_ATIVO);
  const janelaInicio = parseISODate(process.env.JANELA_INICIO);
  const janelaFim = parseISODate(process.env.JANELA_FIM);

  if (ativo && (!janelaInicio || !janelaFim)) {
    throw new Error('Para ativar o alerta, informe JANELA_INICIO e JANELA_FIM em ISO-8601.');
  }

  return {
    ativo,
    janelaInicio,
    janelaFim,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

function main() {
  try {
    const payload = loadPayload();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`Arquivo atualizado em ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(`[update-mensais-alert] Falha ao atualizar mensais-alert: ${error.message}`);
    process.exit(1);
  }
}

main();
