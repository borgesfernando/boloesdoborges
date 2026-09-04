#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const pasta = path.join(raiz, '.github', 'workflows');
const esperados = [
  'set-ds-mensal-alert.yml',
  'set-lf-mensal-alert.yml',
  'set-quina-mensal-alert.yml',
  'set-lf-independencia-alert.yml',
  'set-quina-saojoao-alert.yml',
  'set-ds-pascoa-alert.yml',
  'set-mega-virada-alert.yml',
  'set-mega-50mais-alert.yml',
  'set-milionaria-alert.yml',
];
const grupoGlobal = 'estado-operacional-global';

const erros = [];

function exigeInputOpcional(texto, nome, workflow) {
  const inicio = texto.indexOf(`${nome}:`);
  if (inicio === -1) {
    erros.push(`${workflow}: input ${nome} ausente`);
    return;
  }
  const trecho = texto.slice(inicio, inicio + 320);
  if (!/required:\s*false/.test(trecho)) erros.push(`${workflow}: input ${nome} deve ser opcional`);
  if (!/default:\s*''/.test(trecho)) erros.push(`${workflow}: input ${nome} deve manter default vazio`);
}

for (const nome of esperados) {
  const arquivo = path.join(pasta, nome);
  if (!fs.existsSync(arquivo)) {
    erros.push(`workflow obrigatório ausente: ${nome}`);
    continue;
  }
  const texto = fs.readFileSync(arquivo, 'utf8');
  if (!/workflow_dispatch\s*:/.test(texto)) erros.push(`${nome}: workflow_dispatch ausente`);
  if (!/scripts\/update-mensais-alert\.js/.test(texto)) erros.push(`${nome}: updater canônico ausente`);
  if (!/data\/estado-operacional\.json/.test(texto)) erros.push(`${nome}: estado-operacional.json não participa do commit`);

  const blocoConcurrency = texto.match(/(?:^|\n)concurrency:\s*\n([\s\S]*?)(?=\n\S|$)/);
  if (!blocoConcurrency) {
    erros.push(`${nome}: concurrency global ausente`);
  } else {
    if (!new RegExp(`^\\s*group:\\s*${grupoGlobal}\\s*$`, 'm').test(blocoConcurrency[1])) {
      erros.push(`${nome}: concurrency.group deve ser ${grupoGlobal}`);
    }
    if (!/^\s*cancel-in-progress:\s*false\s*$/m.test(blocoConcurrency[1])) {
      erros.push(`${nome}: cancel-in-progress deve ser false`);
    }
  }

  exigeInputOpcional(texto, 'event_type', nome);
  exigeInputOpcional(texto, 'revision', nome);
  if (!/ALERTA_EVENT_TYPE:\s*\$\{\{\s*inputs\.event_type\s*\}\}/.test(texto)) {
    erros.push(`${nome}: ALERTA_EVENT_TYPE não transporta inputs.event_type`);
  }
  if (!/ALERTA_REVISION:\s*\$\{\{\s*inputs\.revision\s*\}\}/.test(texto)) {
    erros.push(`${nome}: ALERTA_REVISION não transporta inputs.revision`);
  }
}

const workflowUnico = path.join(pasta, 'set-estado-operacional.yml');
if (fs.existsSync(workflowUnico)) {
  erros.push('set-estado-operacional.yml surgiu antes do gate de ciclo real validado.');
}

if (erros.length) {
  console.error('FAIL: contrato dos workflows de estado operacional violado.');
  erros.forEach((erro) => console.error(`- ${erro}`));
  process.exit(1);
}

console.log(`PASS: ${esperados.length} workflows serializados e compatíveis com event_type/revision opcionais.`);
