function getContainersMensais() {
  const ids = ['mensais-alert', 'mensais-alert-destaque'];
  return ids.map((id) => document.getElementById(id)).filter(Boolean);
}

function getBasePaths() {
  const isTemplatePage = window.location.pathname.includes('/templates/');
  const isProjectPage = window.location.pathname.includes('/boloes/mensais/');
  return {
    dataPrefix: isTemplatePage ? '../data' : isProjectPage ? '../data' : 'data',
    pagePrefix: isTemplatePage ? '../boloes/mensais' : 'boloes/mensais',
    isProjectPage,
  };
}

function getAlertByProjectId(projectId, alerts) {
  return alerts.find((alert) => alert?.projeto === projectId);
}

function getAlertStyles(projectId) {
  if (projectId === 'lf-mensal') return { alertClass: 'lotofacil', buttonClass: 'lotofacil' };
  if (projectId === 'quina-mensal') return { alertClass: 'quina', buttonClass: 'quina' };
  return { alertClass: 'dupla', buttonClass: 'dupla' };
}

function getAlertPageId(projectId) {
  if (projectId === 'ds-mensal') return 'dupla-sena-mensal';
  return projectId;
}

async function carregarAlerta(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar mensais-alert');
  return res.json();
}

async function renderizarMensaisAlert() {
  const containers = getContainersMensais();
  if (!containers.length) return;

  try {
    const { dataPrefix, pagePrefix, isProjectPage } = getBasePaths();
    const [dsAlert, quinaAlert, lfAlert] = await Promise.all([
      carregarAlerta(`${dataPrefix}/ds-mensal-alert.json`),
      carregarAlerta(`${dataPrefix}/quina-mensal-alert.json`),
      carregarAlerta(`${dataPrefix}/lf-mensal-alert.json`),
    ]);

    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('id');
    const alertEscolhido =
      pageId === 'ds-mensal'
        ? getAlertByProjectId('ds-mensal', [dsAlert])
        : pageId === 'quina-mensal'
        ? getAlertByProjectId('quina-mensal', [quinaAlert])
        : pageId === 'lf-mensal'
        ? getAlertByProjectId('lf-mensal', [lfAlert])
        : [dsAlert, quinaAlert, lfAlert].find((alert) => alert?.ativo);

    if (!alertEscolhido || !alertEscolhido.ativo) {
      containers.forEach((container) => {
        container.style.display = 'none';
      });
      return;
    }

    const projetoLabel =
      alertEscolhido.projeto === 'quina-mensal'
        ? 'Quina Mensal'
        : alertEscolhido.projeto === 'lf-mensal'
        ? 'Lotofácil Mensal'
        : 'Dupla Sena Mensal';
    const { alertClass, buttonClass } = getAlertStyles(alertEscolhido.projeto);
    const pageSlug = getAlertPageId(alertEscolhido.projeto);
    const actionHtml = isProjectPage
      ? ''
      : `<div class="mega-alert-actions">
          <a href="${pagePrefix}/${pageSlug}.html" class="btn ${buttonClass}">Ver ${projetoLabel}</a>
        </div>`;

    const html = `
      <div>
        <h3>🎯 ${projetoLabel} aberto!</h3>
        <p>A janela de entrada para o ${projetoLabel} está ativa.</p>
        ${actionHtml}
      </div>
    `;

    containers.forEach((container) => {
      container.classList.remove('lotofacil', 'quina', 'dupla');
      container.classList.add(alertClass);
      container.innerHTML = html;
      container.style.display = 'block';
    });
  } catch (error) {
    containers.forEach((container) => {
      container.style.display = 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderizarMensaisAlert);
