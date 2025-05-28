function parseDataBRparaDate(str) {
  // Aceita 1 ou 2 dígitos para dia/mês, 4 dígitos para ano
  const parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return null;
  return new Date(parts[3], parts[2]-1, parts[1]);
}

document.addEventListener("DOMContentLoaded", () => {
  const hojeLimpo = new Date();
  hojeLimpo.setHours(0,0,0,0);

  // Usa a função robusta para TODAS as datas
  const especiaisComDatas = PROJETOS.especiais.projetos.map(p => ({
    ...p,
    dataLimiteObj: parseDataBRparaDate(p.dataLimite)
  }));

  // Ativos: dataLimite >= hoje (ordem crescente)
  const especiaisAtivos = especiaisComDatas
    .filter(p => p.dataLimiteObj && p.dataLimiteObj >= hojeLimpo)
    .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj);

  // Vencidos: dataLimite < hoje (ordem decrescente)
  const especiaisPassados = especiaisComDatas
    .filter(p => p.dataLimiteObj && p.dataLimiteObj < hojeLimpo)
    .sort((a, b) => b.dataLimiteObj - a.dataLimiteObj);

  // Junta: ativos, depois passados
  const especiaisOrdenados = [...especiaisAtivos, ...especiaisPassados];

  carregarProjetos('especiais', especiaisOrdenados, 'especiais-list', 'especiais.html');
  // ...os outros carregamentos e aviso continuam iguais
});

  // 2. AVISO TOP FIXO — APENAS 15 DIAS ANTES DO FECHAMENTO DOS BOLÕES ESPECIAIS
  // Usa a mesma lista especiaisComDatas para reaproveitar o parse de data
  const hoje = new Date();
  hoje.setHours(0,0,0,0); // garantir comparações no mesmo dia

  // Encontra o próximo especial com data limite no futuro
  const proximo = especiaisComDatas
    .filter(p => p.dataLimiteObj > hoje)
    .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj)[0];

  if (proximo) {
    const diasRestantes = Math.ceil((proximo.dataLimiteObj - hoje) / (1000 * 60 * 60 * 24));
    // Aparece só se faltar 15 dias ou menos, e some se já passou
    if (diasRestantes > 0 && diasRestantes <= 15) {
      const mensagem = `⏳ Faltam ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} para garantir sua cota no Bolão "${proximo.nome}"!<br><span class="aviso-fechamento">Fechamento no dia ${proximo.dataLimite.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3')}!</span>`;
      document.getElementById("mensagemAviso").innerHTML = mensagem;
      document.getElementById("btnParticipar").href = "templates/especiais.html?id=" + proximo.id;
      document.getElementById("avisoTopo").style.display = "flex";
    }
  }
});

// ================================================
// Função permanece igual
function carregarProjetos(tipo, projetos, containerId, templateFile) {
  const container = document.getElementById(containerId);
  projetos.forEach(projeto => {
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
