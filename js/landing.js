// landing.js
// Script da landing principal (index.html).
// Usa PROJETOS (js/config.js) e faq.json como fontes de verdade.

function parseDataBR(str) {
  if (!str) return null;
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(m[3], m[2] - 1, m[1]);
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
  h3.textContent = projeto.nome || projeto.id;
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

  const templateFile = tipo === 'especiais'
    ? 'especiais.html'
    : tipo === 'mensais'
      ? 'mensais.html'
      : 'acumulados.html';
  const link = document.createElement('a');
  link.className = `btn ${tipoCor}`;
  link.href = `templates/${templateFile}?id=${projeto.id}`;
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
  badgeFinalizado.textContent = 'Projeto finalizado';
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
      `<br><span class="aviso-fechamento">Fechamento no dia ${proximo.dataLimite.replace(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, '$1/$2/$3')}!</span>`;
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

  // Especiais ordenados por data limite (ativos primeiro)
  const especiaisContainer = document.getElementById('cards-especiais-resumo');
  if (especiaisContainer && PROJETOS.especiais && Array.isArray(PROJETOS.especiais.projetos)) {
    const especiaisComData = PROJETOS.especiais.projetos.map(p => ({
      ...p,
      dataLimiteObj: parseDataBR(p.dataLimite)
    }));

    const ativos = especiaisComData
      .filter(p => p.dataLimiteObj && p.dataLimiteObj >= hoje)
      .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj);

    const passados = especiaisComData
      .filter(p => p.dataLimiteObj && p.dataLimiteObj < hoje)
      .sort((a, b) => b.dataLimiteObj - a.dataLimiteObj);

    const ordenados = [...ativos, ...passados];
    ordenados.forEach(p => {
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
  renderizarProjetosResumo();
  renderizarFaqTeaser();
});
