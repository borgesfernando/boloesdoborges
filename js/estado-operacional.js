(function () {
  'use strict';

  const TIMEZONE = 'America/Sao_Paulo';
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

  function basePrefix() {
    return window.location.pathname.includes('/boloes/') || window.location.pathname.includes('/institucional/') ? '../' : '';
  }

  function safeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function localDateKey(value) {
    const date = value instanceof Date ? value : new Date(value);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const read = (type) => parts.find((part) => part.type === type)?.value || '';
    return `${read('year')}-${read('month')}-${read('day')}`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: TIMEZONE, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function formatDrawDate(value) {
    const parts = String(value || '').split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : String(value || '');
  }

  async function loadProjection() {
    const response = await fetch(`${basePrefix()}data/site-projection.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Site Projection indisponível');
    const value = await response.json();
    if (!value || value.schemaVersion !== 1 || value.projectionVersion !== 'site-projection.v1') throw new Error('Site Projection inválida');
    if (!value.current || typeof value.current !== 'object' || Array.isArray(value.current) || !Array.isArray(value.updates)) throw new Error('Site Projection inválida');
    return value;
  }

  async function loadSpecialCalendar() {
    const response = await fetch(`${basePrefix()}data/calendario-caixa.json`, { cache: 'no-store' });
    if (!response.ok) return null;
    const value = await response.json();
    const today = localDateKey(new Date());
    const candidates = (value.exceptions || [])
      .map((item) => ({
        id: item.id || '',
        name: item.id === 'mega-da-virada-2026' ? 'Mega da Virada' : item.id === 'lf-independencia-2026' ? 'Lotofácil da Independência' : item.id === 'qsj-2026' ? 'Quina de São João' : item.id === 'ds-pascoa-2026' ? 'Dupla Sena de Páscoa' : item.motivo || item.id,
        drawDate: String(item.dataSorteio || '').split('/').reverse().join('-')
      }))
      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.drawDate) && item.drawDate >= today)
      .sort((a, b) => a.drawDate.localeCompare(b.drawDate));
    return candidates[0] || null;
  }

  function label(update) {
    if (update.eventType === 'PROJECT_OPENED') return 'Projeto aberto';
    if (update.eventType === 'PROJECT_CLOSED') return 'Ciclo encerrado';
    if (update.eventType === 'ACCOUNTABILITY_AVAILABLE') return 'Prestação de contas disponível';
    if (update.facts?.stage === 'ALERTA_FINAL') return 'Alerta final';
    if (update.facts?.stage === 'ULTIMA_CHAMADA') return 'Última chamada';
    return 'Atualização do projeto';
  }

  function presentationState(project) {
    if (project.facts?.stage === 'ULTIMA_CHAMADA') return 'last-call';
    if (project.facts?.stage === 'ALERTA_FINAL') return 'pre-final';
    return 'open';
  }

  function presentationLabel(project) {
    if (project.facts?.stage === 'ULTIMA_CHAMADA') return 'Última chamada';
    if (project.facts?.stage === 'ALERTA_FINAL') return 'Reta final';
    return 'Em execução';
  }

  function routeFor(project) {
    if (project.publicUrl && (project.publicUrl.startsWith('/') || project.publicUrl.startsWith('https://'))) return project.publicUrl;
    return `${basePrefix()}${ROUTES[project.projectSlug] || 'atualizacoes.html'}`;
  }

  function activeProjects(projection) {
    return Object.values(projection.current)
      .filter((project) => project && (project.status === 'OPEN' || project.status === 'ACTIVE'))
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }

  function todayUpdates(projection) {
    const today = localDateKey(new Date());
    return projection.updates
      .filter((update) => update && update.occurredAt && localDateKey(update.occurredAt) === today)
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }

  function activeCard(project, compact) {
    const facts = project.facts || {};
    return `<article id="${safeText(project.projectSlug)}" class="op-update-card" data-status="active" data-tier="current" data-presentation="${safeText(presentationState(project))}">
      <div class="op-update-dot" aria-hidden="true"></div>
      <div class="op-update-copy">
        <span class="op-update-tier">${safeText(presentationLabel(project))}</span>
        <p class="op-update-type">${safeText(project.family || 'PROJETO')}</p>
        <h3>${safeText(facts.projectName || project.projectSlug)}</h3>
        <p class="op-update-status"><strong>${safeText(label(project))}</strong>${facts.contestNumber ? ` · Concurso ${safeText(facts.contestNumber)}` : ''}</p>
        ${facts.publicDeadline ? `<p class="op-update-note">Prazo: ${safeText(formatDateTime(facts.publicDeadline))}</p>` : ''}
        ${facts.operationalContext ? `<p class="op-update-note">${safeText(facts.operationalContext)}</p>` : ''}
        <p class="op-update-note">Última atualização: ${safeText(formatDateTime(project.occurredAt))}</p>
      </div>
      <a class="op-update-link" href="${safeText(compact ? `${basePrefix()}atualizacoes.html#${encodeURIComponent(project.projectSlug)}` : routeFor(project))}">${compact ? 'Ver atualização →' : 'Ver projeto →'}</a>
    </article>`;
  }

  function emptyCards(nextSpecial) {
    const next = nextSpecial ? `<article class="op-update-card" data-status="upcoming" data-tier="upcoming">
      <div class="op-update-dot" aria-hidden="true"></div>
      <div class="op-update-copy">
        <span class="op-update-tier">Próximo projeto especial</span>
        <p class="op-update-type">Especial</p>
        <h3>${safeText(nextSpecial.name)}</h3>
        <p class="op-update-status"><strong>Sorteio em ${safeText(formatDrawDate(nextSpecial.drawDate))}</strong></p>
      </div>
      <a class="op-update-link" href="${basePrefix()}especiais.html">Conhecer projetos →</a>
    </article>` : '';
    return `<article class="op-update-card" data-tier="other">
      <div class="op-update-dot" aria-hidden="true"></div>
      <div class="op-update-copy">
        <p class="op-update-type">Comunidade</p>
        <h3>Nenhum projeto em execução neste momento</h3>
        <p class="op-update-status">O painel será atualizado automaticamente quando um projeto publicar uma nova movimentação.</p>
      </div>
    </article>${next}`;
  }

  function todayHtml(updates, limit) {
    const selected = updates.slice(0, limit);
    if (!selected.length) return '';
    return `<div class="op-updates-today"><p class="op-updates-today-title">Atualizações confirmadas hoje</p><ul>${selected.map((update) => `<li><span>${safeText(formatDateTime(update.occurredAt))}</span><strong>${safeText(update.facts?.projectName || update.projectSlug)}</strong><em>${safeText(label(update))}</em></li>`).join('')}</ul></div>`;
  }

  function renderCompact(container, projection, nextSpecial) {
    const active = activeProjects(projection);
    const updates = todayUpdates(projection);
    container.innerHTML = `<section class="op-updates-panel" aria-labelledby="op-updates-title">
      <div class="op-updates-heading">
        <div>
          <p class="op-updates-kicker">Agora na comunidade</p>
          <h2 id="op-updates-title">${active.length ? 'Atualizações dos projetos' : 'Nenhum projeto ativo hoje'}</h2>
          <p class="op-updates-summary">${active.length ? 'Em execução agora em maior destaque; fatos confirmados pelos próprios projetos.' : 'As próximas movimentações aparecem aqui assim que forem confirmadas pelos projetos.'}</p>
        </div>
        <a href="${basePrefix()}atualizacoes.html">Ver todas as atualizações →</a>
      </div>
      <div class="op-updates-grid">${active.length ? active.map((project) => activeCard(project, true)).join('') : emptyCards(nextSpecial)}</div>
      ${todayHtml(updates, 4)}
    </section>`;
  }

  function renderFull(container, projection, nextSpecial) {
    const active = activeProjects(projection);
    const updates = todayUpdates(projection);
    container.innerHTML = `<section class="op-updates-panel" aria-labelledby="projetos-operacionais-title">
      <div class="op-updates-heading"><div><p class="op-updates-kicker">Agora na comunidade</p><h2 id="projetos-operacionais-title">${active.length ? 'Atualizações dos projetos' : 'Nenhum projeto ativo hoje'}</h2></div></div>
      <div class="op-updates-grid">${active.length ? active.map((project) => activeCard(project, false)).join('') : emptyCards(nextSpecial)}</div>
      ${todayHtml(updates, 12)}
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
      const [projection, nextSpecial] = await Promise.all([loadProjection(), loadSpecialCalendar()]);
      if (full) renderFull(full, projection, nextSpecial);
      if (compact) renderCompact(compact, projection, nextSpecial);
    } catch (_) {
      const fallback = '<p class="op-updates-fallback">Atualizações factuais indisponíveis no momento.</p>';
      if (full) full.innerHTML = fallback;
      if (compact) compact.innerHTML = fallback;
    }
  }

  window.EstadoOperacional = { loadProjection, activeProjects, todayUpdates, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
