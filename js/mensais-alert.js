function getContainersMensais() {
  const ids = ['mensais-alert', 'mensais-alert-destaque'];
  return ids.map((id) => document.getElementById(id)).filter(Boolean);
}

function getBasePaths() {
  const isTemplatePage = window.location.pathname.includes('/templates/');
  const isProjectPage = window.location.pathname.includes('/boloes/mensais/');
  return {
    dataPrefix: isTemplatePage ? '../data' : 'data',
    pagePrefix: isTemplatePage ? '../boloes/mensais' : 'boloes/mensais',
    isProjectPage,
  };
}

function getAlertByProjectId(projectId, alerts) {
  return alerts.find((alert) => alert?.projeto === projectId);
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
    const [quinaAlert, lfAlert] = await Promise.all([
      carregarAlerta(`${dataPrefix}/quina-mensal-alert.json`),
      carregarAlerta(`${dataPrefix}/lf-mensal-alert.json`),
    ]);

    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('id');
    const alertEscolhido =
      pageId === 'quina-mensal'
        ? getAlertByProjectId('quina-mensal', [quinaAlert])
        : pageId === 'lf-mensal'
        ? getAlertByProjectId('lf-mensal', [lfAlert])
        : [quinaAlert, lfAlert].find((alert) => alert?.ativo);

    if (!alertEscolhido || !alertEscolhido.ativo) {
      containers.forEach((container) => {
        container.style.display = 'none';
      });
      return;
    }

    const isQuina = alertEscolhido.projeto === 'quina-mensal';
    const projetoLabel = isQuina ? 'Quina Mensal' : 'Lotofácil Mensal';
    const actionHtml = isProjectPage
      ? ''
      : `<div class="mega-alert-actions">
          <a href="${pagePrefix}/${alertEscolhido.projeto}.html" class="btn sb2026">Ver ${projetoLabel}</a>
        </div>`;

    const html = `
      <div>
        <h3>🎯 ${projetoLabel} aberto!</h3>
        <p>A janela de entrada para o ${projetoLabel} está ativa.</p>
        ${actionHtml}
      </div>
    `;

    containers.forEach((container) => {
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
