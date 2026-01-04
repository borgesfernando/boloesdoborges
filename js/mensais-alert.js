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
  return `${data} às ${hora}`;
}

function getContainersMensais() {
  const ids = ['mensais-alert', 'mensais-alert-destaque'];
  return ids.map((id) => document.getElementById(id)).filter(Boolean);
}

function getBasePaths() {
  const isTemplatePage = window.location.pathname.includes('/templates/');
  return {
    dataPrefix: isTemplatePage ? '../data' : 'data',
    pagePrefix: isTemplatePage ? 'mensais.html' : 'templates/mensais.html',
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
    const { dataPrefix, pagePrefix } = getBasePaths();
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
        : getAlertByProjectId('quina-mensal', [quinaAlert, lfAlert]) ||
          getAlertByProjectId('lf-mensal', [quinaAlert, lfAlert]);

    if (!alertEscolhido?.ativo || !isDentroDaJanela(alertEscolhido.janelaInicio, alertEscolhido.janelaFim)) {
      containers.forEach((container) => {
        container.style.display = 'none';
      });
      return;
    }

    const isQuina = alertEscolhido.projeto === 'quina-mensal';
    const projetoLabel = isQuina ? 'Quina Mensal' : 'Lotofácil Mensal';
    const janelaLabel = formatJanelaFimLabel(alertEscolhido.janelaFim);
    const html = `
      <div>
        <h3>🎯 ${projetoLabel} aberto!</h3>
        <p>A janela de entrada para o ${projetoLabel} está ativa.</p>
        ${janelaLabel ? `<p><strong>Janela aberta até ${janelaLabel} (horário de Brasília).</strong></p>` : ''}
        <div class="mega-alert-actions">
          <a href="${pagePrefix}?id=${alertEscolhido.projeto}" class="btn sb2026">Ver ${projetoLabel}</a>
        </div>
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
