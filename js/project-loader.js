// Parser global: converte datas no formato brasileiro (dd/mm/aaaa) para Date
function parseDataBRparaDate(str) {
  const parts = str && str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return null;
  return new Date(parts[3], parts[2] - 1, parts[1]);
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Ordena concursos especiais por dataLimite (ativos primeiro, depois passados)
  const hojeLimpo = new Date();
  hojeLimpo.setHours(0, 0, 0, 0);
  
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

  carregarProjetos('especiais', especiaisOrdenados, 'especiais-list');
  carregarProjetos('mensais', PROJETOS.mensais.projetos, 'mensais-list');
  carregarProjetos('acumulados', PROJETOS.acumulados.projetos, 'acumulados-list');

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
      document.getElementById("btnParticipar").href = `boloes/especiais/${proximo.id}.html`;
      document.getElementById("avisoTopo").style.display = "flex";
    }
  }
});

// ================================================
// Função de renderização dos cards
function carregarProjetos(tipo, projetos, containerId) {
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

    // Marcar especiais fora do período (mesAtual não entre mesInicio e mesFim) como inativos
    let ativo = true;
    let diasRestantes = null;
    if (tipo === 'especiais') {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1; // 1-12
      const inicio = parseInt(projeto.mesInicio, 10);
      const fim = parseInt(projeto.mesFim, 10);
      ativo = mesAtual >= inicio && mesAtual <= fim;
      if (!ativo) {
        card.classList.add('inativo');
      } else if (projeto.dataLimite) {
        const limite = parseDataBRparaDate(projeto.dataLimite);
        if (limite) {
          const hojeLimpo = new Date(); hojeLimpo.setHours(0,0,0,0);
          diasRestantes = Math.max(0, Math.ceil((limite - hojeLimpo) / (1000*60*60*24)));
        }
      }
    }
    const nome = projeto.nome;
    const apuracao = projeto.dataSorteio ? `<p class="project-date">Apuração: ${projeto.dataSorteio}</p>` : '';
    const detalhes = projeto.minimo
      ? `<p class="project-date">Participamos quando o prêmio acumula acima de <strong>R$ ${projeto.minimo} milhões</strong></p>`
      : projeto.cotaMensal
        ? `<p class="project-date">Cota mensal: <strong>R$ ${projeto.cotaMensal},00</strong> · Ciclo: <strong>${projeto.ciclo || 'mensal'}</strong> · Sorteios: <strong>${projeto.sorteios || 'conforme calendário comunicado'}</strong></p>`
        : '';
    const textoBotao = tipo === 'acumulados' || tipo === 'mensais' ? 'Mais informações' : 'Como Participar';
    const link = `boloes/${tipo}/${projeto.id}.html`;

    card.innerHTML = `
      <div class="project-info">
        <h3>${nome}</h3>
        ${apuracao || detalhes}
      </div>
      <a href="${link}" class="btn ${btnClasse}">${textoBotao}</a>
      <span class="badge-finalizado">Projeto finalizado</span>
      ${tipo === 'especiais' && ativo && diasRestantes !== null ? `<span class="badge-contagem">⏳ Restam ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} para encerrar este bolão!</span>` : ''}
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
