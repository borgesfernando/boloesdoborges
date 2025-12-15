#!/usr/bin/env node
/**
 * Atualiza data/mega-status.json com base na API oficial da Caixa.
 * Usa data/projetos.json como fonte para descobrir o valor mínimo configurado
 * para o projeto "mega-acumulada".
 */
const fs = require('fs');
const path = require('path');

const API_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mega-status.json');
const PROJETOS_PATH = path.join(__dirname, '..', 'data', 'projetos.json');
const MEGA_PROJECT_ID = 'mega-acumulada';

async function fetchMegaData() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        Referer: 'https://loterias.caixa.gov.br/',
      },
    });

    if (!response.ok) {
      throw new Error(`Resposta inesperada da API (${response.status})`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function loadMegaProjectConfig() {
  if (!fs.existsSync(PROJETOS_PATH)) {
    throw new Error(`Arquivo de projetos não encontrado: ${PROJETOS_PATH}`);
  }

  const raw = fs.readFileSync(PROJETOS_PATH, 'utf8');
  const data = JSON.parse(raw);
  const acumulados = data?.acumulados?.projetos ?? [];
  const mega = acumulados.find((project) => project.id === MEGA_PROJECT_ID);

  if (!mega) {
    throw new Error(`Projeto acumulado "${MEGA_PROJECT_ID}" não encontrado em data/projetos.json`);
  }

  const minimo = Number(mega.minimo);
  if (!Number.isFinite(minimo) || minimo <= 0) {
    throw new Error(`Valor mínimo inválido para ${MEGA_PROJECT_ID}: ${mega.minimo}`);
  }

  return { minimoMilhoes: minimo };
}

async function main() {
  try {
    const { minimoMilhoes } = loadMegaProjectConfig();
    const megaData = await fetchMegaData();
    const valorEstimadoProximoConcurso = Number(megaData?.valorEstimadoProximoConcurso ?? 0);
    const numero = megaData?.numero ?? megaData?.numeroConcurso ?? null;
    const dataProximoConcurso = megaData?.dataProximoConcurso ?? null;
    const acumulado = Boolean(megaData?.acumulado);
    const ativo = valorEstimadoProximoConcurso >= minimoMilhoes * 1_000_000;

    const payload = {
      concurso: numero,
      acumulado,
      dataProximoConcurso,
      valorEstimadoProximoConcurso,
      minimoMilhoes,
      ativo,
      ultimaAtualizacao: new Date().toISOString(),
      fonte: API_URL,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`Arquivo atualizado em ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(`[update-mega-status] Falha ao atualizar mega-status: ${error.message}`);
    process.exit(1);
  }
}

main();
