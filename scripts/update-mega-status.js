#!/usr/bin/env node
/**
 * Atualiza data/mega-status.json com base na API oficial da Caixa.
 * Usa data/projetos.json como fonte para descobrir o valor mínimo configurado
 * para o projeto "mega-acumulada".
 */
const fs = require('fs');
const path = require('path');

const MEGA_API_URL = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena';
const MAIS_MILIONARIA_API_URL = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/maismilionaria';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mega-status.json');
const RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'megasena-api.json');
const MAIS_MILIONARIA_RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'maismilionaria-api.json');
const PROJETOS_PATH = path.join(__dirname, '..', 'data', 'projetos.json');
const MEGA_PROJECT_ID = 'mega-acumulada';
const BRAZIL_UTC_OFFSET_MINUTES = -180; // America/Sao_Paulo (UTC-3)
const MAX_FETCH_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 1200;

async function fetchLotteryData(apiUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(apiUrl, {
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLotteryDataWithRetry(apiUrl, lotteryName) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      const backoff = BASE_RETRY_DELAY_MS * 2 ** (attempt - 2);
      const jitter = Math.floor(Math.random() * 250);
      await delay(backoff + jitter);
    }

    try {
      return await fetchLotteryData(apiUrl);
    } catch (error) {
      lastError = error;
      console.warn(
        `[update-mega-status] Tentativa ${attempt}/${MAX_FETCH_ATTEMPTS} para ${lotteryName} falhou: ${error.message}`
      );
    }
  }

  throw lastError ?? new Error(`Falha ao buscar dados da ${lotteryName}`);
}

function loadMegaProjectConfig() {
  if (!fs.existsSync(PROJETOS_PATH)) {
    throw new Error(`Arquivo de projetos não encontrado: ${PROJETOS_PATH}`);
  }

  const raw = fs.readFileSync(PROJETOS_PATH, 'utf8');
  const data = JSON.parse(raw);
  const estrategicos = data?.estrategicos?.projetos ?? [];
  const mega = estrategicos.find((project) => project.id === MEGA_PROJECT_ID);

  if (!mega) {
    throw new Error(`Projeto estratégico "${MEGA_PROJECT_ID}" não encontrado em data/projetos.json`);
  }

  const minimo = Number(mega.minimo);
  if (!Number.isFinite(minimo) || minimo <= 0) {
    throw new Error(`Valor mínimo inválido para ${MEGA_PROJECT_ID}: ${mega.minimo}`);
  }

  return { minimoMilhoes: Math.max(minimo, 50) };
}

function getJanelaFim(date = new Date()) {
  const brazilReference = new Date(date.getTime() + BRAZIL_UTC_OFFSET_MINUTES * 60 * 1000);
  const year = brazilReference.getUTCFullYear();
  const month = brazilReference.getUTCMonth();
  const day = brazilReference.getUTCDate();
  const utcHour = 18 - BRAZIL_UTC_OFFSET_MINUTES / 60;
  return new Date(Date.UTC(year, month, day, utcHour, 0, 0, 0));
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonIfChanged(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) return false;
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function hasMegaStatusChanged(existing, next) {
  if (!existing) return true;
  const fields = [
    'concurso',
    'acumulado',
    'dataProximoConcurso',
    'valorEstimadoProximoConcurso',
    'minimoMilhoes',
    'ativo',
    'janelaFim',
    'fonte',
  ];
  return fields.some((field) => existing[field] !== next[field]);
}

async function main() {
  try {
    const { minimoMilhoes } = loadMegaProjectConfig();
    const [megaData, maisMilionariaData] = await Promise.all([
      fetchLotteryDataWithRetry(MEGA_API_URL, 'Mega-Sena'),
      fetchLotteryDataWithRetry(MAIS_MILIONARIA_API_URL, '+Milionária'),
    ]);
    const valorEstimadoProximoConcurso = Number(megaData?.valorEstimadoProximoConcurso ?? 0);
    const numero = megaData?.numero ?? megaData?.numeroConcurso ?? null;
    const dataProximoConcurso = megaData?.dataProximoConcurso ?? null;
    const acumulado = Boolean(megaData?.acumulado);
    const minimoReais = minimoMilhoes * 1_000_000;
    const ativo = valorEstimadoProximoConcurso >= minimoReais;
    const agora = new Date();
    const janelaFim = getJanelaFim(agora);

    const payload = {
      concurso: numero,
      acumulado,
      dataProximoConcurso,
      valorEstimadoProximoConcurso,
      minimoMilhoes,
      ativo,
      janelaInicio: agora.toISOString(),
      janelaFim: janelaFim.toISOString(),
      ultimaAtualizacao: agora.toISOString(),
      fonte: MEGA_API_URL,
    };

    const megaSnapshotUpdated = writeJsonIfChanged(RAW_OUTPUT_PATH, megaData);
    const maisMilionariaSnapshotUpdated = writeJsonIfChanged(
      MAIS_MILIONARIA_RAW_OUTPUT_PATH,
      maisMilionariaData
    );
    const statusUpdated = hasMegaStatusChanged(readJsonIfExists(OUTPUT_PATH), payload);
    if (statusUpdated) writeJsonIfChanged(OUTPUT_PATH, payload);

    if (megaSnapshotUpdated || maisMilionariaSnapshotUpdated || statusUpdated) {
      console.log('Arquivos de loterias atualizados');
    } else {
      console.log('Nenhuma alteração nas respostas das loterias');
    }
  } catch (error) {
    console.error(`[update-mega-status] Falha ao atualizar mega-status: ${error.message}`);
    process.exit(1);
  }
}

main();
