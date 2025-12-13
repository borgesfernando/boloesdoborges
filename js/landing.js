// landing.js
// Script da nova landing (landing-v2.html).
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

function criarCardProjeto(projeto, tipo) {
  const card = document.createElement('div');
  const tipoCor = getTipoCorFromId(projeto.id);
  card.className = `project-card ${tipoCor}`;

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
  link.textContent = 'Ver detalhes';

  card.appendChild(infoDiv);
  card.appendChild(link);

  return card;
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
      especiaisContainer.appendChild(criarCardProjeto(p, 'especiais'));
    });
  }

  // Mensais
  const mensaisContainer = document.getElementById('cards-mensais-resumo');
  if (mensaisContainer && PROJETOS.mensais && Array.isArray(PROJETOS.mensais.projetos)) {
    PROJETOS.mensais.projetos.forEach(p => {
      mensaisContainer.appendChild(criarCardProjeto(p, 'mensais'));
    });
  }

  // Acumulados
  const acumuladosContainer = document.getElementById('cards-acumulados-resumo');
  if (acumuladosContainer && PROJETOS.acumulados && Array.isArray(PROJETOS.acumulados.projetos)) {
    PROJETOS.acumulados.projetos.forEach(p => {
      acumuladosContainer.appendChild(criarCardProjeto(p, 'acumulados'));
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

