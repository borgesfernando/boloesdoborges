//========== Calendário oficial de sorteios CAIXA
// Fonte canônica do dia e horário oficial de sorteio por modalidade.
// Complementa verifDataApuracao.js, que continua responsável pelos horários
// técnicos de apuração (12:20/21:20) e lembrete (10:30/19:00). Este módulo
// NÃO duplica parseDataBrParaDate nem formatarDateParaString; reutiliza os
// helpers globais já expostos pela biblioteca.

var CALENDARIO_CAIXA_ = {
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
  excecoes: [
    {
      id: 'lf-independencia-2026',
      modalidade: 'lotofacil',
      dataSorteio: '15/09/2026',
      horario: '20:00',
      motivo: 'Sorteio especial Lotofácil da Independência; horário oficial 20h.'
    },
    {
      id: 'qsj-2026',
      modalidade: 'quina',
      dataSorteio: '28/06/2026',
      horario: '20:00',
      motivo: 'Sorteio especial Quina de São João; horário oficial 20h.'
    },
    {
      id: 'ds-pascoa-2026',
      modalidade: 'duplasena',
      dataSorteio: '04/04/2026',
      horario: '20:00',
      motivo: 'Sorteio especial Dupla Sena de Páscoa; horário oficial 20h.'
    },
    {
      id: 'mega-da-virada-2026',
      modalidade: 'megasena',
      dataSorteio: '31/12/2026',
      horario: '20:00',
      motivo: 'Sorteio especial Mega da Virada; horário oficial 20h.'
    }
  ]
};

var ALIASES_MODALIDADE_CAIXA_ = {
  megasena: 'megasena',
  'mega-sena': 'megasena',
  'mega sena': 'megasena',
  mega: 'megasena',
  mega_acima_50mi: 'megasena',
  maismilionaria: 'maismilionaria',
  '+milionaria': 'maismilionaria',
  '+milionária': 'maismilionaria',
  milionaria: 'maismilionaria',
  lotofacil: 'lotofacil',
  'loto-facil': 'lotofacil',
  'lotofácil': 'lotofacil',
  lf_mensal: 'lotofacil',
  quina: 'quina',
  quina_mensal: 'quina',
  duplasena: 'duplasena',
  'dupla-sena': 'duplasena',
  ds_mensal: 'duplasena'
};

/**
 * @description Resolve o dia e o horário oficial de sorteio da CAIXA para uma
 * modalidade em uma data, usando o calendário canônico versionado. O retorno é
 * determinístico e factual; não executa nenhuma consulta externa. Concurso
 * especial identificado por exceção sem horário explícito (ou via
 * `opcoes.concursoEspecial`) retorna `NAO_CONFIRMADO` e nunca cai
 * silenciosamente na grade regular.
 * @param {string} modalidade ID canônico da modalidade (`megasena`,
 * `maismilionaria`, `lotofacil`, `quina`, `duplasena`) ou alias compatível
 * de consumidores existentes (ex.: `MEGA_ACIMA_50MI`, `MILIONARIA`).
 * @param {string|Date} data Data do sorteio em `dd/MM/yyyy` ou objeto `Date`.
 * @param {Object} [opcoes] Opções adicionais.
 * @param {boolean} [opcoes.concursoEspecial] Marca o concurso como especial;
 * sem override explícito em `excecoes`, retorna `NAO_CONFIRMADO`.
 * @returns {{status: string, modalidade: string, data: string, hora: string|null, timezone: string, validFrom: string|null, fonte: string}|null} Resultado do calendário ou `null` para modalidade ou data inválidas.
 */
function obterHorarioSorteioCaixa(modalidade, data, opcoes) {
  const idCanonico = resolverModalidadeCaixa_(modalidade);
  if (!idCanonico) {
    return null;
  }

  const dataBase = resolverDataBaseCaixa_(data);
  if (!dataBase) {
    return null;
  }

  const dataStr = formatarDateParaString(dataBase);
  const versao = obterVersaoCalendarioCaixa_(dataBase);

  // Exceções especiais são avaliadas antes da vigência da versão: um sorteio
  // especial registrado é autoritativo mesmo fora da janela da grade regular.
  const excecao = obterExcecaoCalendarioCaixa_(idCanonico, dataStr, opcoes);
  if (excecao) {
    if (excecao.horario) {
      return montarResultadoSorteioCaixa_('ESPECIAL', idCanonico, dataStr, excecao.horario, versao ? versao.validFrom : null);
    }
    return montarResultadoSorteioCaixa_('NAO_CONFIRMADO', idCanonico, dataStr, null, versao ? versao.validFrom : null);
  }

  if (!versao) {
    return montarResultadoSorteioCaixa_('NAO_CONFIRMADO', idCanonico, dataStr, null, null);
  }

  const grade = versao.modalidades[idCanonico];
  const hora = grade ? grade[obterNomeDiaSemanaCaixa_(dataBase)] : null;
  if (!hora) {
    return montarResultadoSorteioCaixa_('NAO_HA_SORTEIO', idCanonico, dataStr, null, versao.validFrom);
  }

  return montarResultadoSorteioCaixa_('REGULAR', idCanonico, dataStr, hora, versao.validFrom);
}

/**
 * @description Formata um horário `HH:MM` do calendário CAIXA no texto curto
 * usado nas comunicações (`21:00` → `21h`, `11:00` → `11h`).
 * @param {string} hora Horário no formato `HH:MM`.
 * @returns {string} Texto curto ou string vazia para entrada inválida.
 */
function formatarHorarioSorteioCaixa(hora) {
  const partes = String(hora || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!partes) {
    return '';
  }
  const h = Number(partes[1]);
  const m = Number(partes[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return '';
  }
  return `${String(h).padStart(2, '0')}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
}

function resolverModalidadeCaixa_(modalidade) {
  const chave = String(modalidade || '').trim().toLowerCase();
  if (!chave) {
    return null;
  }
  return ALIASES_MODALIDADE_CAIXA_[chave] || null;
}

function resolverDataBaseCaixa_(data) {
  if (data && typeof data === 'object' && typeof data.getFullYear === 'function' && !isNaN(data.getTime())) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }
  return parseDataBrParaDate(data);
}

function obterVersaoCalendarioCaixa_(dataBase) {
  const versoes = CALENDARIO_CAIXA_.versoes || [];
  let versaoSelecionada = null;
  for (let indice = 0; indice < versoes.length; indice++) {
    const versao = versoes[indice];
    const inicio = versao.validFrom ? parseDataIsoCalendarioCaixa_(versao.validFrom) : null;
    const fim = versao.validUntil ? parseDataIsoCalendarioCaixa_(versao.validUntil) : null;
    const dentroVigencia = inicio && inicio <= dataBase && (!fim || dataBase <= fim);
    if (dentroVigencia && (!versaoSelecionada || String(versao.validFrom) > String(versaoSelecionada.validFrom))) {
      versaoSelecionada = versao;
    }
  }
  return versaoSelecionada;
}

function parseDataIsoCalendarioCaixa_(dataIso) {
  const partes = String(dataIso || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!partes) {
    return null;
  }
  const data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  if (
    data.getFullYear() !== Number(partes[1]) ||
    data.getMonth() !== Number(partes[2]) - 1 ||
    data.getDate() !== Number(partes[3])
  ) {
    return null;
  }
  return data;
}

function obterNomeDiaSemanaCaixa_(dataBase) {
  const nomes = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return nomes[dataBase.getDay()];
}

function obterExcecaoCalendarioCaixa_(idCanonico, dataStr, opcoes) {
  const excecoes = CALENDARIO_CAIXA_.excecoes || [];
  for (let indice = 0; indice < excecoes.length; indice++) {
    const excecao = excecoes[indice];
    const modalidadeCorresponde = !excecao.modalidade || resolverModalidadeCaixa_(excecao.modalidade) === idCanonico;
    const dataCorresponde = !excecao.dataSorteio || excecao.dataSorteio === dataStr;
    if (modalidadeCorresponde && dataCorresponde) {
      return excecao;
    }
  }
  if (opcoes && opcoes.concursoEspecial === true) {
    return { horario: null };
  }
  return null;
}

function montarResultadoSorteioCaixa_(status, idCanonico, dataStr, hora, validFrom) {
  return {
    status: status,
    modalidade: idCanonico,
    data: dataStr,
    hora: hora || null,
    timezone: CALENDARIO_CAIXA_.timezone,
    validFrom: validFrom || null,
    fonte: 'CAIXA'
  };
}
