// js/project-loader.js

document.addEventListener("DOMContentLoaded", () => {
  carregarProjetos('especiais', PROJETOS.especiais.projetos, 'especiais-list');
  carregarProjetos('mensais', PROJETOS.mensais.projetos, 'mensais-list');
  carregarProjetos('acumulados', PROJETOS.acumulados.projetos, 'acumulados-list');
});

function carregarProjetos(tipo, projetos, containerId) {
  const container = document.getElementById(containerId);
  projetos.forEach(projeto => {
    const card = document.createElement("div");
    card.className = `project-card ${projeto.id.split('-')[0]}`;
    card.innerHTML = `
      <div class="project-info">
        <h3>${projeto.nome}</h3>
        ${projeto.dataSorteio ? `<p class="project-date">Apuração: ${projeto.dataSorteio}</p>` : ''}
        ${projeto.minimo ? `<p>Participamos quando o prêmio acumula acima de <strong>R$ ${projeto.minimo} milhões</strong></p>` : ''}
        ${projeto.cotaMensal ? `<p>Bolões em todos os sorteios</p>` : ''}
      </div>
      <a href="${projeto.id}.html" target="_blank" class="btn ${projeto.id.split('-')[0]}">
        ${tipo === 'acumulados' || tipo === 'mensais' ? 'Mais informações' : 'Como Participar'}
      </a>
    `;
    container.appendChild(card);
  });
}
