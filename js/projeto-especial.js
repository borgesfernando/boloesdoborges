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
      var total = anteriores * (valorMes + 1) + valorMes;
      var calculo = anteriores > 0
        ? anteriores + ' × (R$ ' + valorMes + ',00 + R$ 1,00) + R$ ' + valorMes + ',00'
        : 'R$ ' + valorMes + ',00';
      linhas += '<tr><td>' + NOMES_MESES[mes - 1] + '</td><td>' + calculo + '</td><td><strong>R$ ' + total + ',00</strong></td></tr>';
    }
    return '<table class="tabela-projeto"><thead><tr><th>Mês de entrada</th><th>Cálculo da equalização</th><th>Valor vigente para nova entrada</th></tr></thead><tbody>' + linhas + '</tbody></table>';
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
        '<p>A <strong>cota-base</strong> é o valor econômico original do projeto. Quem entra no primeiro mês segue o plano original, pagando R$ ' + valorMes + ',00 todo dia <strong>' + projeto.diaPix + '</strong>, de <strong>' + inicio + '</strong> a <strong>' + fim + '</strong>, sem ajuste.</p>' +
        '<p>Quem entra depois não começa uma nova cota do zero: assume a mesma cota do projeto e regulariza, de uma vez, os meses já transcorridos, além da parcela do mês atual. A partir do mês seguinte, volta a pagar somente a parcela mensal normal.</p>';
    }

    var containerEntrada = document.getElementById('entrada-apos-inicio');
    if (containerEntrada) {
      containerEntrada.innerHTML =
        '<h2>ENTRADA DURANTE O PROJETO</h2>' +
        '<p><strong>Entrou depois do início?</strong> O valor é atualizado para manter a equivalência entre os participantes. A cota-base não muda; o que muda é o <strong>valor vigente para nova entrada</strong> naquele mês.</p>' +
        '<p>Na prática, cada mês já transcorrido entra com um <strong>acréscimo simbólico de R$ 1,00</strong> (parcela equalizada de R$ ' + corrigida + ',00) e o mês atual entra pelo valor normal (R$ ' + valorMes + ',00). <strong>Isso não é multa, juros por atraso nem penalidade</strong>: quem está entrando agora ainda não era participante nos meses anteriores. O ajuste é uma forma simples de <strong>equalização financeira</strong>, considerando o tempo em que os recursos dos participantes anteriores permaneceram reservados para o projeto.</p>' +
        '<p>Por transparência, a tabela abaixo separa o plano original da cota e o valor necessário para uma nova entrada em cada mês. O pagamento da entrada no dia <strong>' + projeto.diaPix + '</strong> fecha ao meio-dia.</p>' +
        tabelaEntrada(projeto) +
        '<p style="font-size: 0.9rem;"><em>Após a entrada, a partir do mês seguinte, o participante volta a pagar apenas a parcela mensal normal de R$ ' + valorMes + ',00. Consulte também a <a href="../../faq.html">FAQ</a>, que detalha a regra de atualização dos projetos especiais.</em></p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = obterIdProjeto();
    if (!id || typeof PROJETOS === 'undefined') return;
    var projeto = PROJETOS.especiais.projetos.find(function (p) { return p.id === id; });
    if (projeto) renderizar(projeto);
  });
})();