function formatFechamentoDMinusOne(dataProximoConcurso) {
  if (!dataProximoConcurso) return '';
  const parts = dataProximoConcurso.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return '';
  const date = new Date(parts[3], parts[2] - 1, parts[1]);
  date.setDate(date.getDate() - 1);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `D - 1 de ${day}/${month} (dia anterior) às 18h`;
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
      if (!status?.ativo) {
        container.style.display = 'none';
        return;
      }

      const valor = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(status.valorEstimadoProximoConcurso ?? 0);
      const concursoParts = [];
      if (status.concurso) {
        concursoParts.push(`Concurso ${status.concurso}`);
      }
      if (status.dataProximoConcurso) {
        concursoParts.push(`em ${status.dataProximoConcurso}`);
      }
      const dataProximo = concursoParts.length ? concursoParts.join(' ') : '';
      const minimoMilhoes = status.minimoMilhoes ?? 50;
      const fechamentoTexto = formatFechamentoDMinusOne(status.dataProximoConcurso);

      container.innerHTML = `
        <div>
          <h3>🚨 Mega Sena 50Mi+ Acumulada!!!</h3>
          <p>Prêmio estimado em <strong>${valor}</strong>${dataProximo ? ` · ${dataProximo}` : ''}</p>
          <p>Bolão estratégico - aberto sempre que o prêmio for acima de ${minimoMilhoes} milhões.</p>
          ${fechamentoTexto ? `<p>Fechamento em: ${fechamentoTexto}</p>` : ''}
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
