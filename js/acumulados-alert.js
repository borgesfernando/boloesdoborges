(function () {
  const ALERTAS_ACUMULADOS = [
    {
      alertaId: 'mega-50mais',
      pageId: 'mega-acumulada',
      arquivo: 'mega-50mais-alert.json',
      classeCor: 'mega',
      minimo: 50,
      modalidade: 'Mega-Sena',
    },
    {
      alertaId: 'milionaria',
      pageId: 'milionaria',
      arquivo: 'milionaria-alert.json',
      classeCor: 'milionaria',
      minimo: 80,
      modalidade: '+Milionária',
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

  function montarChamada(projeto, modelo) {
    const premio = `R$ ${projeto.minimo} milhões`;
    if (modelo === 2) {
      return {
        titulo: `🔥 Mais de ${premio} em jogo!`,
        texto: `Está aberta a participação no nosso Bolão Estratégico da ${projeto.modalidade}, criado especialmente para os grandes concursos.`,
        pontos: [
          '🎯 Apostas planejadas estrategicamente',
          '💰 Cota de apenas R$ 20,00',
          '⏳ Participação por tempo limitado',
          '🍀 Garanta sua cota e venha com a gente!',
        ],
      };
    }

    return {
      titulo: `Bolão Estratégico ${projeto.modalidade}`,
      texto: `Participação aberta para concursos com premiação estimada superior a ${premio}.`,
      pontos: [
        '💰 Valor da cota: R$ 20,00',
        '🎯 Apostas organizadas com estratégia de cobertura e diversificação.',
        '⏳ Adesões disponíveis durante a janela de participação',
      ],
    };
  }

  function montarCardAlerta(projeto, alerta, pagePrefix, isPaginaProjeto) {
    const href = isPaginaProjeto ? `${projeto.pageId}.html` : `${pagePrefix}/${projeto.pageId}.html`;
    const acaoDetalhe = isPaginaProjeto
      ? ''
      : `<a href="${href}" class="btn ${projeto.classeCor}">Ver detalhes do bolão</a>`;
    const chamada = montarChamada(projeto, Number(alerta.modelo) === 2 ? 2 : 1);
    const pontos = chamada.pontos.map((ponto) => `<p>${ponto}</p>`).join('');

    return `
      <div class="acumulados-alert-item ${projeto.classeCor}">
        <h3>${chamada.titulo}</h3>
        <p>${chamada.texto}</p>
        <div class="acumulados-alert-copy">${pontos}</div>
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
        .map(({ projeto, alerta }) => montarCardAlerta(projeto, alerta, contexto.pagePrefix, isPaginaProjeto))
        .join('');

      containers.forEach((container) => {
        container.classList.add('acumulados-alert-container');
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
