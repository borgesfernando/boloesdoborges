#!/usr/bin/env node
/**
 * Atualiza data/mega-status.json e snapshots públicos das loterias.
 * As consultas à CAIXA são restritas às janelas de sorteio definidas em
 * data/calendario-caixa.json, com recovery diário como segunda proteção.
 *
 * Em GitHub Actions, LOTTERY_SCHEDULE_CRON contém a expressão que originou
 * o run. O script reconstrói o último instante nominal daquele cron para
 * que atrasos do scheduler não transformem uma execução válida em "fora de janela".
 */
'use strict';

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
const BRAZIL_UTC_OFFSET_MINUTES = -180;
const PRE_DRAW_MINUTES = 0;
const POST_DRAW_MINUTES = 150;
const MAX_FETCH_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 1200;
const DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULE_LOOKBACK_MINUTES = 12 * 60;

const LOTERIAS = [
  { id: 'megasena', nome: 'Mega-Sena', apiUrl: MEGA_API_URL, outputPath: RAW_OUTPUT_PATH },
  { id: 'maismilionaria', nome: '+Milionária', apiUrl: MAIS_MILIONARIA_API_URL, outputPath: MAIS_MILIONARIA_RAW_OUTPUT_PATH },
  { id: 'lotofacil', nome: 'Lotofácil', apiUrl: LOTOFACIL_API_URL, outputPath: LOTOFACIL_RAW_OUTPUT_PATH },
  { id: 'quina', nome: 'Quina', apiUrl: QUINA_API_URL, outputPath: QUINA_RAW_OUTPUT_PATH },
  { id: 'duplasena', nome: 'Dupla Sena', apiUrl: DUPLA_SENA_API_URL, outputPath: DUPLA_SENA_RAW_OUTPUT_PATH },
];

async function fetchLotteryData(apiUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        Referer: 'https://loterias.caixa.gov.br/',
      },
    });
    if (!response.ok) throw new Error(`Resposta inesperada da API (${response.status})`);
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
      console.warn(`[update-mega-status] Tentativa ${attempt}/${MAX_FETCH_ATTEMPTS} para ${lotteryName} falhou: ${error.message}`);
    }
  }
  throw lastError ?? new Error(`Falha ao buscar dados da ${lotteryName}`);
}

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
  return String(brt.getUTCDate()).padStart(2, '0') + '/' +
    String(brt.getUTCMonth() + 1).padStart(2, '0') + '/' +
    brt.getUTCFullYear();
}

function brtDateTimeToUtc(date, time) {
  const brt = getBrtReference(date);
  const [hours, minutes] = String(time).split(':').map(Number);
  return new Date(Date.UTC(
    brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate(), hours, minutes, 0, 0
  ) - BRAZIL_UTC_OFFSET_MINUTES * 60 * 1000);
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
  if (exceptions.length > 0) {
    return exceptions.filter(({ horario }) => horario).map(({ horario }) => ({ time: horario, kind: 'EXCEPTION' }));
  }
  const version = getCalendarVersion(calendar, getBrtDateIso(now));
  return (version?.modalidades?.[modalidade]?.sorteios ?? [])
    .filter(({ weekday }) => weekday === getBrtWeekday(now))
    .map(({ time }) => ({ time, kind: 'REGULAR' }));
}

function isInsideCriticalWindow(drawTime, now = new Date()) {
  const delta = getBrtTimeMinutes(now) - timeToMinutes(drawTime);
  return delta >= -PRE_DRAW_MINUTES && delta <= POST_DRAW_MINUTES;
}

function cronFieldMatches(field, value) {
  return String(field).split(',').some((part) => {
    if (part === '*') return true;
    if (part.startsWith('*/')) return value % Number(part.slice(2)) === 0;
    const rangeStep = part.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (rangeStep) {
      const a = Number(rangeStep[1]);
      const b = Number(rangeStep[2]);
      const step = Number(rangeStep[3]);
      return value >= a && value <= b && (value - a) % step === 0;
    }
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) return value >= Number(range[1]) && value <= Number(range[2]);
    return Number(part) === value;
  });
}

function cronMatches(cron, date) {
  const fields = String(cron).trim().split(/\s+/);
  if (fields.length !== 5) throw new Error(`Expressão cron inválida: ${cron}`);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
  return cronFieldMatches(minute, date.getUTCMinutes()) &&
    cronFieldMatches(hour, date.getUTCHours()) &&
    cronFieldMatches(dayOfMonth, date.getUTCDate()) &&
    cronFieldMatches(month, date.getUTCMonth() + 1) &&
    cronFieldMatches(dayOfWeek, date.getUTCDay());
}

function resolveScheduledReference(now = new Date(), cron = '', lookbackMinutes = SCHEDULE_LOOKBACK_MINUTES) {
  if (!String(cron).trim()) return now;
  const cursor = new Date(now);
  cursor.setUTCSeconds(0, 0);
  for (let offset = 0; offset <= lookbackMinutes; offset += 1) {
    const candidate = new Date(cursor.getTime() - offset * 60 * 1000);
    if (cronMatches(cron, candidate)) return candidate;
  }
  throw new Error(`Não foi possível reconstruir o slot do cron "${cron}" nos últimos ${lookbackMinutes} minutos`);
}

function selecionarModalidadesParaConsulta(
  now = new Date(),
  calendar = readJsonIfExists(CALENDARIO_PATH),
  scheduleCron = process.env.LOTTERY_SCHEDULE_CRON || ''
) {
  if (process.env.LOTTERY_RECOVERY === '1') return new Set(LOTERIAS.map(({ id }) => id));
  if (!calendar) throw new Error(`Calendário não encontrado: ${CALENDARIO_PATH}`);
  const reference = resolveScheduledReference(now, scheduleCron);
  return new Set(
    LOTERIAS.filter(({ id }) =>
      getDrawsForToday(calendar, id, reference).some(({ time }) => isInsideCriticalWindow(time, reference))
    ).map(({ id }) => id)
  );
}

function getLatestExpectedDraw(calendar, modalidade, now = new Date()) {
  let latest = null;
  for (let daysAgo = 0; daysAgo <= 10; daysAgo += 1) {
    const dayReference = new Date(now.getTime() - daysAgo * DAY_MS);
    for (const draw of getDrawsForToday(calendar, modalidade, dayReference)) {
      const occurredAt = brtDateTimeToUtc(dayReference, draw.time);
      if (occurredAt.getTime() > now.getTime()) continue;
      if (!latest || occurredAt.getTime() > latest.occurredAt.getTime()) {
        latest = { data: formatBrtDate(dayReference), time: draw.time, occurredAt, kind: draw.kind };
      }
    }
  }
  return latest;
}

function calcularFreshnessModalidade(calendar, modalidade, dados, now = new Date(), consultado = false) {
  const expected = getLatestExpectedDraw(calendar, modalidade, now);
  const dataApuracao = dados?.dataApuracao ?? null;
  if (!expected) return { freshness: 'SEM_REFERENCIA', esperadoDataApuracao: null, sorteioEsperadoEm: null };
  if (dataApuracao === expected.data) {
    return { freshness: 'ATUAL', esperadoDataApuracao: expected.data, sorteioEsperadoEm: expected.occurredAt.toISOString() };
  }
  const todaysOccurredDraw = getDrawsForToday(calendar, modalidade, now)
    .find(({ time }) => brtDateTimeToUtc(now, time).getTime() <= now.getTime());
  const insidePostDrawWindow = todaysOccurredDraw &&
    (now.getTime() - brtDateTimeToUtc(now, todaysOccurredDraw.time).getTime()) / 60000 <= POST_DRAW_MINUTES;
  return {
    freshness: consultado && insidePostDrawWindow ? 'AGUARDANDO_APURACAO' : 'DESATUALIZADO',
    esperadoDataApuracao: expected.data,
    sorteioEsperadoEm: expected.occurredAt.toISOString(),
  };
}

async function obterSnapshotAtualizado(apiUrl, lotteryName, outputPath, now, deveConsultar, calendar) {
  const existente = readJsonIfExists(outputPath);
  if (!deveConsultar) return { dados: existente, consultado: false };
  const expected = getLatestExpectedDraw(calendar, lotteryName.id ?? lotteryName, now);
  if (process.env.LOTTERY_RECOVERY !== '1' && expected && existente?.dataApuracao === expected.data) {
    return { dados: existente, consultado: false };
  }
  return { dados: await fetchLotteryDataWithRetry(apiUrl, lotteryName.nome ?? lotteryName), consultado: true };
}

function loadMegaProjectConfig() {
  if (!fs.existsSync(PROJETOS_PATH)) throw new Error(`Arquivo de projetos não encontrado: ${PROJETOS_PATH}`);
  const data = JSON.parse(fs.readFileSync(PROJETOS_PATH, 'utf8'));
  const mega = (data?.estrategicos?.projetos ?? []).find((project) => project.id === MEGA_PROJECT_ID);
  if (!mega) throw new Error(`Projeto estratégico "${MEGA_PROJECT_ID}" não encontrado em data/projetos.json`);
  const minimo = Number(mega.minimo);
  if (!Number.isFinite(minimo) || minimo <= 0) throw new Error(`Valor mínimo inválido para ${MEGA_PROJECT_ID}: ${mega.minimo}`);
  return { minimoMilhoes: Math.max(minimo, 50) };
}

function getJanelaFim(date = new Date()) {
  const brazilReference = getBrtReference(date);
  const utcHour = 18 - BRAZIL_UTC_OFFSET_MINUTES / 60;
  return new Date(Date.UTC(
    brazilReference.getUTCFullYear(), brazilReference.getUTCMonth(), brazilReference.getUTCDate(), utcHour, 0, 0, 0
  ));
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
  return ['concurso', 'acumulado', 'dataProximoConcurso', 'valorEstimadoProximoConcurso', 'minimoMilhoes', 'ativo', 'janelaFim', 'fonte']
    .some((field) => existing[field] !== next[field]);
}

function buildHealth(calendar, snapshots, now, existingHealth) {
  const modalidades = Object.fromEntries(snapshots.map(([id, dados, updated, consultado]) => {
    const freshness = calcularFreshnessModalidade(calendar, id, dados, now, consultado);
    return [id, {
      dataApuracao: dados?.dataApuracao ?? null,
      concurso: dados?.numero ?? null,
      dataProximoConcurso: dados?.dataProximoConcurso ?? null,
      estado: updated ? 'ATUALIZADO' : (existingHealth?.modalidades?.[id]?.estado ?? 'SEM_ALTERACAO'),
      ...freshness,
    }];
  }));
  const comparable = { schemaVersion: 1, timezone: 'America/Sao_Paulo', fonte: 'CAIXA', modalidades };
  const existingComparable = existingHealth ? {
    schemaVersion: existingHealth.schemaVersion,
    timezone: existingHealth.timezone,
    fonte: existingHealth.fonte,
    modalidades: existingHealth.modalidades,
  } : null;
  const stateChanged = JSON.stringify(comparable) !== JSON.stringify(existingComparable);
  return { ...comparable, atualizadoEm: stateChanged ? now.toISOString() : (existingHealth?.atualizadoEm ?? now.toISOString()) };
}

async function main() {
  try {
    const { minimoMilhoes } = loadMegaProjectConfig();
    const agora = new Date();
    const calendar = readJsonIfExists(CALENDARIO_PATH);
    if (!calendar) throw new Error(`Calendário não encontrado: ${CALENDARIO_PATH}`);
    const scheduleCron = process.env.LOTTERY_SCHEDULE_CRON || '';
    const reference = process.env.LOTTERY_RECOVERY === '1' ? agora : resolveScheduledReference(agora, scheduleCron);
    const modalidadesSelecionadas = selecionarModalidadesParaConsulta(agora, calendar, scheduleCron);

    if (scheduleCron && reference.getTime() !== agora.getTime()) {
      console.log(`[update-mega-status] Run atrasado; slot nominal: ${reference.toISOString()} (início real: ${agora.toISOString()})`);
    }
    console.log(
      modalidadesSelecionadas.size > 0
        ? `[update-mega-status] Janela ativa para: ${[...modalidadesSelecionadas].join(', ')}`
        : '[update-mega-status] Fora de janela crítica: nenhuma consulta à CAIXA'
    );

    const resultados = await Promise.all(LOTERIAS.map((loteria) =>
      obterSnapshotAtualizado(
        loteria.apiUrl, loteria, loteria.outputPath, agora,
        modalidadesSelecionadas.has(loteria.id), calendar
      ).then((resultado) => [loteria.id, resultado])
    ));
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
      const updated = consultado && writeJsonIfChanged(outputPath, dados);
      return [id, dados, updated, consultado];
    });
    const anySnapshotUpdated = snapshots.some(([, , updated]) => updated);
    const statusUpdated = hasMegaStatusChanged(readJsonIfExists(OUTPUT_PATH), payload);
    if (statusUpdated) writeJsonIfChanged(OUTPUT_PATH, payload);
    const existingHealth = readJsonIfExists(HEALTH_OUTPUT_PATH);
    const health = buildHealth(calendar, snapshots, agora, existingHealth);
    const healthUpdated = writeJsonIfChanged(HEALTH_OUTPUT_PATH, health);

    console.log(anySnapshotUpdated || statusUpdated || healthUpdated
      ? 'Arquivos de loterias atualizados'
      : 'Nenhuma alteração nas respostas das loterias');
  } catch (error) {
    console.error(`[update-mega-status] Falha ao atualizar mega-status: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  BRAZIL_UTC_OFFSET_MINUTES,
  PRE_DRAW_MINUTES,
  POST_DRAW_MINUTES,
  SCHEDULE_LOOKBACK_MINUTES,
  LOTERIAS,
  getBrtReference,
  getBrtDateIso,
  getBrtTimeMinutes,
  getBrtWeekday,
  formatBrtDate,
  brtDateTimeToUtc,
  getCalendarVersion,
  getDrawsForToday,
  isInsideCriticalWindow,
  cronFieldMatches,
  cronMatches,
  resolveScheduledReference,
  selecionarModalidadesParaConsulta,
  getLatestExpectedDraw,
  calcularFreshnessModalidade,
  buildHealth,
};
