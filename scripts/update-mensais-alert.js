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
  'lf-independencia': path.join(__dirname, '..', 'data', 'lf-independencia-alert.json'),
  'quina-saojoao': path.join(__dirname, '..', 'data', 'quina-saojoao-alert.json'),
  'ds-pascoa': path.join(__dirname, '..', 'data', 'ds-pascoa-alert.json'),
  'mega-virada': path.join(__dirname, '..', 'data', 'mega-virada-alert.json'),
};
const ROTATION_FILE = path.join(__dirname, '..', 'data', 'strategic-alert-rotation.json');
const STRATEGIC_PROJECTS = new Set(['mega-50mais', 'milionaria']);

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  throw new Error('Informe ALERTA_ATIVO como true ou false.');
}

function loadRotation() {
  if (!fs.existsSync(ROTATION_FILE)) return { ultimoModelo: 2, ativacoes: {} };
  const rotation = JSON.parse(fs.readFileSync(ROTATION_FILE, 'utf8'));
  return {
    ultimoModelo: rotation.ultimoModelo === 1 ? 1 : 2,
    ativacoes: rotation.ativacoes && typeof rotation.ativacoes === 'object' ? rotation.ativacoes : {},
  };
}

function resolveStrategicModel(projeto, ativo, concurso, correlationId) {
  if (!STRATEGIC_PROJECTS.has(projeto)) return 1;
  if (!concurso || !correlationId) {
    throw new Error('Informe ALERTA_CONCURSO e ALERTA_CORRELATION_ID para alertas estratégicos.');
  }
  const rotation = loadRotation();
  const key = `${projeto}:${concurso}:${correlationId}`;
  let modelo = rotation.ativacoes[key];
  if (ativo && !modelo) {
    modelo = rotation.ultimoModelo === 1 ? 2 : 1;
    rotation.ultimoModelo = modelo;
    rotation.ativacoes[key] = modelo;
    fs.writeFileSync(ROTATION_FILE, JSON.stringify(rotation, null, 2) + '\n', 'utf8');
  }
  return modelo === 2 ? 2 : 1;
}

function loadPayload() {
  const projeto = (process.env.ALERTA_PROJETO || '').trim();
  if (!ALERT_FILES[projeto]) {
    throw new Error(`Informe ALERTA_PROJETO (${Object.keys(ALERT_FILES).join(', ')}).`);
  }
  const ativo = parseBoolean(process.env.ALERTA_ATIVO);
  const concurso = (process.env.ALERTA_CONCURSO || '').trim();
  const correlationId = (process.env.ALERTA_CORRELATION_ID || '').trim();
  const modelo = resolveStrategicModel(projeto, ativo, concurso, correlationId);

  return {
    projeto,
    ativo,
    modelo,
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

if (require.main === module) {
  main();
}

module.exports = { parseBoolean, loadPayload, main };
