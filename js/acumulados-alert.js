(function () {
  const ALERTAS_ACUMULADOS = [
    {
      alertaId: 'mega-50mais',
      pageId: 'mega-acumulada',
      arquivo: 'mega-50mais-alert.json',
      titulo: 'Mega Sena 50Mi+ Acumulada!!!',
      minimo: 50,
      detalhe: 'Bolão estratégico aberto por janela manual para concursos da Mega-Sena acima de R$ 50 milhões.',
    },
    {
      alertaId: 'milionaria',
      pageId: 'milionaria',
      arquivo: 'milionaria-alert.json',
      titulo: '+Milionária 80Mi+ Acumulada!!!',
      minimo: 80,
      detalhe: 'Bolão estratégico aberto por janela manual para concursos da +Milionária acima de R$ 80 milhões.',
    },
  ];

  function getContextoAcumulados() {
    const isPaginaProjeto = window.location.pathname.includes('/boloes/acumulados/');
    return {
      dataPrefix: isPaginaProjeto ? '../../data' : 'data',
      pagePrefix: isPaginaProjeto ? '' : 'boloes/acumulados',
      paginaAtual: isPaginaProjeto
        ? window.location.pathname.split('/').pop().replace(/\.html$/, '')
        : '',
    };
  }

  async function carregarAlertaAcumulado(dataPrefix, projeto) {
    const res = await fetch(`${dataPrefix}/${projeto.arquivo}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao carregar ${projeto.arquivo}`);
    return res.json();
  }

  function montarCardAlerta(projeto, pagePrefix, isPaginaProjeto) {
    const href = isPaginaProjeto ? `${projeto.pageId}.html` : `${pagePrefix}/${projeto.pageId}.html`;
    const acaoDetalhe = isPaginaProjeto
      ? ''
      : `<a href="${href}" class="btn sb2026">Ver detalhes do bolão</a>`;

    return `
      <div class="acumulados-alert-item">
        <h3>${projeto.titulo}</h3>
        <p>${projeto.detalhe}</p>
        <p><strong>Janela pública aberta pelo Apps Script. Cota de R$ 20,00.</strong></p>
        <div class="mega-alert-actions">
          ${acaoDetalhe}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform"
             class="btn tonal" target="_blank" rel="noopener noreferrer">Entrar na comunidade</a>
        </div>
      </div>
    `;
  }

  async function renderizarAcumuladosAlert() {
    const containers = [
      document.getElementById('acumulados-alert'),
      document.getElementById('acumulados-alert-destaque'),
    ].filter(Boolean);
    if (!containers.length) return;

    const contexto = getContextoAcumulados();
    const isPaginaProjeto = Boolean(contexto.paginaAtual);
    const projetos = isPaginaProjeto
      ? ALERTAS_ACUMULADOS.filter((projeto) => projeto.pageId === contexto.paginaAtual)
      : ALERTAS_ACUMULADOS;

    try {
      const alertas = await Promise.all(
        projetos.map(async (projeto) => ({
          projeto,
          alerta: await carregarAlertaAcumulado(contexto.dataPrefix, projeto),
        }))
      );
      const ativos = alertas.filter(({ projeto, alerta }) => alerta?.projeto === projeto.alertaId && alerta?.ativo);

      if (!ativos.length) {
        containers.forEach((container) => {
          container.style.display = 'none';
        });
        return;
      }

      const html = ativos
        .map(({ projeto }) => montarCardAlerta(projeto, contexto.pagePrefix, isPaginaProjeto))
        .join('');

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

  document.addEventListener('DOMContentLoaded', renderizarAcumuladosAlert);
})();
