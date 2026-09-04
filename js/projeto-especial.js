// projeto-especial.js
// Renderiza as seções "Parcelas mensais" e "Entrada durante o projeto"
// nas páginas de projetos especiais (boloes/especiais/*.html),
// usando js/config.js como fonte única de dados.

(function () {
  'use strict';

  var NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  function obterIdProjeto() {
    var m = window.location.pathname.match(/boloes\/especiais\/([^/]+)\.html$/);
    return m ? m[1] : null;
  }

  function obterMesSaoPaulo() {
    var partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      month: 'numeric'
    }).formatToParts(new Date());
    var mes = partes.find(function (parte) { return parte.type === 'month'; });
    return mes ? Number(mes.value) : new Date().getMonth() + 1;
  }

  function calcularValorEntrada(projeto, mes) {
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var anteriores = Math.max(0, mes - mesInicio);
    return (anteriores + 1) * projeto.valorMes + anteriores;
  }

  function tabelaParcelas(projeto) {
    return '<table class="tabela-projeto"><tbody><tr><th>Cota-base</th><td>R$ ' + projeto.cota + ',00</td></tr>' +
      '<tr><th>Plano original</th><td>' + projeto.parcelas + ' × R$ ' + projeto.valorMes + ',00</td></tr></tbody></table>';
  }

  function tabelaEntrada(projeto) {
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    var valorMes = projeto.valorMes;
    var linhas = '';
    for (var mes = mesInicio; mes <= mesFim; mes++) {
      var anteriores = mes - mesInicio;
      var total = calcularValorEntrada(projeto, mes);
      var calculo = anteriores > 0
        ? (anteriores + 1) + ' parcelas de R$ ' + valorMes + ',00 + R$ ' + anteriores + ',00 de ajuste simbólico'
        : 'R$ ' + valorMes + ',00';
      linhas += '<tr><td>' + NOMES_MESES[mes - 1] + '</td><td>' + calculo + '</td><td><strong>R$ ' + total + ',00</strong></td></tr>';
    }
    return '<table class="tabela-projeto"><thead><tr><th>Mês de entrada</th><th>Como é formado</th><th>Valor para entrada</th></tr></thead><tbody>' + linhas + '</tbody></table>';
  }

  function blocoValorAtual(projeto) {
    var mesAtual = obterMesSaoPaulo();
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    if (mesAtual < mesInicio || mesAtual > mesFim) return '';

    var valorAtual = calcularValorEntrada(projeto, mesAtual);
    var mesesRestantes = Math.max(0, mesFim - mesAtual);
    var pixRestantes = mesesRestantes * projeto.valorMes;
    var totalAteFim = valorAtual + pixRestantes;
    var detalheRestante = mesesRestantes > 0
      ? ' Depois da entrada, restam ' + mesesRestantes + ' PIX mensais de R$ ' + projeto.valorMes + ',00, que somam R$ ' + pixRestantes + ',00.'
      : ' Este é o último mês previsto do projeto.';

    return '<div class="card" style="margin: 1rem 0;">' +
      '<p style="margin:0 0 .35rem;"><strong>Quanto custa entrar hoje?</strong></p>' +
      '<p style="margin:0; font-size:1.35rem;"><strong>R$ ' + valorAtual + ',00</strong> para entrada em ' + NOMES_MESES[mesAtual - 1].toLowerCase() + '.</p>' +
      '<p style="margin:.55rem 0 0; font-size:.92rem;">A cota-base do projeto é R$ ' + projeto.cota + ',00. O valor de entrada regulariza a participação até o mês atual.' + detalheRestante + '</p>' +
      '<p style="margin:.55rem 0 0;"><strong>Valor total da simulação até ' + NOMES_MESES[mesFim - 1].toLowerCase() + ': R$ ' + totalAteFim + ',00.</strong></p>' +
      '</div>';
  }

  function alinharConteudoEstatico(projeto) {
    var primeiroItem = document.querySelector('.content-card > ul:first-of-type li:first-child');
    if (primeiroItem) {
      primeiroItem.innerHTML = 'Cota-base do projeto: <strong>R$ ' + projeto.cota + ',00</strong> (' + projeto.parcelas + '× de R$ ' + projeto.valorMes + ',00 no plano original).';
    }

    if (projeto.id === 'mega-virada') {
      var estrategia = document.querySelector('.estrategia-cta.mega p');
      if (estrategia) {
        estrategia.textContent = 'Os jogos são preparados com critérios de organização e variedade, com conferência antes do registro. Esses critérios não mudam a natureza aleatória do sorteio nem garantem premiação.';
      }
    }
  }

  function renderizar(projeto) {
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    var inicio = NOMES_MESES[mesInicio - 1];
    var fim = NOMES_MESES[mesFim - 1];
    var valorMes = projeto.valorMes;

    alinharConteudoEstatico(projeto);

    var containerParcelas = document.getElementById('parcelas-mensais');
    if (containerParcelas) {
      containerParcelas.innerHTML =
        '<h2>PARCELAS MENSAIS</h2>' +
        blocoValorAtual(projeto) +
        tabelaParcelas(projeto) +
        '<p>A <strong>cota-base</strong> é a referência original do projeto. Quem entra no primeiro mês segue o plano original, pagando R$ ' + valorMes + ',00 todo dia <strong>' + projeto.diaPix + '</strong>, de <strong>' + inicio + '</strong> a <strong>' + fim + '</strong>.</p>' +
        '<p>Quem entra depois regulariza as parcelas correspondentes ao período já transcorrido e, a partir do mês seguinte, continua fazendo os PIX mensais previstos até o fim do projeto.</p>';
    }

    var containerEntrada = document.getElementById('entrada-apos-inicio');
    if (containerEntrada) {
      containerEntrada.innerHTML =
        '<h2>ENTRADA DURANTE O PROJETO</h2>' +
        '<p><strong>Entrou depois do início?</strong> O valor de entrada considera as parcelas correspondentes ao período já transcorrido e um <strong>ajuste simbólico de R$ 1,00 por mês anterior à entrada</strong>. A cota-base não muda.</p>' +
        '<p>Esse ajuste é uma regra interna simples e uniforme. <strong>Não representa rendimento real, correção monetária, juros, taxa financeira, tarifa de serviço ou remuneração do organizador.</strong></p>' +
        '<p>O pagamento da entrada regulariza a participação até o mês em que ela é confirmada. Depois disso, os PIX mensais de R$ ' + valorMes + ',00 continuam normalmente até o fim do projeto. Quem preferir entrar mais adiante pode aguardar, enquanto as participações estiverem abertas; aguardar não reserva vaga, valor ou participação.</p>' +
        tabelaEntrada(projeto) +
        '<p style="font-size: 0.9rem;"><em>Consulte a explicação canônica e atualizada no <a href="https://site.boloesdoborges.shop/como-funciona/valor-de-entrada" target="_blank" rel="noopener noreferrer">site principal</a>. A metodologia não altera a natureza aleatória dos sorteios e não representa promessa ou garantia de premiação.</em></p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = obterIdProjeto();
    if (!id || typeof PROJETOS === 'undefined') return;
    var projeto = PROJETOS.especiais.projetos.find(function (p) { return p.id === id; });
    if (projeto) renderizar(projeto);
  });
})();
