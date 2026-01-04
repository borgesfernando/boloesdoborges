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

async function renderizarMensaisAlert() {
  const containers = getContainersMensais();
  if (!containers.length) return;

  try {
    const isTemplatePage = window.location.pathname.includes('/templates/');
    const dataUrl = isTemplatePage ? '../data/mensais-alert.json' : 'data/mensais-alert.json';
    const baseLink = isTemplatePage ? 'mensais.html' : 'templates/mensais.html';
    const res = await fetch(dataUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao carregar mensais-alert');
    const status = await res.json();

    if (!status?.ativo || !isDentroDaJanela(status.janelaInicio, status.janelaFim)) {
      containers.forEach((container) => {
        container.style.display = 'none';
      });
      return;
    }

    const janelaLabel = formatJanelaFimLabel(status.janelaFim);
    const html = `
      <div>
        <h3>🎯 Projetos Mensais abertos!</h3>
        <p>A janela de entrada para Quina Mensal e Lotofácil Mensal está ativa.</p>
        ${janelaLabel ? `<p><strong>Janela aberta até ${janelaLabel} (horário de Brasília).</strong></p>` : ''}
        <div class="mega-alert-actions">
          <a href="${baseLink}?id=quina-mensal" class="btn sb2026">Ver Quina Mensal</a>
          <a href="${baseLink}?id=lf-mensal" class="btn tonal">Ver Lotofácil Mensal</a>
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
