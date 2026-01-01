// landing.js
// Script da landing principal (index.html).
// Usa PROJETOS (js/config.js) e faq.json como fontes de verdade.

function parseDataBR(str) {
  if (!str) return null;
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(m[3], m[2] - 1, m[1]);
}

function isDentroDaJanela(janelaInicioISO, janelaFimISO) {
  if (!janelaInicioISO || !janelaFimISO) return false;
  const inicio = new Date(janelaInicioISO);
  const fim = new Date(janelaFimISO);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return false;
  const agora = new Date();
  return agora >= inicio && agora < fim;
}

function formatJanelaFimLabel(janelaFimISO) {
  if (!janelaFimISO) return '';
  const fim = new Date(janelaFimISO);
  if (Number.isNaN(fim.getTime())) return '';
  const data = fim.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit'
  });
  const hora = fim.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(':', 'h');
  return `${data} \u00e0s ${hora}`;
}

function getTipoCorFromId(id) {
  if (!id) return '';
  const prefix = id.split('-')[0];
  return ({
    ds: 'dupla',
    lf: 'lotofacil',
    quina: 'quina',
    mega: 'mega'
  }[prefix] || prefix);
}

function obterEspeciaisOrdenados(hojeLimpo) {
  if (typeof PROJETOS === 'undefined' || !PROJETOS.especiais || !Array.isArray(PROJETOS.especiais.projetos)) {
    return { especiaisOrdenados: [], especiaisComData: [] };
  }

  const hojeBase = hojeLimpo instanceof Date ? new Date(hojeLimpo.getTime()) : new Date();
  hojeBase.setHours(0, 0, 0, 0);

  const especiaisComData = PROJETOS.especiais.projetos.map(p => ({
    ...p,
    dataLimiteObj: parseDataBR(p.dataLimite)
  }));

  const ativos = especiaisComData
    .filter(p => p.dataLimiteObj && p.dataLimiteObj >= hojeBase)
    .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj);

  const passados = especiaisComData
    .filter(p => p.dataLimiteObj && p.dataLimiteObj < hojeBase)
    .sort((a, b) => b.dataLimiteObj - a.dataLimiteObj);

  return {
    especiaisOrdenados: [...ativos, ...passados],
    especiaisComData
  };
}

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value ?? 0);
}

const MEGA_PREMIO_MINIMO_CHAMADA = 50_000_000;
const MEGA_PREMIO_MAXIMO_CHAMADA = 300_000_000;

function isMegaPremioValido(valor) {
  return valor > MEGA_PREMIO_MINIMO_CHAMADA && valor < MEGA_PREMIO_MAXIMO_CHAMADA;
}

async function renderizarMegaAcumuladaAlert() {
  const container = document.getElementById('mega-acumulada-alert');
  if (!container) return;

  try {
    const res = await fetch('data/mega-status.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao carregar mega-status');
    const status = await res.json();
    const minimoConfigurado = status?.minimoMilhoes ?? 50;
    const minimoMilhoes = Math.max(minimoConfigurado, 50);
    const minimoReais = minimoMilhoes * 1_000_000;
    const valorAtual = Number(status?.valorEstimadoProximoConcurso ?? 0);

    if (
      !status?.ativo ||
      Number.isNaN(valorAtual) ||
      valorAtual < minimoReais ||
      !isMegaPremioValido(valorAtual)
    ) {
      container.style.display = 'none';
      return;
    }

    if (!isDentroDaJanela(status.janelaInicio, status.janelaFim)) {
      container.style.display = 'none';
      return;
    }

    const valorFormatado = formatCurrencyBRL(valorAtual);
    const concursoParts = [];
    if (status.concurso) {
      concursoParts.push(`Concurso ${status.concurso}`);
    }
    if (status.dataProximoConcurso) {
      concursoParts.push(`em ${status.dataProximoConcurso}`);
    }
    const dataProximo = concursoParts.length ? concursoParts.join(' ') : '';
    const janelaLabel = formatJanelaFimLabel(status.janelaFim);

    container.innerHTML = `
      <div>
        <h3>\uD83D\uDEA8 Mega Sena 50Mi+ Acumulada!!!</h3>
        <p>Pr\u00eamio estimado em <strong>${valorFormatado}</strong>${dataProximo ? ` \u2013 ${dataProximo}` : ''}</p>
        <p>Bol\u00e3o estrat\u00e9gico - aberto sempre que o pr\u00eamio for maior ou igual a ${minimoMilhoes} milh\u00f5es.</p>
        ${janelaLabel ? `<p><strong>Janela de chamada aberta at\u00e9 ${janelaLabel} (hor\u00e1rio de Bras\u00edlia).</strong></p>` : ''}
        <div class="mega-alert-actions">
          <a href="templates/acumulados.html?id=mega-acumulada" class="btn sb2026">Ver detalhes do bol\u00e3o</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform" class="btn tonal" target="_blank" rel="noopener noreferrer">Entrar na comunidade</a>
        </div>
      </div>
    `;
    container.style.display = 'block';
  } catch (error) {
    container.style.display = 'none';
  }
}

function getHojeSaoPaulo() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
}

function isJanelaAberturaAnual(data) {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return false;
  const mes = data.getMonth() + 1;
  const dia = data.getDate();
  return mes === 1 && dia >= 1 && dia <= 9;
}

function montarAberturaJaneiro() {
  const wrapper = document.getElementById('abertura-janeiro');
  const listaEl = document.getElementById('abertura-projetos');
  const anoEl = document.getElementById('abertura-ano');
  if (!wrapper || !listaEl || typeof PROJETOS === 'undefined') return;

  const hojeSP = getHojeSaoPaulo();
  if (!isJanelaAberturaAnual(hojeSP)) {
    wrapper.style.display = 'none';
    return;
  }

  const ano = hojeSP.getFullYear();
  if (anoEl) anoEl.textContent = String(ano);

  const cards = [];
  const especiais = PROJETOS?.especiais?.projetos ?? [];
  const mensais = PROJETOS?.mensais?.projetos ?? [];
  const acumulados = PROJETOS?.acumulados?.projetos ?? [];

  especiais.forEach((p) => {
    cards.push({
      titulo: p.nome,
      detalhe: `PIX dia ${p.diaPix} · Limite ${p.dataLimite}`,
    });
  });

  mensais.forEach((p) => {
    cards.push({
      titulo: p.nome,
      detalhe: `Cota mensal R$ ${p.cotaMensal},00 · Ciclo ${p.ciclo}`,
    });
  });

  acumulados.forEach((p) => {
    cards.push({
      titulo: p.nome,
      detalhe: `Ativo acima de R$ ${p.minimo} milhões`,
    });
  });

  listaEl.innerHTML = '';
  cards.forEach(({ titulo, detalhe }) => {
    const card = document.createElement('div');
    card.className = 'abertura-card';
    card.innerHTML = `<strong>${titulo}</strong><p>${detalhe}</p>`;
    listaEl.appendChild(card);
  });

  wrapper.style.display = cards.length ? 'block' : 'none';
}

function criarCardProjeto(projeto, tipo, hojeLimpo) {
  const card = document.createElement('div');
  const tipoCor = getTipoCorFromId(projeto.id);
  card.className = `project-card ${tipoCor}`;

  let ativo = true;
  let diasRestantes = null;

  // Regras de inatividade e contagem regressiva para especiais,
  // espelhando o comportamento da home anterior.
  if (tipo === 'especiais' && hojeLimpo instanceof Date) {
    const mesAtual = hojeLimpo.getMonth() + 1;
    const inicio = parseInt(projeto.mesInicio, 10);
    const fim = parseInt(projeto.mesFim, 10);
    if (!Number.isNaN(inicio) && !Number.isNaN(fim)) {
      ativo = mesAtual >= inicio && mesAtual <= fim;
    }
    if (!ativo) {
      card.classList.add('inativo');
    } else if (projeto.dataLimite) {
      const limite = parseDataBR(projeto.dataLimite);
      if (limite) {
        const base = new Date(hojeLimpo.getTime());
        base.setHours(0, 0, 0, 0);
        const MS_DIA = 1000 * 60 * 60 * 24;
        diasRestantes = Math.max(0, Math.ceil((limite - base) / MS_DIA));
      }
    }
  }

  const infoDiv = document.createElement('div');
  infoDiv.className = 'project-info';

  const h3 = document.createElement('h3');
  const nomeProjeto = projeto.nome || projeto.id;
  const templateFile = tipo === 'especiais'
    ? 'especiais.html'
    : tipo === 'mensais'
      ? 'mensais.html'
      : 'acumulados.html';
  const href = `templates/${templateFile}?id=${projeto.id}`;

  const titleLink = document.createElement('a');
  titleLink.href = href;
  titleLink.textContent = nomeProjeto;
  titleLink.className = 'project-title-link';
  h3.appendChild(titleLink);
  infoDiv.appendChild(h3);

  const detalhes = document.createElement('p');
  detalhes.className = 'project-date';

  if (tipo === 'especiais') {
    const partes = [];
    if (projeto.cota && projeto.parcelas && projeto.valorMes) {
      partes.push(`Cota: R$ ${projeto.cota},00 (${projeto.parcelas} x R$ ${projeto.valorMes},00)`);
    }
    if (projeto.dataSorteio) {
      partes.push(`Apuração: ${projeto.dataSorteio}`);
    }
    detalhes.textContent = partes.join(' · ');
  } else if (tipo === 'mensais') {
    if (projeto.cotaMensal) {
      detalhes.textContent = `Cota mensal: R$ ${projeto.cotaMensal},00`;
    }
  } else if (tipo === 'acumulados') {
    if (projeto.minimo) {
      detalhes.textContent = `Ativo quando o prêmio acumular acima de R$ ${projeto.minimo} milhões`;
    }
  }

  if (detalhes.textContent) {
    infoDiv.appendChild(detalhes);
  }

  const link = document.createElement('a');
  link.className = `btn ${tipoCor}`;
  link.href = href;
  // Mesmo texto de botão usado anteriormente
  if (tipo === 'mensais' || tipo === 'acumulados') {
    link.textContent = 'Mais informações';
  } else {
    link.textContent = 'Como Participar';
  }

  card.appendChild(infoDiv);
  card.appendChild(link);

  // Badge de projeto finalizado (visível somente em cards marcados como inativos)
  const badgeFinalizado = document.createElement('span');
  badgeFinalizado.className = 'badge-finalizado';
  badgeFinalizado.textContent = 'Aguarde a nova edição';
  card.appendChild(badgeFinalizado);

  // Tooltip de contagem regressiva para especiais ativos
  if (tipo === 'especiais' && ativo && diasRestantes !== null) {
    const badgeContagem = document.createElement('span');
    badgeContagem.className = 'badge-contagem';
    badgeContagem.textContent =
      `⏳ Restam ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} para encerrar este bolão!`;
    card.appendChild(badgeContagem);
  }

  return card;
}

function configurarAvisoTopo(especiaisComData, hoje) {
  const aviso = document.getElementById('avisoTopo');
  const msgEl = document.getElementById('mensagemAviso');
  const btn = document.getElementById('btnParticipar');
  if (!aviso || !msgEl || !btn || !Array.isArray(especiaisComData)) return;

  const futuros = especiaisComData
    .filter(p => p.dataLimiteObj && p.dataLimiteObj > hoje)
    .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj);

  const proximo = futuros[0];
  if (!proximo) {
    aviso.style.display = 'none';
    return;
  }

  const MS_DIA = 1000 * 60 * 60 * 24;
  const diasRestantes = Math.ceil((proximo.dataLimiteObj - hoje) / MS_DIA);

  if (diasRestantes > 0 && diasRestantes <= 15) {
    const mensagem = `⏳ Faltam ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} para garantir sua cota no Bolão "${proximo.nome}"!` +
      `<br><span class="aviso-fechamento">Fechamento no dia ${proximo.dataLimite}!</span>`;
    msgEl.innerHTML = mensagem;
    btn.href = `templates/especiais.html?id=${proximo.id}`;
    aviso.style.display = 'flex';
  } else {
    aviso.style.display = 'none';
  }
}

function renderizarProjetosResumo() {
  if (typeof PROJETOS === 'undefined') return;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { especiaisOrdenados, especiaisComData } = obterEspeciaisOrdenados(hoje);

  // Especiais ordenados por data limite (ativos primeiro)
  const especiaisContainer = document.getElementById('cards-especiais-resumo');
  if (especiaisContainer && especiaisOrdenados.length) {
    especiaisOrdenados.forEach(p => {
      especiaisContainer.appendChild(criarCardProjeto(p, 'especiais', hoje));
    });

    // Aviso fixo de prazo dos especiais (até 15 dias antes do fechamento)
    configurarAvisoTopo(especiaisComData, hoje);
  }

  // Mensais
  const mensaisContainer = document.getElementById('cards-mensais-resumo');
  if (mensaisContainer && PROJETOS.mensais && Array.isArray(PROJETOS.mensais.projetos)) {
    PROJETOS.mensais.projetos.forEach(p => {
      mensaisContainer.appendChild(criarCardProjeto(p, 'mensais', hoje));
    });
  }

  // Acumulados
  const acumuladosContainer = document.getElementById('cards-acumulados-resumo');
  if (acumuladosContainer && PROJETOS.acumulados && Array.isArray(PROJETOS.acumulados.projetos)) {
    PROJETOS.acumulados.projetos.forEach(p => {
      acumuladosContainer.appendChild(criarCardProjeto(p, 'acumulados', hoje));
    });
  }
}

function renderizarLinhasPrincipais() {
  if (typeof PROJETOS === 'undefined') return;

  const container = document.getElementById('cards-linhas-principais');
  if (!container) return;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { especiaisOrdenados } = obterEspeciaisOrdenados(hoje);
  const especiaisAtivos = especiaisOrdenados.filter(p => p.dataLimiteObj && p.dataLimiteObj >= hoje);
  const proximoEspecial = especiaisAtivos[0];

  const totalMensais = PROJETOS.mensais && Array.isArray(PROJETOS.mensais.projetos)
    ? PROJETOS.mensais.projetos.length
    : 0;

  const totalAcumulados = PROJETOS.acumulados && Array.isArray(PROJETOS.acumulados.projetos)
    ? PROJETOS.acumulados.projetos.length
    : 0;

  function criarCardLinha(titulo, descricao, detalheDinamico, href, classeBtn) {
    const card = document.createElement('div');
    card.className = 'project-card linha-card';

    const info = document.createElement('div');
    info.className = 'project-info';

    const h3 = document.createElement('h3');
    h3.textContent = titulo;
    info.appendChild(h3);

    const pDesc = document.createElement('p');
    pDesc.className = 'projects-subtitle';
    pDesc.textContent = descricao;
    info.appendChild(pDesc);

    if (detalheDinamico) {
      const pDet = document.createElement('p');
      pDet.className = 'project-date';
      pDet.textContent = detalheDinamico;
      info.appendChild(pDet);
    }

    const link = document.createElement('a');
    link.href = href;
    link.className = `btn ${classeBtn || 'sb2026'}`;
    link.textContent = 'Ver projetos';

    card.appendChild(info);
    card.appendChild(link);

    return card;
  }

  const descEspeciais = 'Grandes concursos da Caixa com planejamento anual, cotas programadas e cronograma bem definido.';
  let detalheEspeciais = '';
  if (proximoEspecial && proximoEspecial.dataLimite) {
    detalheEspeciais = `Próximo bolão em aberto: ${proximoEspecial.nome} (até ${proximoEspecial.dataLimite}).`;
  } else if (especiaisOrdenados.length) {
    detalheEspeciais = 'No momento não há bolão especial em aberto. Aguarde as próximas chamadas.';
  }

  const descMensais = 'Projetos contínuos, ideais para quem gosta de acompanhar resultados com disciplina ao longo do ano.';
  const detalheMensais = totalMensais > 0
    ? `${totalMensais} projeto${totalMensais > 1 ? 's' : ''} mensal(is) em funcionamento.`
    : '';

  const descAcumulados = 'Projetos estratégicos ativados apenas quando os prêmios da Mega ou Quina atingem valores relevantes.';
  const detalheAcumulados = totalAcumulados > 0
    ? `Monitoramos ${totalAcumulados} concurso${totalAcumulados > 1 ? 's' : ''} acumulado(s).`
    : '';

  container.appendChild(
    criarCardLinha(
      'Projetos Especiais',
      descEspeciais,
      detalheEspeciais,
      'especiais.html',
      'lotofacil'
    )
  );

  container.appendChild(
    criarCardLinha(
      'Projetos Mensais',
      descMensais,
      detalheMensais,
      'mensais.html',
      'quina'
    )
  );

  container.appendChild(
    criarCardLinha(
      'Projetos Estratégicos (Acumulados)',
      descAcumulados,
      detalheAcumulados,
      'acumulados.html',
      'mega'
    )
  );
}

async function renderizarFaqTeaser() {
  const listEl = document.getElementById('faq-teaser-list');
  const loadingEl = document.getElementById('faq-teaser-loading');
  if (!listEl) return;

  try {
    const res = await fetch('faq.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao carregar FAQ');

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('FAQ vazia');
    }

    const principais = data.slice(0, 4);
    listEl.innerHTML = '';
    principais.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = 'faq.html';
      link.textContent = item.question || '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      li.appendChild(link);
      listEl.appendChild(li);
    });
    listEl.style.display = 'block';
    if (loadingEl) loadingEl.style.display = 'none';
  } catch (e) {
    if (loadingEl) {
      loadingEl.textContent = 'Não foi possível carregar as principais dúvidas agora. Acesse a FAQ completa.';
    }
  }
}

function ajustarAnosLanding() {
  const ano = new Date().getFullYear();
  const anoCta = document.getElementById('ano-atual-cta');
  const anoProj = document.getElementById('ano-atual-projetos');
  if (anoCta) anoCta.textContent = String(ano);
  if (anoProj) anoProj.textContent = String(ano);
}

document.addEventListener('DOMContentLoaded', () => {
  ajustarAnosLanding();
  montarAberturaJaneiro();
  renderizarLinhasPrincipais();
  renderizarProjetosResumo();
  renderizarMegaAcumuladaAlert();
  renderizarFaqTeaser();
});
