#!/usr/bin/env node
/**
 * Gera data/calendario-caixa.json a partir da fonte canônica do calendário CAIXA.
 *
 * A fonte canônica é o módulo libs/LoteriasGeral/src/calendarioCaixa.js do
 * repositório Apps_Scripts, espelhado sem edição manual em
 * scripts/vendor/loterias-geral/calendarioCaixa.js. Este gerador apenas
 * transforma a representação interna (CALENDARIO_CAIXA_) na representação
 * pública derivada; não existe segunda grade editável manualmente.
 *
 * Uso:
 *   node scripts/generate-calendario-caixa.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MODALIDADES_CAIXA = Object.freeze(['megasena', 'maismilionaria', 'lotofacil', 'quina', 'duplasena']);

const DIAS_SEMANA_CAIXA = Object.freeze({
  domingo: 'SUN',
  segunda: 'MON',
  terca: 'TUE',
  quarta: 'WED',
  quinta: 'THU',
  sexta: 'FRI',
  sabado: 'SAT'
});

const ORDEM_DIAS_SEMANA = Object.freeze(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

const CAMINHO_CANONICO = path.join(__dirname, 'vendor', 'loterias-geral', 'calendarioCaixa.js');
const CAMINHO_SAIDA = path.join(__dirname, '..', 'data', 'calendario-caixa.json');

const REFERENCIA_CAIXA = 'https://loterias.caixa.gov.br/';

const PADRAO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function carregarCalendarioCanonico(arquivo) {
  const contexto = {
    console, Date, Math, Number, String, Boolean, Object, Array, RegExp, Error, JSON, parseInt, isNaN
  };
  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(arquivo, 'utf8'), contexto);
  if (!contexto.CALENDARIO_CAIXA_) {
    throw new Error('Fonte canônica não expõe CALENDARIO_CAIXA_.');
  }
  return contexto.CALENDARIO_CAIXA_;
}

function converterGradeParaSorteios(grade) {
  const sorteios = [];
  const chaves = Object.keys(grade || {});
  for (const dia of chaves) {
    const codigo = DIAS_SEMANA_CAIXA[dia];
    if (!codigo) {
      throw new Error('Dia desconhecido na grade canônica: ' + dia);
    }
    const tempo = String(grade[dia]);
    if (!PADRAO_HORA.test(tempo)) {
      throw new Error('Horário inválido na grade canônica: ' + tempo);
    }
    sorteios.push({ weekday: codigo, time: tempo });
  }
  sorteios.sort((a, b) => ORDEM_DIAS_SEMANA.indexOf(a.weekday) - ORDEM_DIAS_SEMANA.indexOf(b.weekday));
  return sorteios;
}

function transformarVersoes(versoes) {
  return (versoes || []).map((versao) => {
    const modalidades = {};
    const ids = Object.keys(versao.modalidades || {});
    for (const id of ids) {
      if (!MODALIDADES_CAIXA.includes(id)) {
        throw new Error('Modalidade desconhecida na versão canônica: ' + id);
      }
      modalidades[id] = { sorteios: converterGradeParaSorteios(versao.modalidades[id]) };
    }
    return {
      validFrom: versao.validFrom,
      validUntil: versao.validUntil === undefined || versao.validUntil === null ? null : versao.validUntil,
      modalidades
    };
  });
}

function transformarExcecoes(excecoes) {
  return (excecoes || []).map((excecao) => {
    if (excecao.modalidade && !MODALIDADES_CAIXA.includes(excecao.modalidade)) {
      throw new Error('Modalidade desconhecida em exceção: ' + excecao.modalidade);
    }
    if (excecao.horario && !PADRAO_HORA.test(String(excecao.horario))) {
      throw new Error('Horário inválido em exceção: ' + excecao.horario);
    }
    return {
      id: excecao.id || null,
      modalidade: excecao.modalidade || null,
      dataSorteio: excecao.dataSorteio || null,
      horario: excecao.horario === undefined || excecao.horario === null ? null : excecao.horario,
      motivo: excecao.motivo || null
    };
  });
}

function montarConteudoPublico(canonico, agora) {
  return {
    schemaVersion: canonico.schemaVersion,
    timezone: canonico.timezone,
    fonte: 'CAIXA',
    referencia: REFERENCIA_CAIXA,
    generatedAt: agora.toISOString(),
    verificadoEm: agora.toISOString(),
    versions: transformarVersoes(canonico.versoes),
    exceptions: transformarExcecoes(canonico.excecoes)
  };
}

function gerarConteudoPublico(agora) {
  const canonico = carregarCalendarioCanonico(CAMINHO_CANONICO);
  return montarConteudoPublico(canonico, agora);
}

function gerarArquivoPublico(agora) {
  const conteudo = gerarConteudoPublico(agora);
  fs.writeFileSync(CAMINHO_SAIDA, JSON.stringify(conteudo, null, 2) + '\n', 'utf8');
  return conteudo;
}

function main() {
  const conteudo = gerarArquivoPublico(new Date());
  const quantidade = conteudo.versions.length ? Object.keys(conteudo.versions[0].modalidades).length : 0;
  console.log('data/calendario-caixa.json gerado a partir da fonte canônica.');
  console.log('schemaVersion:', conteudo.schemaVersion, '| timezone:', conteudo.timezone, '| modalidades:', quantidade, '| exceções:', conteudo.exceptions.length);
}

if (require.main === module) {
  main();
}

module.exports = {
  MODALIDADES_CAIXA,
  DIAS_SEMANA_CAIXA,
  ORDEM_DIAS_SEMANA,
  CAMINHO_CANONICO,
  CAMINHO_SAIDA,
  REFERENCIA_CAIXA,
  PADRAO_HORA,
  carregarCalendarioCanonico,
  converterGradeParaSorteios,
  transformarVersoes,
  transformarExcecoes,
  montarConteudoPublico,
  gerarConteudoPublico,
  gerarArquivoPublico
};
