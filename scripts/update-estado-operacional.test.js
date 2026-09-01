#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  atualizarEstadoOperacional,
  emptyAggregate,
  sanitizarContextoPublico,
  resolverEstadoPublico,
  validarSaidaPublica,
} = require('./update-mensais-alert.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'estado-operacional-test-'));
const estadoPath = path.join(tmp, 'estado-operacional.json');
const slugs = ['lf-mensal','quina-mensal','ds-mensal','lf-independencia','quina-saojoao','ds-pascoa','mega-virada','mega-50mais','milionaria'];

const aberturaBase = {
  ativo: true,
  estado: 'ABERTA',
  fase: 'INSCRICOES',
  concurso: '9999',
  abreEm: '2099-08-31T10:00:00-03:00',
  fechaEm: '2099-09-02T12:00:00-03:00',
  timezone: 'America/Sao_Paulo',
  correlationId: 'corr-1',
  atualizadoEm: '2099-08-31T10:00:00-03:00',
  contextoPublico: { concurso: '9999', dataOperacao: '2099-08-31', observacaoPublica: 'Janela confirmada.' },
};

// 1. Esqueleto sempre contém os nove projetos.
{
  const base = emptyAggregate();
  assert.strictEqual(base.schemaVersion, 2);
  assert.deepStrictEqual(Object.keys(base.projetos).sort(), slugs.slice().sort());
  assert.ok(Object.values(base.projetos).every((p) => p.estado === 'INDISPONIVEL'));
  console.log('PASS: agregado vazio contém os nove projetos');
}

// 2. Projeto desconhecido não cria arquivo.
{
  const r = atualizarEstadoOperacional(estadoPath, { projeto: 'desconhecido', ativo: true });
  assert.strictEqual(r.atualizado, false);
  assert.strictEqual(fs.existsSync(estadoPath), false);
  console.log('PASS: projeto desconhecido falha de forma segura');
}

// 3. ABERTA sem janela completa/correlação nunca é publicada como aberta.
{
  assert.strictEqual(resolverEstadoPublico({ ativo: true, estado: 'ABERTA', concurso: '1', correlationId: '', abreEm: '', fechaEm: '' }), 'INDISPONIVEL');
  const dados = { projeto: 'lf-mensal', ativo: true, estado: 'ABERTA', concurso: '1' };
  atualizarEstadoOperacional(estadoPath, dados);
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(doc.projetos['lf-mensal'].estado, 'INDISPONIVEL');
  assert.strictEqual(doc.projetos['lf-mensal'].ativo, false);
  console.log('PASS: ativação incompleta nunca gera falso positivo');
}

// 4. Abertura completa atualiza somente o projeto alvo.
{
  const antes = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  atualizarEstadoOperacional(estadoPath, Object.assign({ projeto: 'mega-50mais' }, aberturaBase));
  const depois = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(depois.projetos['mega-50mais'].estado, 'ABERTA');
  assert.strictEqual(depois.projetos['mega-50mais'].ativo, true);
  assert.strictEqual(depois.projetos['mega-50mais'].fase, 'INSCRICOES');
  assert.strictEqual(depois.projetos['mega-50mais'].fonteEstado, 'Apps_Scripts');
  for (const slug of slugs.filter((s) => s !== 'mega-50mais')) {
    assert.deepStrictEqual(depois.projetos[slug], antes.projetos[slug]);
  }
  console.log('PASS: atualização é isolada por projeto');
}

// 5. Idempotência do mesmo evento completo.
{
  const payload = Object.assign({ projeto: 'mega-50mais' }, aberturaBase);
  const antes = fs.readFileSync(estadoPath, 'utf8');
  const r = atualizarEstadoOperacional(estadoPath, payload);
  const depois = fs.readFileSync(estadoPath, 'utf8');
  assert.strictEqual(r.atualizado, false);
  assert.strictEqual(antes, depois);
  console.log('PASS: evento repetido é idempotente');
}

// 6. Fechado pode manter fase de andamento sem reabrir adesão.
{
  const fechado = Object.assign({ projeto: 'milionaria' }, aberturaBase, {
    ativo: false,
    estado: 'FECHADA',
    fase: 'AGUARDANDO_SORTEIO',
    concurso: '390',
    correlationId: 'corr-mili',
    atualizadoEm: '2099-09-02T12:01:00-03:00',
  });
  atualizarEstadoOperacional(estadoPath, fechado);
  const p = JSON.parse(fs.readFileSync(estadoPath, 'utf8')).projetos.milionaria;
  assert.strictEqual(p.estado, 'FECHADA');
  assert.strictEqual(p.ativo, false);
  assert.strictEqual(p.fase, 'AGUARDANDO_SORTEIO');
  console.log('PASS: estado e fase permanecem conceitos distintos');
}

// 7. Contexto usa allowlist e rejeita campos sensíveis.
{
  assert.deepStrictEqual(
    sanitizarContextoPublico({ concurso: '123', dataOperacao: '2099-01-01', observacaoPublica: 'ok', outro: 'ignorar' }),
    { concurso: '123', dataOperacao: '2099-01-01', observacaoPublica: 'ok' },
  );
  assert.throws(() => sanitizarContextoPublico({ planilhaId: 'x' }), /campo inválido/i);
  assert.throws(() => sanitizarContextoPublico({ whatsappGrupo: 'x' }), /campo inválido/i);
  console.log('PASS: contexto público é allowlisted');
}

// 8. Documento final não contém chaves/campos proibidos.
{
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(validarSaidaPublica(doc), true);
  const conteudo = JSON.stringify(doc).toLowerCase();
  for (const termo of ['planilhaid','spreadsheet','driveid','github_token','telegram_outbound_secret','pix','whatsapp','authorization','cookie']) {
    assert.strictEqual(conteudo.includes(termo), false, `não deve conter ${termo}`);
  }
  console.log('PASS: saída pública sanitizada');
}

// 9. Arquivo corrompido é reconstruído com os nove projetos.
{
  fs.writeFileSync(estadoPath, '{corrompido', 'utf8');
  atualizarEstadoOperacional(estadoPath, Object.assign({ projeto: 'quina-mensal' }, aberturaBase, { concurso: '7000', correlationId: 'corr-q' }));
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.deepStrictEqual(Object.keys(doc.projetos).sort(), slugs.slice().sort());
  assert.strictEqual(doc.projetos['quina-mensal'].estado, 'ABERTA');
  console.log('PASS: corrupção local é reconstruída com segurança');
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('update-estado-operacional.test.js: OK');
