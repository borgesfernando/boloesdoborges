const fs = require('fs');

const faqPath = 'faq.json';
const outPath = 'faq.html';

const rotaMap = {
  ROTA_ESPECIAL_MEGA_VIRADA: 'boloes/especiais/mega-virada.html',
  ROTA_ESPECIAL_QUINA_SAO_JOAO: 'boloes/especiais/quina-saojoao.html',
  ROTA_ESPECIAL_LF_INDEPENDENCIA: 'boloes/especiais/lf-independencia.html',
  ROTA_ESPECIAL_DS_PASCOA: 'boloes/especiais/ds-pascoa.html',
  ROTA_MENSAL_LF: 'boloes/mensais/lf-mensal.html',
  ROTA_MENSAL_QUINA: 'boloes/mensais/quina-mensal.html',
  ROTA_ACUMULADA_MEGA: 'boloes/acumulados/mega-acumulada.html',
  ROTA_ACUMULADA_QUINA: 'boloes/acumulados/quina-acumulada.html',
  ROTA_COMUNIDADE: 'https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform',
  ROTA_PRESTACAO_CONTAS: 'prest.html',
  ROTA_IA: 'ia.html',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function resolveLinks(html) {
  return String(html ?? '').replace(/href="(ROTA_[A-Z0-9_]+)"/g, (match, key) => {
    return rotaMap[key] ? `href="${rotaMap[key]}"` : match;
  });
}

const faq = JSON.parse(fs.readFileSync(faqPath, 'utf8'));

const items = faq
  .map((item) => {
    const question = escapeHtml(item.question || '');
    const answer = resolveLinks(item.answerHtml || '');
    return `<details class="faq-item"><summary>${question}</summary><div class="faq-answer">${answer}</div></details>`;
  })
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="Perguntas frequentes sobre o Super Bolão: participação, pagamentos, transparência e regras.">
  <title>Perguntas Frequentes | Super Bolão</title>
  <link rel="canonical" href="https://borgesfernando.github.io/boloesdoborges/faq.html">
  <link rel="stylesheet" href="css/styles.css" />
  <style>
    .faq-item { border: 1px solid #e2e2e2; border-radius: 6px; padding: 0.9rem 1rem; margin-bottom: 0.8rem; background: #fff; }
    .faq-item summary { cursor: pointer; font-weight: 700; color: #005da4; }
    .faq-answer { margin-top: 0.8rem; line-height: 1.6; }
    .faq-answer ul { margin-left: 1.1rem; }
  </style>
</head>
<body>
  <div class="disclaimer-bar">
    <div class="container" style="text-align:center;">
      Projeto independente, sem vínculo com a Caixa Econômica Federal. Sem promessa de ganho. Participação somente para maiores de 18 anos.
    </div>
  </div>
  <nav class="site-nav">
    <div class="container nav-inner">
      <a href="index.html">Início</a>
      <a href="mensais.html">Mensais</a>
      <a href="especiais.html">Especiais</a>
      <a href="acumulados.html">Acumulados</a>
      <a href="faq.html">FAQ</a>
      <a href="prest.html">Transparência</a>
      <a href="institucional/sobre.html">Sobre</a>
      <a href="institucional/termos.html">Termos</a>
      <a href="institucional/privacidade.html">Privacidade</a>
      <a href="institucional/contato.html">Contato</a>
    </div>
  </nav>
  <header>
    <div class="container">
      <h1>Perguntas Frequentes</h1>
      <p>Tire suas dúvidas sobre participação, pagamentos, transparência e regras.</p>
    </div>
  </header>
  <main>
    <div class="container" style="padding: 2rem 0;">
      ${items}
    </div>
  </main>
  <footer>
    <div class="container" style="text-align: center; padding: 2rem 0;">
      <div class="trust-links">
        <a href="institucional/sobre.html">Sobre</a>
        <a href="institucional/termos.html">Termos</a>
        <a href="institucional/privacidade.html">Privacidade</a>
        <a href="institucional/contato.html">Contato</a>
      </div>
      <p style="margin-top: 1.2rem;">© 2026 Super Bolão™ - Todos os direitos reservados</p>
      <p style="margin-top: 0.8rem; font-size: 0.95rem;">
        Projeto independente, sem vínculo com a Caixa Econômica Federal. Sem promessa de ganho. Apenas para maiores de 18 anos.
      </p>
    </div>
  </footer>
</body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`Gerado: ${outPath} (${faq.length} itens)`);
