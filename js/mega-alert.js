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
  return `${data} ??s ${hora}`;
}

(function () {
  async function carregarMegaStatus() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') !== 'mega-acumulada') return;

    const container = document.getElementById('mega-acumulada-destaque');
    if (!container) return;

    try {
      const res = await fetch('../data/mega-status.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar mega-status');
      const status = await res.json();
      const minimoConfigurado = status?.minimoMilhoes ?? 50;
      const minimoMilhoes = Math.max(minimoConfigurado, 50);
      const minimoReais = minimoMilhoes * 1_000_000;
      const valorAtual = Number(status?.valorEstimadoProximoConcurso ?? 0);

      if (!status?.ativo || Number.isNaN(valorAtual) || valorAtual < minimoReais) {
        container.style.display = 'none';
        return;
      }

      if (!isDentroDaJanela(status.janelaInicio, status.janelaFim)) {
        container.style.display = 'none';
        return;
      }

      const valor = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valorAtual);
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
          <h3>?Ys? Mega Sena 50Mi+ Acumulada!!!</h3>
          <p>Pr??mio estimado em <strong>${valor}</strong>${dataProximo ? ` ?? ${dataProximo}` : ''}</p>
          <p>Bol??o estrat??gico - aberto sempre que o pr??mio for maior ou igual a ${minimoMilhoes} milh??es.</p>
          ${janelaLabel ? `<p><strong>Janela de chamada aberta at?? ${janelaLabel} (hor??rio de Bras??lia).</strong></p>` : ''}
          <div class="mega-alert-actions">
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform"
               class="btn sb2025" target="_blank" rel="noopener noreferrer">Entrar agora</a>
          </div>
        </div>
      `;
      container.style.display = 'block';
    } catch (error) {
      container.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', carregarMegaStatus);
})();
