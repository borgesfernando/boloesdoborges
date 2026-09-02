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
const CALENDARIO_PATH = path.join(__dirname, '..', 'data', 'calendario-caixa.json');
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

async function obterSnapshotAtualizado(apiUrl, lotteryName, outputPath, hojeBrt, deveConsultar) {
  const existente = readJsonIfExists(outputPath);
  if (!deveConsultar) return { dados: existente, consultado: false };

  // Depois de confirmar a apuração do dia, não consulta novamente essa
  // modalidade na mesma janela. A recuperação diária sempre revalida.
  if (process.env.LOTTERY_RECOVERY !== '1' && existente?.dataApuracao === hojeBrt) {
    return { dados: existente, consultado: false };
  }
  return { dados: await fetchLotteryDataWithRetry(apiUrl, lotteryName), consultado: true };
}

const LOTERIAS = [
  { id: 'megasena', nome: 'Mega-Sena', apiUrl: MEGA_API_URL, outputPath: RAW_OUTPUT_PATH },
  { id: 'maismilionaria', nome: '+Milionária', apiUrl: MAIS_MILIONARIA_API_URL, outputPath: MAIS_MILIONARIA_RAW_OUTPUT_PATH },
  { id: 'lotofacil', nome: 'Lotofácil', apiUrl: LOTOFACIL_API_URL, outputPath: LOTOFACIL_RAW_OUTPUT_PATH },
  { id: 'quina', nome: 'Quina', apiUrl: QUINA_API_URL, outputPath: QUINA_RAW_OUTPUT_PATH },
  { id: 'duplasena', nome: 'Dupla Sena', apiUrl: DUPLA_SENA_API_URL, outputPath: DUPLA_SENA_RAW_OUTPUT_PATH },
];

function getBrtReference(date = new Date()) {
  return new Date(date.getTime() + BRAZIL_UTC_OFFSET_MINUTES * 60 * 1000);
}

function getBrtDateIso(date = new Date()) {
  return getBrtReference(date).toISOString().slice(0, 10);
}

function getBrtTimeMinutes(date = new Date()) {
  const brt = getBrtReference(date);
  return brt.getUTCHours() * 60 + brt.getUTCMinutes();
}

function getBrtWeekday(date = new Date()) {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][getBrtReference(date).getUTCDay()];
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
}

function formatBrtDate(date = new Date()) {
  const brt = getBrtReference(date);
  return String(brt.getUTCDate()).padStart(2, '0') + '/' + String(brt.getUTCMonth() + 1).padStart(2, '0') + '/' + brt.getUTCFullYear();
}

function getCalendarVersion(calendar, dateIso) {
  return (calendar?.versions ?? []).find(({ validFrom, validUntil }) =>
    validFrom <= dateIso && (!validUntil || dateIso <= validUntil)
  );
}

function getDrawsForToday(calendar, modalidade, now = new Date()) {
  const today = formatBrtDate(now);
  const exceptions = (calendar?.exceptions ?? []).filter(
    (exception) => exception.modalidade === modalidade && exception.dataSorteio === today
  );
  if (exceptions.length > 0) return exceptions.map(({ horario }) => ({ time: horario }));

  const version = getCalendarVersion(calendar, getBrtDateIso(now));
  return (version?.modalidades?.[modalidade]?.sorteios ?? [])
    .filter(({ weekday }) => weekday === getBrtWeekday(now));
}

function selecionarModalidadesParaConsulta(now = new Date()) {
  if (process.env.LOTTERY_RECOVERY === '1') {
    return new Set(LOTERIAS.map(({ id }) => id));
  }

  const calendar = readJsonIfExists(CALENDARIO_PATH);
  if (!calendar) throw new Error(`Calendário não encontrado: ${CALENDARIO_PATH}`);

  const nowMinutes = getBrtTimeMinutes(now);
  return new Set(
    LOTERIAS
      .filter(({ id }) => getDrawsForToday(calendar, id, now).some(({ time }) => {
        const delta = nowMinutes - timeToMinutes(time);
        return delta >= -10 && delta <= 60;
      }))
      .map(({ id }) => id)
  );
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
    const agora = new Date();
    const hojeBrt = dataHojeBrt();
    const modalidadesSelecionadas = selecionarModalidadesParaConsulta(agora);

    console.log(
      modalidadesSelecionadas.size > 0
        ? `[update-mega-status] Janela ativa para: ${[...modalidadesSelecionadas].join(', ')}`
        : '[update-mega-status] Fora de janela crítica: nenhuma consulta à CAIXA'
    );

    const resultados = await Promise.all(
      LOTERIAS.map((loteria) =>
        obterSnapshotAtualizado(
          loteria.apiUrl,
          loteria.nome,
          loteria.outputPath,
          hojeBrt,
          modalidadesSelecionadas.has(loteria.id)
        ).then((resultado) => [loteria.id, resultado])
      )
    );
    const porModalidade = Object.fromEntries(resultados);
    const megaData = porModalidade.megasena.dados;
    if (!megaData) throw new Error('Snapshot da Mega-Sena não encontrado');

    const valorEstimadoProximoConcurso = Number(megaData?.valorEstimadoProximoConcurso ?? 0);
    const numero = megaData?.numero ?? megaData?.numeroConcurso ?? null;
    const dataProximoConcurso = megaData?.dataProximoConcurso ?? null;
    const acumulado = Boolean(megaData?.acumulado);
    const minimoReais = minimoMilhoes * 1_000_000;
    const ativo = valorEstimadoProximoConcurso >= minimoReais;
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

    const snapshots = LOTERIAS.map(({ id, outputPath }) => {
      const { dados, consultado } = porModalidade[id];
      return [id, dados, consultado && writeJsonIfChanged(outputPath, dados)];
    });
    const anySnapshotUpdated = snapshots.some(([, , updated]) => updated);
    const statusUpdated = hasMegaStatusChanged(readJsonIfExists(OUTPUT_PATH), payload);
    if (statusUpdated) writeJsonIfChanged(OUTPUT_PATH, payload);

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

    if (anySnapshotUpdated || statusUpdated || healthUpdated) {
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
