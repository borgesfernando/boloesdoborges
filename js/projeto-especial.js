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
    var mesInicio = parseInt(projeto.mesInicio, 10);
    var mesFim = parseInt(projeto.mesFim, 10);
    var linhas = '';
    for (var mes = mesInicio; mes <= mesFim; mes++) {
      linhas += '<tr><td>' + NOMES_MESES[mes - 1] + '</td><td>R$ ' + projeto.valorMes + ',00</td></tr>';
    }
    return '<table class="tabela-projeto"><thead><tr><th>Mês</th><th>Parcela</th></tr></thead><tbody>' + linhas + '</tbody></table>';
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
        '<p>Quem participa desde o início paga a parcela fixa de <strong>R$ ' + valorMes + ',00</strong> todo dia <strong>' + projeto.diaPix + '</strong>, de <strong>' + inicio + '</strong> a <strong>' + fim + '</strong> — cota total de <strong>R$ ' + projeto.cota + ',00</strong> (' + projeto.parcelas + ' × R$ ' + valorMes + ',00). <strong>Não há ajuste mensal</strong> para quem entra no primeiro mês.</p>' +
        tabelaParcelas(projeto);
    }

    var containerEntrada = document.getElementById('entrada-apos-inicio');
    if (containerEntrada) {
      containerEntrada.innerHTML =
        '<h2>ENTRADA APÓS O INÍCIO DO ANO</h2>' +
        '<p><strong>Critério padrão de ajuste das parcelas (SB2026):</strong> quem já participa desde o primeiro mês mantém a parcela fixa de R$ ' + valorMes + ',00. Quem entra depois precisa “comprar” também os meses que já passaram, para ficar em dia com a cota: cada mês vencido é cobrado com <strong>+R$ 1,00 de correção</strong> (parcela “corrigida” de R$ ' + corrigida + ',00) e o mês atual com os R$ ' + valorMes + ',00 normais. Por isso o valor da entrada cresce R$ ' + corrigida + ',00 a cada mês que passa.</p>' +
        '<p>Em termos práticos: quanto mais tarde entrar, maior o valor da entrada — por isso compensa começar cedo. O pagamento da entrada no dia <strong>' + projeto.diaPix + '</strong> fecha ao meio-dia.</p>' +
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
