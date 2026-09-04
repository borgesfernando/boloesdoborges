'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const EVENTOS = new Set(['ABRIR', 'ATUALIZAR', 'FECHAR']);

function hash(valor) {
  return crypto.createHash('sha256').update(JSON.stringify(valor)).digest('hex');
}

function carregarCursor(cursorPath) {
  if (!cursorPath || !fs.existsSync(cursorPath)) return { version: 1, projetos: {} };
  try {
    const lido = JSON.parse(fs.readFileSync(cursorPath, 'utf8'));
    if (!lido || typeof lido !== 'object' || !lido.projetos || typeof lido.projetos !== 'object') {
      return { version: 1, projetos: {} };
    }
    return { version: 1, projetos: { ...lido.projetos } };
  } catch (_) {
    return { version: 1, projetos: {} };
  }
}

function salvarCursor(cursorPath, cursor) {
  if (!cursorPath) return false;
  fs.mkdirSync(path.dirname(cursorPath), { recursive: true });
  const conteudo = JSON.stringify({ version: 1, projetos: cursor.projetos || {} }, null, 2) + '\n';
  if (fs.existsSync(cursorPath) && fs.readFileSync(cursorPath, 'utf8') === conteudo) return false;
  fs.writeFileSync(cursorPath, conteudo, 'utf8');
  return true;
}

function normalizarMetadados(payload) {
  const eventType = String(payload && payload.eventType || '').trim().toUpperCase();
  const revisionBruta = payload && payload.revision !== undefined && payload.revision !== null
    ? String(payload.revision).trim()
    : '';

  if (!eventType && !revisionBruta) return null;
  if (!eventType || !revisionBruta) {
    throw new Error('eventType e revision devem ser informados juntos no evento operacional canônico.');
  }
  if (!EVENTOS.has(eventType)) throw new Error('eventType operacional inválido.');
  const revision = Number(revisionBruta);
  if (!Number.isInteger(revision) || revision < 1) throw new Error('revision operacional deve ser inteiro positivo.');
  return { eventType, revision };
}

function identidade(payload) {
  return {
    correlationId: String(payload.correlationId || ''),
    concurso: String(payload.concurso || ''),
    abreEm: String(payload.abreEm || ''),
    timezone: String(payload.timezone || ''),
  };
}

function fatos(payload) {
  return {
    ativo: payload.ativo === true,
    concurso: String(payload.concurso || ''),
    correlationId: String(payload.correlationId || ''),
    estado: String(payload.estado || ''),
    fase: String(payload.fase || ''),
    abreEm: String(payload.abreEm || ''),
    fechaEm: String(payload.fechaEm || ''),
    timezone: String(payload.timezone || ''),
    contextoPublico: payload.contextoPublico && typeof payload.contextoPublico === 'object'
      ? payload.contextoPublico
      : {},
  };
}

function payloadCompleto(payload) {
  return {
    ...fatos(payload),
    atualizadoEm: String(payload.atualizadoEm || ''),
  };
}

function criarRegistroCursor(payload, metadados) {
  const identityFingerprint = hash(identidade(payload));
  const factsFingerprint = hash(fatos(payload));
  const payloadFingerprint = hash(payloadCompleto(payload));
  const lastEventKey = `${payload.projeto}:${payload.correlationId}:${metadados.eventType}:${metadados.revision}`;
  return {
    correlationId: String(payload.correlationId || ''),
    lastRevision: metadados.revision,
    lastEventType: metadados.eventType,
    lastEventKey,
    identityFingerprint,
    factsFingerprint,
    payloadFingerprint,
  };
}

function decidirAplicacaoEvento(payload, cursor) {
  const metadados = normalizarMetadados(payload);
  const anterior = cursor && cursor.projetos ? cursor.projetos[payload.projeto] : null;

  if (!metadados) {
    if (anterior) {
      throw new Error('Evento sem eventType/revision não pode sobrescrever projeto já controlado pelo cursor canônico.');
    }
    return { acao: 'APLICAR', motivo: 'LEGADO_PRE_CURSOR', cursorAlterado: false, cursor };
  }

  const proximoRegistro = criarRegistroCursor(payload, metadados);
  const proximoCursor = {
    version: 1,
    projetos: { ...((cursor && cursor.projetos) || {}) },
  };

  if (!anterior) {
    proximoCursor.projetos[payload.projeto] = proximoRegistro;
    return { acao: 'APLICAR', motivo: 'BOOTSTRAP_CANONICO', cursorAlterado: true, cursor: proximoCursor };
  }

  const mesmaInstancia = anterior.correlationId === proximoRegistro.correlationId;
  if (!mesmaInstancia) {
    if (metadados.eventType !== 'ABRIR' || metadados.revision !== 1) {
      throw new Error('Nova instância operacional deve iniciar com ABRIR revision=1.');
    }
    proximoCursor.projetos[payload.projeto] = proximoRegistro;
    return { acao: 'APLICAR', motivo: 'NOVA_INSTANCIA', cursorAlterado: true, cursor: proximoCursor };
  }

  if (proximoRegistro.lastEventKey === anterior.lastEventKey) {
    if (proximoRegistro.payloadFingerprint !== anterior.payloadFingerprint) {
      throw new Error('Mesmo eventKey recebeu conteúdo operacional incompatível.');
    }
    return { acao: 'NO_OP', motivo: 'REPLAY_EXATO', cursorAlterado: false, cursor };
  }

  if (metadados.revision < Number(anterior.lastRevision || 0)) {
    return { acao: 'NO_OP', motivo: 'REVISAO_INFERIOR', cursorAlterado: false, cursor };
  }

  if (metadados.revision === Number(anterior.lastRevision || 0)) {
    throw new Error('Mesma revision recebeu eventKey diferente do já aplicado.');
  }

  if (proximoRegistro.identityFingerprint !== anterior.identityFingerprint) {
    throw new Error('Identidade operacional divergente para a mesma instância.');
  }

  if (metadados.eventType === 'ABRIR') {
    if (proximoRegistro.factsFingerprint !== anterior.factsFingerprint) {
      throw new Error('ABRIR repetido com a mesma identidade contém fatos incompatíveis.');
    }
    proximoCursor.projetos[payload.projeto] = proximoRegistro;
    return { acao: 'NO_OP', motivo: 'ABRIR_REPETIDO', cursorAlterado: true, cursor: proximoCursor };
  }

  if (metadados.eventType === 'FECHAR' && anterior.lastEventType === 'FECHAR') {
    if (proximoRegistro.factsFingerprint !== anterior.factsFingerprint) {
      throw new Error('FECHAR repetido contém fatos incompatíveis.');
    }
    proximoCursor.projetos[payload.projeto] = proximoRegistro;
    return { acao: 'NO_OP', motivo: 'FECHAR_REPETIDO', cursorAlterado: true, cursor: proximoCursor };
  }

  proximoCursor.projetos[payload.projeto] = proximoRegistro;
  return { acao: 'APLICAR', motivo: 'REVISAO_SUPERIOR', cursorAlterado: true, cursor: proximoCursor };
}

module.exports = {
  carregarCursor,
  salvarCursor,
  decidirAplicacaoEvento,
  normalizarMetadados,
};
