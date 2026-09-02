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
const LOTOFACIL_API_URL = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/lotofacil';
const QUINA_API_URL = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/quina';
const DUPLA_SENA_API_URL = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/duplasena';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'mega-status.json');
const RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'megasena-api.json');
const MAIS_MILIONARIA_RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'maismilionaria-api.json');
const LOTOFACIL_RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'lotofacil-api.json');
const QUINA_RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'quina-api.json');
const DUPLA_SENA_RAW_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'duplasena-api.json');
const HEALTH_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'loterias-health.json');
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

function dataHojeBrt() {
  const d = new Date(Date.now() + BRAZIL_UTC_OFFSET_MINUTES * 60 * 1000);
  return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
}

async function obterSnapshotAtualizado(apiUrl, lotteryName, outputPath, hojeBrt) {
  const existente = readJsonIfExists(outputPath);
  // Depois de confirmar a apuração do dia, não consulta novamente essa
  // modalidade na mesma janela. A recuperação diária sempre revalida.
  if (process.env.LOTTERY_RECOVERY !== '1' && existente?.dataApuracao === hojeBrt) {
    return { dados: existente, consultado: false };
  }
  return { dados: await fetchLotteryDataWithRetry(apiUrl, lotteryName), consultado: true };
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
    const hojeBrt = dataHojeBrt();
    const [mega, maisMilionaria, lotofacil, quina, duplaSena] = await Promise.all([
      obterSnapshotAtualizado(MEGA_API_URL, 'Mega-Sena', RAW_OUTPUT_PATH, hojeBrt),
      obterSnapshotAtualizado(MAIS_MILIONARIA_API_URL, '+Milionária', MAIS_MILIONARIA_RAW_OUTPUT_PATH, hojeBrt),
      obterSnapshotAtualizado(LOTOFACIL_API_URL, 'Lotofácil', LOTOFACIL_RAW_OUTPUT_PATH, hojeBrt),
      obterSnapshotAtualizado(QUINA_API_URL, 'Quina', QUINA_RAW_OUTPUT_PATH, hojeBrt),
      obterSnapshotAtualizado(DUPLA_SENA_API_URL, 'Dupla Sena', DUPLA_SENA_RAW_OUTPUT_PATH, hojeBrt),
    ]);
    const { dados: megaData } = mega;
    const { dados: maisMilionariaData } = maisMilionaria;
    const { dados: lotofacilData } = lotofacil;
    const { dados: quinaData } = quina;
    const { dados: duplaSenaData } = duplaSena;
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

    const megaSnapshotUpdated = mega.consultado && writeJsonIfChanged(RAW_OUTPUT_PATH, megaData);
    const maisMilionariaSnapshotUpdated = maisMilionaria.consultado && writeJsonIfChanged(
      MAIS_MILIONARIA_RAW_OUTPUT_PATH,
      maisMilionariaData
    );
    const lotofacilSnapshotUpdated = lotofacil.consultado && writeJsonIfChanged(LOTOFACIL_RAW_OUTPUT_PATH, lotofacilData);
    const quinaSnapshotUpdated = quina.consultado && writeJsonIfChanged(QUINA_RAW_OUTPUT_PATH, quinaData);
    const duplaSenaSnapshotUpdated = duplaSena.consultado && writeJsonIfChanged(DUPLA_SENA_RAW_OUTPUT_PATH, duplaSenaData);
    const statusUpdated = hasMegaStatusChanged(readJsonIfExists(OUTPUT_PATH), payload);
    if (statusUpdated) writeJsonIfChanged(OUTPUT_PATH, payload);

    const snapshots = [
      ['megasena', megaData, megaSnapshotUpdated],
      ['maismilionaria', maisMilionariaData, maisMilionariaSnapshotUpdated],
      ['lotofacil', lotofacilData, lotofacilSnapshotUpdated],
      ['quina', quinaData, quinaSnapshotUpdated],
      ['duplasena', duplaSenaData, duplaSenaSnapshotUpdated],
    ];
    const anySnapshotUpdated = snapshots.some(([, , updated]) => updated);
    const existingHealth = readJsonIfExists(HEALTH_OUTPUT_PATH);
    const health = {
      schemaVersion: 1,
      timezone: 'America/Sao_Paulo',
      atualizadoEm: anySnapshotUpdated ? agora.toISOString() : (existingHealth?.atualizadoEm ?? null),
      fonte: 'CAIXA',
      modalidades: Object.fromEntries(snapshots.map(([id, dados, updated]) => [id, {
        dataApuracao: dados?.dataApuracao ?? null,
        concurso: dados?.numero ?? null,
        dataProximoConcurso: dados?.dataProximoConcurso ?? null,
        estado: updated ? 'ATUALIZADO' : 'SEM_ALTERACAO',
      }])),
    };
    const healthUpdated = anySnapshotUpdated && writeJsonIfChanged(HEALTH_OUTPUT_PATH, health);

    if (
      megaSnapshotUpdated ||
      maisMilionariaSnapshotUpdated ||
      lotofacilSnapshotUpdated ||
      quinaSnapshotUpdated ||
      duplaSenaSnapshotUpdated ||
      statusUpdated ||
      healthUpdated
    ) {
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
