// projeto-especial.js
// Renderiza as seções "Parcelas mensais" e "Entrada após o início do ano"
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

  function tabelaParcelas(projeto) {
    return '<table class="tabela-projeto"><tbody><tr><th>Parcelas mensais</th><td>' +
      projeto.parcelas + ' × R$ ' + projeto.valorMes + ',00 — R$ ' + projeto.cota + ',00 no total</td></tr></tbody></table>';
  }

  function tabelaEntrada(projeto) {
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    var valorMes = projeto.valorMes;
    var linhas = '';
    for (var mes = mesInicio; mes <= mesFim; mes++) {
      var anteriores = mes - mesInicio;
      var total = anteriores * (valorMes + 1) + valorMes;
      var calculo = anteriores > 0
        ? anteriores + ' × (R$ ' + valorMes + ',00 + R$ 1,00) + R$ ' + valorMes + ',00'
        : 'R$ ' + valorMes + ',00';
      linhas += '<tr><td>' + NOMES_MESES[mes - 1] + '</td><td>' + calculo + '</td><td>R$ ' + total + ',00</td></tr>';
    }
    return '<table class="tabela-projeto"><thead><tr><th>Mês de entrada</th><th>Cálculo</th><th>Valor da entrada</th></tr></thead><tbody>' + linhas + '</tbody></table>';
  }

  function renderizar(projeto) {
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    var inicio = NOMES_MESES[mesInicio - 1];
    var fim = NOMES_MESES[mesFim - 1];
    var valorMes = projeto.valorMes;
    var corrigida = valorMes + 1;

    var containerParcelas = document.getElementById('parcelas-mensais');
    if (containerParcelas) {
      containerParcelas.innerHTML =
        '<h2>PARCELAS MENSAIS</h2>' +
        tabelaParcelas(projeto) +
        '<p>Quem entra no primeiro mês paga sempre a mesma parcela, todo dia <strong>' + projeto.diaPix + '</strong>, de <strong>' + inicio + '</strong> a <strong>' + fim + '</strong>, sem ajuste. Quem entra depois paga de uma vez os meses já vencidos (cada um com R$ 1,00 de correção) mais a parcela do mês atual. <strong>Os pagamentos devem ser feitos somente no dia ' + projeto.diaPix + ' de cada mês</strong>, que é o dia de PIX deste projeto.</p>';
    }

    var containerEntrada = document.getElementById('entrada-apos-inicio');
    if (containerEntrada) {
      containerEntrada.innerHTML =
        '<h2>ENTRADA APÓS O INÍCIO DO ANO</h2>' +
        '<p><strong>Por que existe uma entrada?</strong> Os valores das parcelas ficam guardados em uma <strong>caixinha do Nubank</strong>, rendendo juros atrelados à <strong>Selic</strong> desde o primeiro pagamento. Quem entra depois aproveita o mesmo bolão, mas não contribuiu nesses meses — por isso precisa regularizar os meses já transcorridos.</p>' +
        '<p>Na prática, cada mês vencido é somado com um <strong>pequeno acréscimo simbólico de R$ 1,00</strong> (parcela “corrigida” de R$ ' + corrigida + ',00) e o mês atual entra pelo valor normal (R$ ' + valorMes + ',00). <strong>Isso não é multa nem penalidade</strong> — é uma forma simples de <strong>equalização financeira</strong>, considerando o valor do dinheiro no tempo. Quanto mais tarde entrar, maior o valor da entrada; por isso compensa começar cedo.</p>' +
        '<p>O pagamento da entrada no dia <strong>' + projeto.diaPix + '</strong> fecha ao meio-dia.</p>' +
        tabelaEntrada(projeto) +
        '<p style="font-size: 0.9rem;"><em>Após a entrada, a partir do mês seguinte, o participante volta a pagar apenas a parcela mensal normal de R$ ' + valorMes + ',00.</em></p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = obterIdProjeto();
    if (!id || typeof PROJETOS === 'undefined') return;
    var projeto = PROJETOS.especiais.projetos.find(function (p) { return p.id === id; });
    if (projeto) renderizar(projeto);
  });
})();
