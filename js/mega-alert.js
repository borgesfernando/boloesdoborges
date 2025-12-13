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

      container.innerHTML = `
        <div>
          <h3>🚨 Bolão Mega Sena acumulada aberto!</h3>
          <p>Prêmio estimado: <strong>${valor}</strong>${status.dataProximoConcurso ? ` · Sorteio em ${status.dataProximoConcurso}` : ''}</p>
          <p>Garanta sua cota enquanto o prêmio estiver acima de ${status.minimoMilhoes ?? 50} milhões.</p>
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
