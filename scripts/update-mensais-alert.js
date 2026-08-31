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

const CATALOGO_V2 = {
  'lf-mensal': { nome: 'Lotofácil Mensal', tipo: 'MENSAL' },
  'quina-mensal': { nome: 'Quina Mensal', tipo: 'MENSAL' },
  'ds-mensal': { nome: 'Dupla Sena Mensal', tipo: 'MENSAL' },
  'lf-independencia': { nome: 'Lotofácil da Independência', tipo: 'ESPECIAL' },
  'quina-saojoao': { nome: 'Quina de São João', tipo: 'ESPECIAL' },
  'ds-pascoa': { nome: 'Dupla Sena de Páscoa', tipo: 'ESPECIAL' },
  'mega-virada': { nome: 'Mega da Virada', tipo: 'ESPECIAL' },
  'mega-50mais': { nome: 'Mega-Sena 50+', tipo: 'ESTRATEGICO' },
  'milionaria': { nome: '+Milionária', tipo: 'ESTRATEGICO' },
};
const CAMPOS_PROIBIDOS_V2 = /(?:token|secret|senha|password|planilha|spreadsheet|drive|pix|whatsapp|grupo|invite|convite|authorization|cookie)/i;

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

function sanitizarContextoPublico(contextoBruto) {
  if (!contextoBruto) return {};
  let parsed;
  try {
    parsed = JSON.parse(contextoBruto);
  } catch (erro) {
    throw new Error('ALERTA_CONTEXTO_PUBLICO deve ser um JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('ALERTA_CONTEXTO_PUBLICO deve ser um objeto JSON.');
  }
  const saida = {};
  for (const chave of Object.keys(parsed)) {
    if (CAMPOS_PROIBIDOS_V2.test(chave)) {
      throw new Error('Contexto público contém campo inválido: ' + chave);
    }
    saida[chave] = String(parsed[chave] ?? '').trim();
  }
  return saida;
}

function loadPayload(env) {
  const fonte = env && typeof env === 'object' ? env : process.env;
  const projeto = (fonte.ALERTA_PROJETO || '').trim();
  if (!ALERT_FILES[projeto]) {
    throw new Error(`Informe ALERTA_PROJETO (${Object.keys(ALERT_FILES).join(', ')}).`);
  }
  const ativo = parseBoolean(fonte.ALERTA_ATIVO);
  const concurso = (fonte.ALERTA_CONCURSO || '').trim();
  const correlationId = (fonte.ALERTA_CORRELATION_ID || '').trim();
  const modelo = resolveStrategicModel(projeto, ativo, concurso, correlationId);
  const contextoPublico = sanitizarContextoPublico(fonte.ALERTA_CONTEXTO_PUBLICO);

  return {
    projeto,
    ativo,
    modelo,
    concurso,
    correlationId,
    estado: (fonte.ALERTA_ESTADO || '').trim(),
    abreEm: (fonte.ALERTA_ABRE_EM || '').trim(),
    fechaEm: (fonte.ALERTA_FECHA_EM || '').trim(),
    timezone: (fonte.ALERTA_TIMEZONE || '').trim(),
    atualizadoEm: (fonte.ALERTA_ATUALIZADO_EM || '').trim(),
    contextoPublico,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

function emptyAggregate() {
  const projetos = {};
  for (const [slug, meta] of Object.entries(CATALOGO_V2)) {
    projetos[slug] = {
      slug,
      nome: meta.nome,
      tipo: meta.tipo,
      estado: 'INDISPONIVEL',
      ativo: false,
      fase: 'INDISPONIVEL',
      concurso: '',
      abreEm: '',
      fechaEm: '',
      timezone: 'America/Sao_Paulo',
      janelaComunidade: { abreEm: '', fechaEm: '', timezone: 'America/Sao_Paulo' },
      contexto: {},
      atualizadoEm: '',
      correlationId: '',
      fonteEstado: 'Apps_Scripts',
    };
  }
  return { schemaVersion: 2, generatedAt: new Date().toISOString(), timezone: 'America/Sao_Paulo', projetos };
}

function estadoV2DePayload(payload) {
  const estado = payload.estado === 'ABERTA' ? 'ABERTA' : payload.ativo ? 'ABERTA' : 'FECHADA';
  const timezone = payload.timezone || 'America/Sao_Paulo';
  return {
    slug: payload.projeto,
    nome: CATALOGO_V2[payload.projeto].nome,
    tipo: CATALOGO_V2[payload.projeto].tipo,
    estado,
    ativo: estado === 'ABERTA',
    fase: estado === 'ABERTA' ? 'INSCRICOES' : 'ENCERRADA',
    concurso: String(payload.concurso || ''),
    abreEm: String(payload.abreEm || ''),
    fechaEm: String(payload.fechaEm || ''),
    timezone,
    janelaComunidade: {
      abreEm: String(payload.abreEm || ''),
      fechaEm: String(payload.fechaEm || ''),
      timezone,
    },
    contexto: payload.contextoPublico && typeof payload.contextoPublico === 'object' ? payload.contextoPublico : {},
    atualizadoEm: String(payload.atualizadoEm || new Date().toISOString()),
    correlationId: String(payload.correlationId || ''),
    fonteEstado: 'Apps_Scripts',
  };
}

function updateAggregate(payload, estadoPath) {
  const esqueleto = emptyAggregate();
  let atual = esqueleto;
  if (estadoPath && fs.existsSync(estadoPath)) {
    try {
      const lido = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
      if (lido && typeof lido === 'object' && lido.projetos && typeof lido.projetos === 'object') {
        atual = lido;
        atual.projetos = Object.assign({}, esqueleto.projetos, atual.projetos);
      }
    } catch (erro) { /* corrompido: recria a partir do esqueleto */ }
  }
  if (!atual.projetos[payload.projeto] || typeof atual.projetos[payload.projeto] !== 'object') {
    atual.projetos[payload.projeto] = {};
  }
  const projetosAntes = JSON.stringify(atual.projetos);
  atual.projetos[payload.projeto] = Object.assign({}, esqueleto.projetos[payload.projeto], atual.projetos[payload.projeto], estadoV2DePayload(payload));
  atual.schemaVersion = 2;
  if (JSON.stringify(atual.projetos) !== projetosAntes) {
    atual.generatedAt = new Date().toISOString();
  }
  atual.timezone = 'America/Sao_Paulo';
  if (estadoPath) {
    const novoConteudo = JSON.stringify(atual, null, 2) + '\n';
    if (!fs.existsSync(estadoPath) || fs.readFileSync(estadoPath, 'utf8') !== novoConteudo) {
      fs.writeFileSync(estadoPath, novoConteudo, 'utf8');
    }
  }
  return atual;
}

/**
 * Atualiza o estado operacional agregado (data/estado-operacional.json) de forma
 * idempotente e sanitizada em schema v2 com todos os projetos canônicos.
 * Atualizar um projeto preserva integralmente os demais.
 * @param {string} estadoPath Caminho do arquivo estado-operacional.json.
 * @param {{projeto:string, ativo:boolean, estado?:string, concurso?:string, abreEm?:string, fechaEm?:string, timezone?:string, correlationId?:string, atualizadoEm?:string, contextoPublico?:Object}} dados Dados sanitizados do contrato operacional.
 * @returns {{atualizado:boolean, projeto?:string}}
 */
function atualizarEstadoOperacional(estadoPath, dados) {
  if (!dados || !ALERT_FILES[dados.projeto]) return { atualizado: false };
  const antes = fs.existsSync(estadoPath) ? fs.readFileSync(estadoPath, 'utf8') : null;
  const payload = {
    projeto: dados.projeto,
    ativo: dados.ativo === true,
    concurso: dados.concurso || '',
    correlationId: dados.correlationId || '',
    estado: dados.estado || '',
    abreEm: dados.abreEm || '',
    fechaEm: dados.fechaEm || '',
    timezone: dados.timezone || 'America/Sao_Paulo',
    atualizadoEm: dados.atualizadoEm || '',
    contextoPublico: dados.contextoPublico && typeof dados.contextoPublico === 'object' ? dados.contextoPublico : {},
  };
  updateAggregate(payload, estadoPath);
  const depois = fs.readFileSync(estadoPath, 'utf8');
  return { atualizado: antes !== depois, projeto: dados.projeto };
}

function main() {
  try {
    const payload = loadPayload();
    const alerta = {
      projeto: payload.projeto,
      ativo: payload.ativo,
      modelo: payload.modelo,
      ultimaAtualizacao: payload.ultimaAtualizacao,
    };
    const outputPath = ALERT_FILES[payload.projeto];
    fs.writeFileSync(outputPath, JSON.stringify(alerta, null, 2) + '\n', 'utf8');
    const estadoPath = path.join(__dirname, '..', 'data', 'estado-operacional.json');
    updateAggregate(payload, estadoPath);
    console.log(`Arquivo atualizado em ${outputPath}`);
  } catch (error) {
    console.error(`[update-mensais-alert] Falha ao atualizar alerta: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseBoolean, loadPayload, main, atualizarEstadoOperacional, emptyAggregate, updateAggregate, sanitizarContextoPublico };
