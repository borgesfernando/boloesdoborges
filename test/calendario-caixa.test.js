#!/usr/bin/env node
/**
 * Testes locais do gerador/validador do calendário CAIXA público
 * (data/calendario-caixa.json). Exercita apenas lógica Node; não executa
 * Apps Script nem chamadas externas.
 *
 * Execute da raiz: node test/calendario-caixa.test.js
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const gerador = require('../scripts/generate-calendario-caixa.js');
const validador = require('../scripts/validate-calendario-caixa.js');

const CANONICO_BASE = {
  schemaVersion: 1,
  timezone: 'America/Sao_Paulo',
  versoes: [
    {
      validFrom: '2026-07-19',
      validUntil: null,
      modalidades: {
        megasena: { domingo: '11:00', terca: '21:00', quinta: '21:00' },
        maismilionaria: { domingo: '11:00', quarta: '21:00' },
        lotofacil: { domingo: '11:00', segunda: '21:00', terca: '21:00', quarta: '21:00', quinta: '21:00', sexta: '21:00' },
        quina: { domingo: '11:00', segunda: '21:00', terca: '21:00', quarta: '21:00', quinta: '21:00', sexta: '21:00' },
        duplasena: { segunda: '21:00', quarta: '21:00', sexta: '21:00' }
      }
    }
  ],
  excecoes: []
};

const AGORA = new Date('2026-08-31T12:00:00.000Z');

function montarDocBase() {
  return gerador.montarConteudoPublico(JSON.parse(JSON.stringify(CANONICO_BASE)), AGORA);
}

// Transformação da grade: códigos de weekday e ordenação MON..SUN.
const sorteiosMega = gerador.converterGradeParaSorteios(CANONICO_BASE.versoes[0].modalidades.megasena);
assert.deepStrictEqual(
  sorteiosMega.map((s) => s.weekday),
  ['TUE', 'THU', 'SUN'],
  'megasena: TUE, THU, SUN na ordem canônica'
);
assert.deepStrictEqual(
  sorteiosMega.map((s) => s.time),
  ['21:00', '21:00', '11:00'],
  'megasena: horários mapeados'
);
assert.deepStrictEqual(
  gerador.converterGradeParaSorteios(CANONICO_BASE.versoes[0].modalidades.duplasena).map((s) => s.weekday),
  ['MON', 'WED', 'FRI'],
  'duplasena: MON, WED, FRI'
);
assert.throws(
  () => gerador.converterGradeParaSorteios({ dominguix: '11:00' }),
  /Dia desconhecido/,
  'rejeita dia desconhecido na grade'
);
assert.throws(
  () => gerador.converterGradeParaSorteios({ domingo: '25:00' }),
  /Horário inválido/,
  'rejeita horário inválido na grade'
);

// Documento público montado a partir da fonte canônica.
const doc = montarDocBase();
assert.strictEqual(doc.schemaVersion, 1);
assert.strictEqual(doc.timezone, 'America/Sao_Paulo');
assert.strictEqual(doc.fonte, 'CAIXA');
assert.strictEqual(doc.referencia, gerador.REFERENCIA_CAIXA);
assert.strictEqual(doc.versions.length, 1);
assert.strictEqual(Object.keys(doc.versions[0].modalidades).length, 5);
assert.deepStrictEqual(doc.exceptions, []);
assert.strictEqual(doc.versions[0].validFrom, '2026-07-19');
assert.strictEqual(doc.versions[0].validUntil, null);

// Documento válido passa na validação determinística.
assert.doesNotThrow(() => validador.validarDocumento(doc), 'documento canônico é válido');

function validarRejeita(docAlterado, padraoMensagem, rotulo) {
  assert.throws(
    () => validador.validarDocumento(docAlterado),
    (erro) => erro instanceof Error && padraoMensagem.test(erro.message),
    rotulo
  );
}

const docSchemaErrado = montarDocBase();
docSchemaErrado.schemaVersion = 2;
validarRejeita(docSchemaErrado, /schemaVersion/, 'rejeita schemaVersion divergente');

const docTimezoneErrada = montarDocBase();
docTimezoneErrada.timezone = 'Etc/UTC';
validarRejeita(docTimezoneErrada, /timezone/, 'rejeita timezone divergente');

const docWeekdayErrado = montarDocBase();
docWeekdayErrado.versions[0].modalidades.megasena.sorteios[0].weekday = 'XX';
validarRejeita(docWeekdayErrado, /weekday/, 'rejeita weekday desconhecido');

const docWeekdayDuplicado = montarDocBase();
docWeekdayDuplicado.versions[0].modalidades.megasena.sorteios.push({ weekday: 'TUE', time: '22:00' });
validarRejeita(docWeekdayDuplicado, /duplicado/, 'rejeita weekday duplicado');

const docHoraErrada = montarDocBase();
docHoraErrada.versions[0].modalidades.megasena.sorteios[0].time = '21:99';
validarRejeita(docHoraErrada, /HH:MM/, 'rejeita horário fora do formato HH:MM');

const docModalidadeDesconhecida = montarDocBase();
docModalidadeDesconhecida.versions[0].modalidades.superloto = { sorteios: [{ weekday: 'MON', time: '21:00' }] };
validarRejeita(docModalidadeDesconhecida, /modalidade desconhecida/, 'rejeita modalidade desconhecida');

const docVigenciaSobreposta = montarDocBase();
docVigenciaSobreposta.versions.push({
  validFrom: '2026-12-31',
  validUntil: null,
  modalidades: { megasena: { sorteios: [{ weekday: 'TUE', time: '21:00' }] } }
});
validarRejeita(docVigenciaSobreposta, /sobrepostas/, 'rejeita versões sobrepostas');

const docVigenciaInvalida = montarDocBase();
docVigenciaInvalida.versions[0].validFrom = '31/07/2026';
validarRejeita(docVigenciaInvalida, /validFrom/, 'rejeita validFrom fora de yyyy-MM-dd');

const docExcecaoDuplicada = montarDocBase();
docExcecaoDuplicada.exceptions = [
  { id: 'mega-virada', modalidade: 'megasena', dataSorteio: '31/12/2026', horario: null },
  { id: 'mega-virada-2', modalidade: 'megasena', dataSorteio: '31/12/2026', horario: null }
];
validarRejeita(docExcecaoDuplicada, /duplicada/, 'rejeita exceção duplicada para a mesma modalidade/data');

const docExcecaoModalidadeDesconhecida = montarDocBase();
docExcecaoModalidadeDesconhecida.exceptions = [{ id: 'x', modalidade: 'mega', dataSorteio: '31/12/2026', horario: null }];
validarRejeita(docExcecaoModalidadeDesconhecida, /modalidade desconhecida/, 'rejeita modalidade desconhecida em exceção');

const docExcecaoDataInvalida = montarDocBase();
docExcecaoDataInvalida.exceptions = [{ id: 'x', modalidade: 'megasena', dataSorteio: '31-12-2026', horario: null }];
validarRejeita(docExcecaoDataInvalida, /dataSorteio/, 'rejeita data de exceção fora de dd/MM/yyyy');

const docExcecaoHorarioInvalido = montarDocBase();
docExcecaoHorarioInvalido.exceptions = [{ id: 'x', modalidade: 'megasena', dataSorteio: '31/12/2026', horario: '11h' }];
validarRejeita(docExcecaoHorarioInvalido, /horario/, 'rejeita horário de exceção fora de HH:MM');

// Exceção com horário explícito é aceita (suporte modelado, nada inventado no JSON público).
const docExcecaoValida = montarDocBase();
docExcecaoValida.exceptions = [{ id: 'mega-virada', modalidade: 'megasena', dataSorteio: '31/12/2026', horario: null, motivo: 'Concurso especial' }];
assert.doesNotThrow(() => validador.validarDocumento(docExcecaoValida), 'exceção bem-formada é aceita');

// Sanitização: nenhum dado sensível em conteúdo limpo.
assert.deepStrictEqual(validador.detectarSensiveis(JSON.stringify(doc, null, 2)), [], 'conteúdo do calendário é limpo');
assert.ok(
  validador.detectarSensiveis('planilhaId=abc123').includes('planilhaId'),
  'detecta planilhaId'
);
assert.ok(
  validador.detectarSensiveis('token=ghp_abcdefghijklmnopqrstuvwxyz123456789').includes('token_github'),
  'detecta token GitHub'
);
assert.ok(
  validador.detectarSensiveis('https://docs.google.com/spreadsheets/d/abc123').includes('url_planilha_google'),
  'detecta URL de planilha'
);
assert.ok(
  validador.detectarSensiveis('email@example.com').includes('email'),
  'detecta e-mail'
);

// Drift: divergência entre o arquivo commitado e a fonte canônica é detectada.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'calendario-caixa-test-'));
const arquivoTmp = path.join(tmp, 'calendario-caixa.json');
fs.writeFileSync(arquivoTmp, JSON.stringify(doc, null, 2) + '\n', 'utf8');
assert.doesNotThrow(() => validador.validarArquivo(arquivoTmp), 'arquivo derivado da fonte passa sem drift');

const docDrifted = montarDocBase();
docDrifted.versions[0].modalidades.megasena.sorteios[0].time = '20:00';
fs.writeFileSync(arquivoTmp, JSON.stringify(docDrifted, null, 2) + '\n', 'utf8');
assert.throws(
  () => validador.validarArquivo(arquivoTmp),
  /DRIFT/,
  'detecta drift entre arquivo e fonte canônica'
);

console.log('calendario-caixa.test.js: OK');
