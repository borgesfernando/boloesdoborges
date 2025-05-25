document.addEventListener("DOMContentLoaded", () => {
  carregarProjetos('especiais', PROJETOS.especiais.projetos, 'especiais-list', 'especiais.html');
  carregarProjetos('mensais', PROJETOS.mensais.projetos, 'mensais-list', 'mensais.html');
  carregarProjetos('acumulados', PROJETOS.acumulados.projetos, 'acumulados-list', 'acumulados.html');
});

function carregarProjetos(tipo, projetos, containerId, templateFile) {
  const container = document.getElementById(containerId);
  projetos.forEach(projeto => {
    //const tipoCor = projeto.id.split('-')[0]; // ex: lf, quina, mega
    const tipoCor = {
    'ds': 'dupla',
    'lf': 'lotofacil',
    'quina': 'quina',
    'mega': 'mega'
    }[projeto.id.split('-')[0]] || projeto.id.split('-')[0];
    const btnClasse = tipoCor;
    const card = document.createElement("div");
    card.className = `project-card ${tipoCor}`;
    const nome = projeto.nome;
    const apuracao = projeto.dataSorteio ? `<p class="project-date">Apuração: ${projeto.dataSorteio}</p>` : '';
    const detalhes = projeto.minimo
      ? `<p>Participamos quando o prêmio acumula acima de <strong>R$ ${projeto.minimo} milhões</strong></p>`
      : projeto.cotaMensal
        ? `<p>Bolões em todos os sorteios</p>`
        : '';
    const textoBotao = tipo === 'acumulados' || tipo === 'mensais' ? 'Mais informações' : 'Como Participar';
    const link = `templates/${templateFile}?id=${projeto.id}`;

    card.innerHTML = `
      <div class="project-info">
        <h3>${nome}</h3>
        ${apuracao || detalhes}
      </div>
      <a href="${link}" class="btn ${btnClasse}">${textoBotao}</a>
    `;

    container.appendChild(card);
  });
}
