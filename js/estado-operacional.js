(function () {
  'use strict';

  const ROUTES = {
    'lf-mensal': 'boloes/mensais/lf-mensal.html',
    'quina-mensal': 'boloes/mensais/quina-mensal.html',
    'ds-mensal': 'boloes/mensais/dupla-sena-mensal.html',
    'lf-independencia': 'boloes/especiais/lf-independencia.html',
    'quina-saojoao': 'boloes/especiais/quina-saojoao.html',
    'ds-pascoa': 'boloes/especiais/ds-pascoa.html',
    'mega-virada': 'boloes/especiais/mega-virada.html',
    'mega-50mais': 'boloes/acumulados/mega-acumulada.html',
    milionaria: 'boloes/acumulados/milionaria.html',
  };

  const FASE_LABELS = {
    PLANEJAMENTO: 'Em planejamento',
    INSCRICOES: 'Adesões abertas',
    PREPARACAO_APOSTAS: 'Apostas em preparação',
    APOSTAS_REGISTRADAS: 'Apostas registradas',
    AGUARDANDO_SORTEIO: 'Aguardando sorteio',
    APURACAO: 'Em apuração',
    ENCERRADA: 'Ciclo encerrado',
    INDISPONIVEL: 'Aguardando próxima atualização',
  };

  function basePrefix() {
    return window.location.pathname.includes('/boloes/') || window.location.pathname.includes('/institucional/') ? '../' : '';
  }

  function parseDate(value) {
    if (!value) return NaN;
    return Date.parse(value);
  }

  function isOpen(record, now = Date.now()) {
    if (!record || record.estado !== 'ABERTA' || record.ativo !== true) return false;
    const abre = parseDate(record.abreEm || record.janelaComunidade?.abreEm);
    const fecha = parseDate(record.fechaEm || record.janelaComunidade?.fechaEm);
    if (!Number.isFinite(abre) || !Number.isFinite(fecha) || abre >= fecha) return false;
    return now >= abre && now < fecha;
  }

  function isClosingSoon(record, now = Date.now()) {
    if (!isOpen(record, now)) return false;
    const fecha = parseDate(record.fechaEm || record.janelaComunidade?.fechaEm);
    return fecha - now <= 6 * 60 * 60 * 1000;
  }

  function effectiveView(record, now = Date.now()) {
    if (!record) return { key: 'indisponivel', label: 'Informação indisponível', priority: 90 };
    if (isClosingSoon(record, now)) return { key: 'closing', label: 'Adesões encerrando em breve', priority: 0 };
    if (isOpen(record, now)) return { key: 'open', label: 'Adesões abertas', priority: 1 };

    const fase = String(record.fase || '').toUpperCase();
    if (fase === 'PREPARACAO_APOSTAS') return { key: 'progress', label: FASE_LABELS[fase], priority: 10 };
    if (fase === 'APOSTAS_REGISTRADAS') return { key: 'progress', label: FASE_LABELS[fase], priority: 11 };
    if (fase === 'AGUARDANDO_SORTEIO') return { key: 'progress', label: FASE_LABELS[fase], priority: 12 };
    if (fase === 'APURACAO') return { key: 'progress', label: FASE_LABELS[fase], priority: 13 };
    if (fase === 'PLANEJAMENTO') return { key: 'waiting', label: FASE_LABELS[fase], priority: 30 };
    if (record.estado === 'FECHADA' || fase === 'ENCERRADA') return { key: 'closed', label: 'Sem novas adesões', priority: 50 };
    if (record.estado === 'SEM_INSTANCIA') return { key: 'waiting', label: 'Aguardando próxima janela', priority: 60 };
    return { key: 'indisponivel', label: 'Aguardando próxima atualização', priority: 80 };
  }

  function formatDateTime(value) {
    const parsed = parseDate(value);
    if (!Number.isFinite(parsed)) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(parsed));
  }

  async function load() {
    const res = await fetch(`${basePrefix()}data/estado-operacional.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Estado operacional indisponível');
    const json = await res.json();
    if (json?.schemaVersion !== 2 || !json.projetos || typeof json.projetos !== 'object') {
      throw new Error('Contrato operacional inválido');
    }
    return json;
  }

  function routeFor(slug) {
    const route = ROUTES[slug] || '#';
    return `${basePrefix()}${route}`;
  }

  function metaLine(record, view) {
    if (view.key === 'open' || view.key === 'closing') {
      const fim = formatDateTime(record.fechaEm || record.janelaComunidade?.fechaEm);
      return fim ? `Até ${fim}` : '';
    }
    if (record.concurso) return `Concurso ${record.concurso}`;
    const atualizacao = formatDateTime(record.atualizadoEm);
    return atualizacao ? `Atualizado em ${atualizacao}` : '';
  }

  function cardHtml(record) {
    const view = effectiveView(record);
    const meta = metaLine(record, view);
    return `<article class="op-update-card" data-status="${view.key}">
      <div class="op-update-dot" aria-hidden="true"></div>
      <div class="op-update-copy">
        <p class="op-update-type">${record.tipo || 'PROJETO'}</p>
        <h3>${record.nome || record.slug}</h3>
        <p class="op-update-status"><strong>${view.label}</strong>${meta ? ` · ${meta}` : ''}</p>
      </div>
      <a class="op-update-link" href="${routeFor(record.slug)}" aria-label="Ver ${record.nome || record.slug}">Ver projeto →</a>
    </article>`;
  }

  function sortedRecords(state) {
    return Object.values(state.projetos).sort((a, b) => {
      const av = effectiveView(a).priority;
      const bv = effectiveView(b).priority;
      if (av !== bv) return av - bv;
      return String(a.nome).localeCompare(String(b.nome), 'pt-BR');
    });
  }

  function renderFull(container, state) {
    const records = sortedRecords(state);
    container.innerHTML = records.map(cardHtml).join('');
  }

  function renderCompact(container, state) {
    const relevant = sortedRecords(state).filter((p) => effectiveView(p).priority < 50).slice(0, 4);
    const selected = relevant.length ? relevant : sortedRecords(state).slice(0, 3);
    container.innerHTML = `<section class="op-updates-panel" aria-labelledby="op-updates-title">
      <div class="op-updates-heading">
        <div><p class="op-updates-kicker">Agora na comunidade</p><h2 id="op-updates-title">Atualizações</h2></div>
        <a href="atualizacoes.html">Ver todas as atualizações →</a>
      </div>
      <div class="op-updates-grid">${selected.map(cardHtml).join('')}</div>
    </section>`;
  }

  function ensureHomeContainer() {
    if (document.getElementById('atualizacoes-operacionais-home')) return;
    if (!/\/(?:index\.html)?$/.test(window.location.pathname) && !window.location.pathname.endsWith('/boloesdoborges/')) return;
    const main = document.querySelector('main');
    if (!main) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'atualizacoes-operacionais-home';
    wrapper.className = 'container op-updates-home';
    main.insertBefore(wrapper, main.firstChild);
  }

  async function init() {
    ensureHomeContainer();
    const full = document.getElementById('projetos-operacionais');
    const compact = document.getElementById('atualizacoes-operacionais-home');
    if (!full && !compact) return;
    try {
      const state = await load();
      if (full) renderFull(full, state);
      if (compact) renderCompact(compact, state);
    } catch (_) {
      if (full) full.innerHTML = '<p class="op-updates-fallback">Informações operacionais indisponíveis no momento.</p>';
      if (compact) compact.innerHTML = '<p class="op-updates-fallback">Atualizações operacionais indisponíveis no momento.</p>';
    }
  }

  window.EstadoOperacional = { isOpen, isClosingSoon, effectiveView, load, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
