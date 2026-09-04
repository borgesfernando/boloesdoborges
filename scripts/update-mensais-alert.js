#!/usr/bin/env node
/**
 * Atualiza o alerta legado de um projeto e o agregado público sanitizado
 * data/estado-operacional.json (schema v2).
 *
 * Regras centrais:
 * - os *-alert.json continuam existindo para compatibilidade;
 * - somente um evento operacional com janela completa pode produzir ABERTA;
 * - atualizar um projeto preserva integralmente os outros oito;
 * - contexto público é allowlisted e nunca recebe segredos/IDs internos.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  carregarCursor,
  salvarCursor,
  decidirAplicacaoEvento,
} = require('./estado-operacional-cursor');

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
const CURSOR_FILE = path.join(__dirname, '..', '.github', 'state', 'estado-operacional-applied.json');
const STRATEGIC_PROJECTS = new Set(['mega-50mais', 'milionaria']);
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const CATALOGO_V2 = {
  'lf-mensal': { nome: 'Lotofácil Mensal', tipo: 'MENSAL' },
  'quina-mensal': { nome: 'Quina Mensal', tipo: 'MENSAL' },
  'ds-mensal': { nome: 'Dupla Sena Mensal', tipo: 'MENSAL' },
  'lf-independencia': { nome: 'Lotofácil da Independência', tipo: 'ESPECIAL' },
  'quina-saojoao': { nome: 'Quina de São João', tipo: 'ESPECIAL' },
  'ds-pascoa': { nome: 'Dupla Sena de Páscoa', tipo: 'ESPECIAL' },
  'mega-virada': { nome: 'Mega da Virada', tipo: 'ESPECIAL' },
  'mega-50mais': { nome: 'Mega-Sena 50+', tipo: 'ESTRATEGICO' },
  milionaria: { nome: '+Milionária', tipo: 'ESTRATEGICO' },
};

const CAMPOS_PROIBIDOS_V2 = /(?:token|secret|senha|password|planilha|spreadsheet|drive|pix|whatsapp|grupo|invite|convite|authorization|cookie|script.?id|container|telefone|email)/i;
const CONTEXTO_PUBLICO_ALLOWLIST = new Set(['concurso', 'dataOperacao', 'observacaoPublica']);
const ESTADOS_PUBLICOS = new Set(['ABERTA', 'FECHADA', 'SEM_INSTANCIA', 'INDISPONIVEL']);
const FASES_PUBLICAS = new Set([
  'PLANEJAMENTO',
  'INSCRICOES',
  'PREPARACAO_APOSTAS',
  'APOSTAS_REGISTRADAS',
  'AGUARDANDO_SORTEIO',
  'APURACAO',
  'ENCERRADA',
  'INDISPONIVEL',
]);

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  throw new Error('Informe ALERTA_ATIVO como true ou false.');
}

function textoPublico(value, max = 180) {
  return String(value == null ? '' : value).trim().slice(0, max);
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
  let parsed = contextoBruto;
  if (typeof contextoBruto === 'string') {
    try {
      parsed = JSON.parse(contextoBruto);
    } catch (_) {
      throw new Error('ALERTA_CONTEXTO_PUBLICO deve ser um JSON válido.');
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('ALERTA_CONTEXTO_PUBLICO deve ser um objeto JSON.');
  }

  const saida = {};
  for (const [chave, valor] of Object.entries(parsed)) {
    if (CAMPOS_PROIBIDOS_V2.test(chave)) {
      throw new Error('Contexto público contém campo inválido: ' + chave);
    }
    if (!CONTEXTO_PUBLICO_ALLOWLIST.has(chave)) continue;
    saida[chave] = textoPublico(valor);
  }
  return saida;
}

function janelaValida(abreEm, fechaEm) {
  if (!abreEm || !fechaEm) return false;
  const abre = Date.parse(abreEm);
  const fecha = Date.parse(fechaEm);
  return Number.isFinite(abre) && Number.isFinite(fecha) && abre < fecha;
}

function resolverEstadoPublico(payload) {
  const solicitado = textoPublico(payload.estado, 30).toUpperCase();

  if (payload.ativo === true) {
    // O workflow_dispatch é o evento operacional; para publicar ABERTA exigimos
    // também identidade da instância e janela temporal completa.
    const eventoCompleto = Boolean(payload.concurso && payload.correlationId && janelaValida(payload.abreEm, payload.fechaEm));
    if (eventoCompleto && (!solicitado || solicitado === 'ABERTA')) return 'ABERTA';
    return 'INDISPONIVEL';
  }

  if (solicitado && ESTADOS_PUBLICOS.has(solicitado) && solicitado !== 'ABERTA') return solicitado;
  return 'FECHADA';
}

function normalizarFase(fase, estado) {
  const candidata = textoPublico(fase, 60).toUpperCase();
  if (FASES_PUBLICAS.has(candidata)) return candidata;
  if (estado === 'ABERTA') return 'INSCRICOES';
  if (estado === 'FECHADA') return 'ENCERRADA';
  return 'INDISPONIVEL';
}

function loadPayload(env) {
  const fonte = env && typeof env === 'object' ? env : process.env;
  const projeto = textoPublico(fonte.ALERTA_PROJETO, 80);
  if (!ALERT_FILES[projeto]) {
    throw new Error(`Informe ALERTA_PROJETO (${Object.keys(ALERT_FILES).join(', ')}).`);
  }

  const ativo = parseBoolean(fonte.ALERTA_ATIVO);
  const concurso = textoPublico(fonte.ALERTA_CONCURSO, 80);
  const correlationId = textoPublico(fonte.ALERTA_CORRELATION_ID, 180);
  const modelo = resolveStrategicModel(projeto, ativo, concurso, correlationId);

  return {
    projeto,
    ativo,
    modelo,
    concurso,
    correlationId,
    eventType: textoPublico(fonte.ALERTA_EVENT_TYPE, 30).toUpperCase(),
    revision: textoPublico(fonte.ALERTA_REVISION, 30),
    estado: textoPublico(fonte.ALERTA_ESTADO, 30),
    fase: textoPublico(fonte.ALERTA_FASE, 60),
    abreEm: textoPublico(fonte.ALERTA_ABRE_EM, 80),
    fechaEm: textoPublico(fonte.ALERTA_FECHA_EM, 80),
    timezone: textoPublico(fonte.ALERTA_TIMEZONE || DEFAULT_TIMEZONE, 80),
    atualizadoEm: textoPublico(fonte.ALERTA_ATUALIZADO_EM, 80),
    contextoPublico: sanitizarContextoPublico(fonte.ALERTA_CONTEXTO_PUBLICO),
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
      timezone: DEFAULT_TIMEZONE,
      janelaComunidade: { abreEm: '', fechaEm: '', timezone: DEFAULT_TIMEZONE },
      contexto: {},
      atualizadoEm: '',
      correlationId: '',
      fonteEstado: 'Apps_Scripts',
    };
  }
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    timezone: DEFAULT_TIMEZONE,
    projetos,
  };
}

function estadoV2DePayload(payload) {
  const estado = resolverEstadoPublico(payload);
  const timezone = payload.timezone || DEFAULT_TIMEZONE;
  const contexto = sanitizarContextoPublico(payload.contextoPublico || {});
  if (payload.concurso && !contexto.concurso) contexto.concurso = textoPublico(payload.concurso, 80);

  return {
    slug: payload.projeto,
    nome: CATALOGO_V2[payload.projeto].nome,
    tipo: CATALOGO_V2[payload.projeto].tipo,
    estado,
    ativo: estado === 'ABERTA',
    fase: normalizarFase(payload.fase, estado),
    concurso: textoPublico(payload.concurso, 80),
    abreEm: textoPublico(payload.abreEm, 80),
    fechaEm: textoPublico(payload.fechaEm, 80),
    timezone,
    janelaComunidade: {
      abreEm: textoPublico(payload.abreEm, 80),
      fechaEm: textoPublico(payload.fechaEm, 80),
      timezone,
    },
    contexto,
    atualizadoEm: textoPublico(payload.atualizadoEm || payload.ultimaAtualizacao, 80),
    correlationId: textoPublico(payload.correlationId, 180),
    fonteEstado: 'Apps_Scripts',
  };
}

function validarSaidaPublica(doc) {
  const texto = JSON.stringify(doc);
  for (const projeto of Object.values(doc.projetos || {})) {
    for (const chave of Object.keys(projeto || {})) {
      if (CAMPOS_PROIBIDOS_V2.test(chave)) throw new Error('Agregado contém chave proibida: ' + chave);
    }
    for (const chave of Object.keys((projeto && projeto.contexto) || {})) {
      if (!CONTEXTO_PUBLICO_ALLOWLIST.has(chave) || CAMPOS_PROIBIDOS_V2.test(chave)) {
        throw new Error('Agregado contém contexto público fora da allowlist: ' + chave);
      }
    }
  }
  if (/(?:GITHUB_TOKEN|TELEGRAM_OUTBOUND_SECRET|Bearer\s+[A-Za-z0-9._-]+)/i.test(texto)) {
    throw new Error('Agregado contém conteúdo sensível.');
  }
  return true;
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
    } catch (_) {
      atual = esqueleto;
    }
  }

  const anterior = JSON.stringify(atual.projetos[payload.projeto] || null);
  atual.projetos[payload.projeto] = Object.assign(
    {},
    esqueleto.projetos[payload.projeto],
    atual.projetos[payload.projeto] || {},
    estadoV2DePayload(payload),
  );

  atual.schemaVersion = 2;
  atual.timezone = DEFAULT_TIMEZONE;
  if (JSON.stringify(atual.projetos[payload.projeto]) !== anterior) {
    atual.generatedAt = new Date().toISOString();
  }

  validarSaidaPublica(atual);

  if (estadoPath) {
    const novoConteudo = JSON.stringify(atual, null, 2) + '\n';
    if (!fs.existsSync(estadoPath) || fs.readFileSync(estadoPath, 'utf8') !== novoConteudo) {
      fs.writeFileSync(estadoPath, novoConteudo, 'utf8');
    }
  }
  return atual;
}

function aplicarEstadoOperacionalComCursor(estadoPath, cursorPath, payload) {
  const cursor = carregarCursor(cursorPath);
  const decisao = decidirAplicacaoEvento(payload, cursor);
  let aplicado = false;

  if (decisao.acao === 'APLICAR') {
    updateAggregate(payload, estadoPath);
    aplicado = true;
  }
  const cursorAtualizado = decisao.cursorAlterado
    ? salvarCursor(cursorPath, decisao.cursor)
    : false;

  return {
    aplicado,
    cursorAtualizado,
    motivo: decisao.motivo,
  };
}

/**
 * Atualiza somente o registro indicado no agregado público.
 * @param {string} estadoPath caminho para estado-operacional.json
 * @param {Object} dados contrato operacional sanitizado
 * @returns {{atualizado:boolean,projeto?:string}}
 */
function atualizarEstadoOperacional(estadoPath, dados) {
  if (!dados || !ALERT_FILES[dados.projeto]) return { atualizado: false };
  const antes = fs.existsSync(estadoPath) ? fs.readFileSync(estadoPath, 'utf8') : null;
  const payload = {
    projeto: dados.projeto,
    ativo: dados.ativo === true,
    concurso: textoPublico(dados.concurso, 80),
    correlationId: textoPublico(dados.correlationId, 180),
    estado: textoPublico(dados.estado, 30),
    fase: textoPublico(dados.fase, 60),
    abreEm: textoPublico(dados.abreEm, 80),
    fechaEm: textoPublico(dados.fechaEm, 80),
    timezone: textoPublico(dados.timezone || DEFAULT_TIMEZONE, 80),
    atualizadoEm: textoPublico(dados.atualizadoEm, 80),
    contextoPublico: sanitizarContextoPublico(dados.contextoPublico || {}),
    ultimaAtualizacao: textoPublico(dados.atualizadoEm || new Date().toISOString(), 80),
  };
  updateAggregate(payload, estadoPath);
  const depois = fs.readFileSync(estadoPath, 'utf8');
  return { atualizado: antes !== depois, projeto: dados.projeto };
}

function main() {
  try {
    const payload = loadPayload();
    const estadoPath = path.join(__dirname, '..', 'data', 'estado-operacional.json');
    const resultado = aplicarEstadoOperacionalComCursor(estadoPath, CURSOR_FILE, payload);

    if (resultado.aplicado) {
      const alerta = {
        projeto: payload.projeto,
        ativo: payload.ativo,
        modelo: payload.modelo,
        ultimaAtualizacao: payload.ultimaAtualizacao,
      };
      const outputPath = ALERT_FILES[payload.projeto];
      fs.writeFileSync(outputPath, JSON.stringify(alerta, null, 2) + '\n', 'utf8');
      console.log(`Arquivo atualizado em ${outputPath}`);
    } else {
      console.log(`Evento operacional ignorado como ${resultado.motivo}; agregado preservado.`);
    }
  } catch (error) {
    console.error(`[update-mensais-alert] Falha ao atualizar alerta: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  parseBoolean,
  loadPayload,
  main,
  atualizarEstadoOperacional,
  aplicarEstadoOperacionalComCursor,
  emptyAggregate,
  updateAggregate,
  sanitizarContextoPublico,
  resolverEstadoPublico,
  janelaValida,
  validarSaidaPublica,
};
