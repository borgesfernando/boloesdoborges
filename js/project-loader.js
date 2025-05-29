document.addEventListener("DOMContentLoaded", () => {
  // 1. Ordena concursos especiais por dataLimite (ativos primeiro, depois passados)
  const hojeLimpo = new Date();
  hojeLimpo.setHours(0, 0, 0, 0);

  // Função robusta para converter datas do formato brasileiro para Date
  function parseDataBRparaDate(str) {
    // Aceita 1 ou 2 dígitos para dia/mês, 4 dígitos para ano
    const parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!parts) return null;
    return new Date(parts[3], parts[2] - 1, parts[1]);
  }
  
  const especiaisComDatas = PROJETOS.especiais.projetos.map(p => ({
    ...p,
    dataLimiteObj: parseDataBRparaDate(p.dataLimite)
  }));

  // Ativos: dataLimite >= hoje (ordem crescente)
  const especiaisAtivos = especiaisComDatas
    .filter(p => p.dataLimiteObj && p.dataLimiteObj >= hojeLimpo)
    .sort((a, b) => a.dataLimiteObj - b.dataLimiteObj);

  // Passados: dataLimite < hoje (ordem decrescente)
  const especiaisPassados = especiaisComDatas
    .filter(p => p.dataLimiteObj && p.dataLimiteObj < hojeLimpo)
    .sort((a, b) => b.dataLimiteObj - a.dataLimiteObj);

  // Junta: ativos, depois passados
  const especiaisOrdenados = [...especiaisAtivos, ...especiaisPassados];

  carregarProjetos('especiais', especiaisOrdenados, 'especiais-list', 'especiais.html');
  carregarProjetos('mensais', PROJETOS.mensais.projetos, 'mensais-list', 'mensais.html');
  carregarProjetos('acumulados', PROJETOS.acumulados.projetos, 'acumulados-list', 'acumulados.html');

  // 2. AVISO TOP FIXO — APENAS 15 DIAS ANTES DO FECHAMENTO DOS BOLÕES ESPECIAIS
  // Usa a mesma lista especiaisComDatas para reaproveitar o parse de data
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // garantir comparações no mesmo dia

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
// Função de renderização dos cards
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

function gerarCronograma(projeto) {
  const dataLimite = parseDataBRparaDate(projeto.dataLimite); // já existe no project-loader.js
  const dataSorteio = parseDataBRparaDate(projeto.dataSorteio);

  // Helper para adicionar dias
  function addDias(date, dias) {
    const d = new Date(date);
    d.setDate(d.getDate() + dias);
    return d;
  }


  // Função para verificar se a data já passou (apenas para projetos especiais)
function isSorteioPassado(dataSorteio) {
  const [dia, mes, ano] = dataSorteio.split('/').map(Number);
  const dataProjeto = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  return dataProjeto < hoje;
}

  // Helper para formatar dd/mm (dia da semana)
  function formatarDataExtensa(dt) {
    const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + 
           ' (' + diasSemana[dt.getDay()] + ')';
  }

  return [
    {
      titulo: "Último dia para recebimento de cotas e entrada de novos participantes",
      data: formatarDataExtensa(dataLimite),
      icone: "⏳",
      detalhe: `(${projeto.dataLimite})`
    },
    {
      titulo: "Último dia para preenchimento das dezenas da sorte",
      data: formatarDataExtensa(dataLimite),
      icone: "🎯",
      detalhe: `(${projeto.dataLimite})`
    },
    {
      titulo: "Fechamento de contas e preparação dos jogos",
      data: `${formatarDataExtensa(addDias(dataLimite, 1))} a ${formatarDataExtensa(addDias(dataLimite, 5))}`,
      icone: "📊🎲",
      detalhe: `(${projeto.dataLimite}+1 até +5)`
    },
    {
      titulo: "Registro oficial do Bolão",
      data: formatarDataExtensa(addDias(dataLimite, 6)),
      icone: "🧾✅",
      detalhe: `(${projeto.dataLimite}+6)`
    },
    {
      titulo: "Envio da prestação de contas final",
      data: formatarDataExtensa(addDias(dataLimite, 6)),
      icone: "📤💰",
      detalhe: `(${projeto.dataLimite}+6)`
    },
    {
      titulo: "Sorteio oficial",
      data: formatarDataExtensa(dataSorteio),
      icone: "🏆🎫",
      detalhe: `(${projeto.dataSorteio})`
    },
    {
      titulo: "Divulgação dos resultados do Bolão",
      data: formatarDataExtensa(dataSorteio),
      icone: "📣🔍",
      detalhe: `(${projeto.dataSorteio})`
    }
  ];
}

