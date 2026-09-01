#!/usr/bin/env node
/**
 * Valida que os textos de apresentação de sorteios dos projetos mensais
 * (js/config.js → data/projetos.json) permanecem consistentes com o calendário
 * canônico CAIXA (data/calendario-caixa.json).
 *
 * O calendário oficial é a autoridade; os textos `sorteios` são apenas
 * apresentação. Este validador detecta drift entre os dois, sem criar uma
 * segunda grade editável manualmente.
 *
 * Uso:
 *   node scripts/validate-projetos-sorteios.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'js', 'config.js');
const CALENDARIO_PATH = path.join(__dirname, '..', 'data', 'calendario-caixa.json');

const MAPA_PROJETO_MODALIDADE = {
  'quina-mensal': 'quina',
  'lf-mensal': 'lotofacil',
  'dupla-sena-mensal': 'duplasena'
};

const DIAS_NOME = { MON: 'segunda', TUE: 'terça', WED: 'quarta', THU: 'quinta', FRI: 'sexta', SAT: 'sábado', SUN: 'domingo' };
const ORDEM = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DIAS_TOKENS = {
  segunda: 'MON', terca: 'TUE', quarta: 'WED', quinta: 'THU',
  sexta: 'FRI', sabado: 'SAT', domingo: 'SUN'
};

function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function horaCurta(hora) {
  return hora.replace(/:00$/, '') + 'h';
}

function parsearDiasEHoras(texto) {
  const tokens = normalizar(texto).split(' ');
  const dias = new Set();
  const horas = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok === 'a' && i > 0 && i < tokens.length - 1) {
      const d1 = DIAS_TOKENS[tokens[i - 1]];
      const d2 = DIAS_TOKENS[tokens[i + 1]];
      if (d1 && d2) {
        const i1 = ORDEM.indexOf(d1);
        const i2 = ORDEM.indexOf(d2);
        for (let k = i1; k <= i2; k++) dias.add(ORDEM[k]);
      }
    } else if (DIAS_TOKENS[tok]) {
      dias.add(DIAS_TOKENS[tok]);
    }
    const m = tok.match(/^(\d{1,2})h$/);
    if (m) horas.add(String(Number(m[1])).padStart(2, '0') + ':00');
  }
  return { dias, horas };
}

function carregarProjetos() {
  const codigo = fs.readFileSync(CONFIG_PATH, 'utf8');
  const match = codigo.match(/const\s+PROJETOS\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    throw new Error('Não foi possível localizar "const PROJETOS = {...};" em js/config.js');
  }
  const vm = require('vm');
  return vm.runInNewContext(`(${match[1]})`, {}, { timeout: 1000 });
}

function carregarCalendario() {
  return JSON.parse(fs.readFileSync(CALENDARIO_PATH, 'utf8'));
}

function fatosCanonicos(modalidade) {
  const calendario = carregarCalendario();
  const versao = (calendario.versions || []).slice().sort((a, b) => (b.validFrom > a.validFrom ? 1 : -1))[0];
  const grade = versao && versao.modalidades && versao.modalidades[modalidade];
  if (!grade || !Array.isArray(grade.sorteios)) {
    throw new Error('Modalidade ' + modalidade + ' ausente no calendário canônico.');
  }
  return grade.sorteios;
}

function validarProjeto(id, projeto, modalidade) {
  const texto = projeto.sorteios || '';
  const { dias, horas } = parsearDiasEHoras(texto);
  const fatos = fatosCanonicos(modalidade);

  const diasCanonicos = new Set(fatos.map((f) => f.weekday));
  const horasCanonicas = new Set(fatos.map((f) => f.time));

  const problemas = [];
  for (const dia of diasCanonicos) {
    if (!dias.has(dia)) {
      problemas.push('texto não cobre o dia "' + DIAS_NOME[dia] + '"');
    }
  }
  for (const dia of dias) {
    if (!diasCanonicos.has(dia)) {
      problemas.push('texto cita o dia "' + DIAS_NOME[dia] + '" fora da grade canônica');
    }
  }
  if (horas.size > 0) {
    for (const hora of horasCanonicas) {
      if (!horas.has(hora)) {
        problemas.push('texto não cita o horário "' + horaCurta(hora) + '"');
      }
    }
    for (const hora of horas) {
      if (!horasCanonicas.has(hora)) {
        problemas.push('texto cita o horário "' + horaCurta(hora) + '" fora da grade canônica');
      }
    }
  }
  return problemas;
}

function main() {
  const projetos = carregarProjetos();
  const mensais = (projetos.mensais && projetos.mensais.projetos) || [];
  const falhas = [];

  for (const projeto of mensais) {
    const modalidade = MAPA_PROJETO_MODALIDADE[projeto.id];
    if (!modalidade) continue;
    const problemas = validarProjeto(projeto.id, projeto, modalidade);
    if (problemas.length) {
      falhas.push('[' + projeto.id + '] ' + problemas.join('; '));
      console.error('DRIFT: ' + projeto.id + ' -> ' + problemas.join('; '));
    } else {
      console.log('OK: ' + projeto.id + ' (' + modalidade + ') consistente com o calendário canônico.');
    }
  }

  if (falhas.length) {
    console.error('Texto de apresentação divergente do calendário canônico. Atualize js/config.js e regenere data/projetos.json.');
    process.exit(1);
  }
  console.log('validate-projetos-sorteios.js: OK');
}

if (require.main === module) {
  main();
}

module.exports = { normalizar, horaCurta, parsearDiasEHoras, fatosCanonicos, validarProjeto };
