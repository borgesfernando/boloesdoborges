#!/usr/bin/env node
/**
 * Valida data/calendario-caixa.json de forma determinística e detecta drift
 * contra a fonte canônica espelhada em scripts/vendor/loterias-geral/calendarioCaixa.js.
 *
 * Exit 0 = arquivo válido e sem drift; exit 1 = inválido, sensível ou com drift.
 *
 * Uso:
 *   node scripts/validate-calendario-caixa.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const {
  MODALIDADES_CAIXA,
  ORDEM_DIAS_SEMANA,
  CAMINHO_CANONICO,
  CAMINHO_SAIDA,
  PADRAO_HORA,
  carregarCalendarioCanonico,
  montarConteudoPublico
} = require('./generate-calendario-caixa.js');

const WEEKDAYS_VALIDOS = new Set(ORDEM_DIAS_SEMANA);
const TIMEZONE_ESPERADO = 'America/Sao_Paulo';
const SCHEMA_VERSION_ESPERADO = 1;
const FONTE_ESPERADA = 'CAIXA';

const PADROES_SENSIVEIS = [
  { nome: 'planilhaId', padrao: /planilhaId/i },
  { nome: 'url_planilha_google', padrao: /docs\.google\.com\/spreadsheets/i },
  { nome: 'url_drive', padrao: /drive\.google\.com/i },
  { nome: 'id_drive', padrao: /\/drive\/(u\/\d+\/)?(files\/)?[A-Za-z0-9_-]{20,}/ },
  { nome: 'chave_api_google', padrao: /AIza[0-9A-Za-z_-]{30,}/ },
  { nome: 'token_github', padrao: /(ghp_|github_pat_)[0-9A-Za-z_]{20,}/ },
  { nome: 'token_slack', padrao: /xox[baprs]-/ },
  { nome: 'chave_pem', padrao: /-----BEGIN/ },
  { nome: 'aws_access_key', padrao: /AKIA[0-9A-Z]{16}/ },
  { nome: 'email', padrao: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { nome: 'telefone_brasil', padrao: /\(?\d{2}\)?\s?[9]?\d{4}-?\d{4}/ },
  { nome: 'pix_bruto', padrao: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ }
];

class ErroValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroValidacao';
  }
}

function exigir(condicao, mensagem) {
  if (!condicao) {
    throw new ErroValidacao(mensagem);
  }
}

function validarFormatoHora(valor, rotulo) {
  exigir(typeof valor === 'string' && PADRAO_HORA.test(valor), rotulo + ' deve seguir HH:MM: ' + JSON.stringify(valor));
}

function validarDataIso(valor, rotulo) {
  exigir(typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor), rotulo + ' deve ser yyyy-MM-dd: ' + JSON.stringify(valor));
  const partes = valor.split('-').map(Number);
  const data = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2]));
  exigir(
    data.getUTCFullYear() === partes[0] && data.getUTCMonth() === partes[1] - 1 && data.getUTCDate() === partes[2],
    rotulo + ' não é uma data de calendário válida: ' + valor
  );
}

function validarDataBr(valor, rotulo) {
  exigir(typeof valor === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(valor), rotulo + ' deve ser dd/MM/yyyy: ' + JSON.stringify(valor));
  const partes = valor.split('/').map(Number);
  const data = new Date(partes[2], partes[1] - 1, partes[0]);
  exigir(
    data.getFullYear() === partes[2] && data.getMonth() === partes[1] - 1 && data.getDate() === partes[0],
    rotulo + ' não é uma data de calendário válida: ' + valor
  );
}

function validarVigencias(versoes) {
  exigir(Array.isArray(versoes) && versoes.length > 0, 'versions deve ser um array não vazio');
  const intervalos = [];
  for (let i = 0; i < versoes.length; i++) {
    const versao = versoes[i];
    validarDataIso(versao.validFrom, 'versions[' + i + '].validFrom');
    exigir(versao.validUntil === null || typeof versao.validUntil === 'string', 'versions[' + i + '].validUntil deve ser null ou yyyy-MM-dd');
    if (versao.validUntil !== null) {
      validarDataIso(versao.validUntil, 'versions[' + i + '].validUntil');
      exigir(versao.validFrom <= versao.validUntil, 'versions[' + i + ']: validFrom não pode ser posterior a validUntil');
    }
    intervalos.push([versao.validFrom, versao.validUntil]);
  }
  for (let i = 0; i < intervalos.length; i++) {
    for (let j = i + 1; j < intervalos.length; j++) {
      const fimA = intervalos[i][1] === null ? '9999-12-31' : intervalos[i][1];
      const fimB = intervalos[j][1] === null ? '9999-12-31' : intervalos[j][1];
      exigir(
        fimA < intervalos[j][0] || fimB < intervalos[i][0],
        'versions[' + i + '] e versions[' + j + '] possuem vigências sobrepostas'
      );
    }
  }
}

function validarModalidade(id, modalidade, rotulo) {
  exigir(MODALIDADES_CAIXA.includes(id), rotulo + ': modalidade desconhecida ' + JSON.stringify(id));
  exigir(modalidade && typeof modalidade === 'object', rotulo + ': definição de modalidade inválida');
  exigir(Array.isArray(modalidade.sorteios) && modalidade.sorteios.length > 0, rotulo + ': sorteios ausentes ou vazios');
  const vistos = new Set();
  for (const sorteio of modalidade.sorteios) {
    exigir(sorteio && typeof sorteio === 'object', rotulo + ': entrada de sorteio inválida');
    exigir(WEEKDAYS_VALIDOS.has(sorteio.weekday), rotulo + ': weekday inválido ' + JSON.stringify(sorteio.weekday));
    validarFormatoHora(sorteio.time, rotulo + '.' + sorteio.weekday + '.time');
    exigir(!vistos.has(sorteio.weekday), rotulo + ': weekday duplicado ' + sorteio.weekday);
    vistos.add(sorteio.weekday);
  }
}

function validarExcecoes(excecoes) {
  exigir(Array.isArray(excecoes), 'exceptions deve ser um array');
  const chaves = new Set();
  for (let i = 0; i < excecoes.length; i++) {
    const excecao = excecoes[i];
    const rotulo = 'exceptions[' + i + ']';
    exigir(excecao && typeof excecao === 'object', rotulo + ' inválida');
    exigir(excecao.modalidade === null || typeof excecao.modalidade === 'string', rotulo + '.modalidade inválida');
    if (excecao.modalidade !== null) {
      exigir(MODALIDADES_CAIXA.includes(excecao.modalidade), rotulo + ': modalidade desconhecida ' + JSON.stringify(excecao.modalidade));
    }
    if (excecao.dataSorteio !== null) {
      validarDataBr(excecao.dataSorteio, rotulo + '.dataSorteio');
    }
    if (excecao.horario !== null) {
      validarFormatoHora(excecao.horario, rotulo + '.horario');
    }
    const chave = excecao.modalidade + '|' + excecao.dataSorteio;
    exigir(!chaves.has(chave), rotulo + ' duplicada para modalidade/data: ' + chave);
    chaves.add(chave);
  }
}

function validarDocumento(doc) {
  exigir(doc && typeof doc === 'object', 'documento ausente');
  exigir(doc.schemaVersion === SCHEMA_VERSION_ESPERADO, 'schemaVersion deve ser ' + SCHEMA_VERSION_ESPERADO);
  exigir(doc.timezone === TIMEZONE_ESPERADO, 'timezone deve ser ' + TIMEZONE_ESPERADO);
  exigir(doc.fonte === FONTE_ESPERADA, 'fonte deve ser ' + FONTE_ESPERADA);
  exigir(typeof doc.referencia === 'string' && doc.referencia, 'referencia deve ser uma URL pública');
  validarVigencias(doc.versions);
  for (const versao of doc.versions) {
    for (const id of Object.keys(versao.modalidades)) {
      validarModalidade(id, versao.modalidades[id], 'versions[].modalidades.' + id);
    }
  }
  validarExcecoes(doc.exceptions);
}

function detectarSensiveis(texto) {
  return PADROES_SENSIVEIS.filter((item) => item.padrao.test(texto)).map((item) => item.nome);
}

function removerTimestamps(doc) {
  const copia = JSON.parse(JSON.stringify(doc));
  delete copia.generatedAt;
  delete copia.verificadoEm;
  return copia;
}

function verificarDrift(docComitado) {
  const canonico = carregarCalendarioCanonico(CAMINHO_CANONICO);
  const esperado = montarConteudoPublico(canonico, new Date(0));
  const comitadoSemTimestamps = JSON.stringify(removerTimestamps(docComitado));
  const esperadoSemTimestamps = JSON.stringify(removerTimestamps(esperado));
  if (comitadoSemTimestamps !== esperadoSemTimestamps) {
    throw new ErroValidacao(
      'DRIFT: data/calendario-caixa.json divergiu da fonte canônica. Rode node scripts/generate-calendario-caixa.js.'
    );
  }
}

function validarArquivo(caminho) {
  const texto = fs.readFileSync(caminho, 'utf8');
  let doc;
  try {
    doc = JSON.parse(texto);
  } catch (erro) {
    throw new ErroValidacao('JSON inválido: ' + erro.message);
  }
  const sensiveis = detectarSensiveis(texto);
  exigir(sensiveis.length === 0, 'conteúdo sensível detectado: ' + sensiveis.join(', '));
  validarDocumento(doc);
  verificarDrift(doc);
  return doc;
}

function main() {
  const erros = [];
  try {
    const doc = validarArquivo(CAMINHO_SAIDA);
    console.log('data/calendario-caixa.json válido: schemaVersion', doc.schemaVersion, '| timezone', doc.timezone, '| modalidades', doc.versions.length ? Object.keys(doc.versions[0].modalidades).length : 0, '| exceções', doc.exceptions.length, '| sem drift');
  } catch (erro) {
    erros.push(erro.message);
  }
  if (erros.length) {
    for (const mensagem of erros) {
      console.error('ERRO: ' + mensagem);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  WEEKDAYS_VALIDOS,
  TIMEZONE_ESPERADO,
  SCHEMA_VERSION_ESPERADO,
  FONTE_ESPERADA,
  PADROES_SENSIVEIS,
  validarFormatoHora,
  validarDataIso,
  validarDataBr,
  validarVigencias,
  validarModalidade,
  validarExcecoes,
  validarDocumento,
  detectarSensiveis,
  removerTimestamps,
  verificarDrift,
  validarArquivo
};
