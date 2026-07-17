function getContainersAcumulados() {
  const ids = ['mega-acumulada-alert', 'acumulados-alert', 'acumulados-alert-destaque', 'mega-acumulada-destaque'];
  return ids.map((id) => document.getElementById(id)).filter(Boolean);
}

function getBasePathsAcumulados() {
  const pathName = window.location.pathname || '';
  const isTemplatePage = pathName.includes('/templates/');
  const isProjectPage = pathName.includes('/boloes/acumulados/');
  return {
    dataPrefix: isTemplatePage ? '../data' : isProjectPage ? '../../data' : 'data',
    pagePrefix: isProjectPage ? '../../boloes/acumulados' : 'boloes/acumulados',
    isProjectPage,
  };
}

function normalizeAcumuladoProjectId(projectId) {
  return String(projectId || '').trim().toLowerCase();
}

function getProjectIdFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeAcumuladoProjectId(params.get('id'));
  if (fromQuery) return fromQuery;

  const pathName = window.location.pathname || '';
  if (pathName.endsWith('/mega-acumulada.html')) return 'mega-acumulada';
  if (pathName.endsWith('/milionaria.html')) return 'milionaria';
  if (pathName.endsWith('/quina-acumulada.html')) return 'quina-acumulada';
  return '';
}

function getAlertConfig() {
  return [
    {
      projectId: 'mega-acumulada',
      alertId: 'mega-50mais',
      fileName: 'mega-50mais-alert.json',
      label: 'Mega Sena 50Mi+',
      description: 'A janela de entrada para a Mega 50+ está ativa.',
      buttonClass: 'sb2026',
      alertClass: 'mega',
      pageSlug: 'mega-acumulada',
    },
    {
      projectId: 'milionaria',
      alertId: 'milionaria',
      fileName: 'milionaria-alert.json',
      label: 'Milionária 80Mi+',
      description: 'A janela de entrada para a Milionária está ativa.',
      buttonClass: 'quina',
      alertClass: 'quina',
      pageSlug: 'milionaria',
    },
  ];
}

async function carregarAcumuladoAlert(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar acumulados-alert');
  return res.json();
}

async function renderizarAcumuladosAlert() {
  const containers = getContainersAcumulados();
  if (!containers.length) return;

  try {
    const { dataPrefix, pagePrefix, isProjectPage } = getBasePathsAcumulados();
    const alertConfig = getAlertConfig();
    const payloads = await Promise.all(
      alertConfig.map((item) =>
        carregarAcumuladoAlert(`${dataPrefix}/${item.fileName}`).then((data) => ({ item, data }))
      )
    );

    const pageProjectId = getProjectIdFromLocation();
    const escolhido = pageProjectId
      ? payloads.find(({ item, data }) =>
          normalizeAcumuladoProjectId(item.projectId) === pageProjectId &&
          normalizeAcumuladoProjectId(data?.projeto) === normalizeAcumuladoProjectId(item.alertId)
        )
      : payloads.find(({ data }) => Boolean(data?.ativo));

    if (!escolhido || !escolhido.data?.ativo) {
      containers.forEach((container) => {
        container.style.display = 'none';
      });
      return;
    }

    const { item } = escolhido;
    const actionHtml = isProjectPage
      ? ''
      : `<div class="mega-alert-actions">
          <a href="${pagePrefix}/${item.pageSlug}.html" class="btn ${item.buttonClass}">Ver ${item.label}</a>
        </div>`;

    const html = `
      <div>
        <h3>🚨 ${item.label} aberta!</h3>
        <p>${item.description}</p>
        <p>A entrada está liberada somente dentro da janela oficial divulgada na comunidade.</p>
        ${actionHtml}
      </div>
    `;

    containers.forEach((container) => {
      container.classList.remove('mega', 'quina', 'lotofacil', 'dupla');
      container.classList.add(item.alertClass);
      container.innerHTML = html;
      container.style.display = 'block';
    });
  } catch (error) {
    containers.forEach((container) => {
      container.style.display = 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderizarAcumuladosAlert);
