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
  ROTA_MENSAL_DS: 'boloes/mensais/dupla-sena-mensal.html',
  ROTA_ACUMULADA_MEGA: 'boloes/acumulados/mega-acumulada.html',
  ROTA_ACUMULADA_MILIONARIA: 'boloes/acumulados/milionaria.html',
  ROTA_COMUNIDADE: 'https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform',
  ROTA_PRESTACAO_CONTAS: 'prest.html',
  ROTA_IA: 'ia.html',
  ROTA_ESTRATEGIA_MILIONARIA: 'estrategias/milionaria.html',
  ROTA_ESTRATEGIA_LOTOFACIL: 'estrategias/lotofacil.html',
  ROTA_ESTRATEGIA_QUINA_MENSAL: 'estrategias/quina-mensal.html',
  ROTA_ESTRATEGIA_DS_MENSAL: 'estrategias/dupla-sena-mensal.html',
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
  <link rel="icon" href="https://borgesfernando.github.io/boloesdoborges/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="Perguntas Frequentes | Super Bolão">
  <meta property="og:description" content="Perguntas frequentes sobre o Super Bolão: participação, pagamentos, transparência e regras.">
  <meta property="og:url" content="https://borgesfernando.github.io/boloesdoborges/faq.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Super Bolão">
  <meta property="og:image" content="https://site.boloesdoborges.shop/images/hero-operations.svg.png">
  <meta property="og:image:width" content="1536">
  <meta property="og:image:height" content="1024">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Perguntas Frequentes | Super Bolão">
  <meta name="twitter:description" content="Perguntas frequentes sobre o Super Bolão: participação, pagamentos, transparência e regras.">
  <meta name="twitter:image" content="https://site.boloesdoborges.shop/images/hero-operations.svg.png">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://site.boloesdoborges.shop#organization",
      "name": "Super Bolão",
      "url": "https://site.boloesdoborges.shop",
      "email": "correiodofernando@gmail.com",
      "founder": { "@type": "Person", "@id": "https://site.boloesdoborges.shop#person", "name": "Fernando Borges" },
      "description": "Bolões da Mega-Sena, Lotofácil, Quina e Dupla Sena organizados com transparência, 15 anos de histórico e uso responsável de dados e tecnologia.",
      "logo": { "@type": "ImageObject", "url": "https://site.boloesdoborges.shop/favicon.svg" },
      "contactPoint": [ { "@type": "ContactPoint", "contactType": "customer support", "email": "correiodofernando@gmail.com" } ]
    },
    { "@type": "Person", "@id": "https://site.boloesdoborges.shop#person", "name": "Fernando Borges", "email": "correiodofernando@gmail.com" },
    {
      "@type": "WebSite",
      "@id": "https://borgesfernando.github.io/boloesdoborges#website",
      "url": "https://borgesfernando.github.io/boloesdoborges",
      "name": "Super Bolão",
      "inLanguage": "pt-BR",
      "publisher": { "@id": "https://site.boloesdoborges.shop#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://borgesfernando.github.io/boloesdoborges/faq.html#webpage",
      "url": "https://borgesfernando.github.io/boloesdoborges/faq.html",
      "name": "Perguntas Frequentes | Super Bolão",
      "description": "Perguntas frequentes sobre o Super Bolão: participação, pagamentos, transparência e regras.",
      "inLanguage": "pt-BR",
      "isPartOf": { "@id": "https://borgesfernando.github.io/boloesdoborges#website" },
      "about": { "@id": "https://site.boloesdoborges.shop#organization" },
      "primaryImageOfPage": { "@id": "https://site.boloesdoborges.shop/images/hero-operations.svg.png#primaryimage" }
    },
    { "@type": "ImageObject", "@id": "https://site.boloesdoborges.shop/images/hero-operations.svg.png#primaryimage", "url": "https://site.boloesdoborges.shop/images/hero-operations.svg.png" },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://borgesfernando.github.io/boloesdoborges/" },
        { "@type": "ListItem", "position": 2, "name": "Perguntas Frequentes", "item": "https://borgesfernando.github.io/boloesdoborges/faq.html" }
      ]
    }
  ]
}
  </script>
  <link rel="stylesheet" href="css/styles.css" />
  <style>
    .faq-item { border: 1px solid #e2e2e2; border-radius: 6px; padding: 0.9rem 1rem; margin-bottom: 0.8rem; background: #fff; }
    .faq-item summary { cursor: pointer; font-weight: 700; color: #005da4; }
    .faq-answer { margin-top: 0.8rem; line-height: 1.6; }
    .faq-answer ul { margin-left: 1.1rem; }
    .faq-answer table.tabela-faq { border-collapse: collapse; width: 100%; margin: 0.6rem 0 0.9rem; font-size: 0.95rem; }
    .faq-answer table.tabela-faq th, .faq-answer table.tabela-faq td { border: 1px solid #d9d9d9; padding: 0.45rem 0.6rem; text-align: left; }
    .faq-answer table.tabela-faq th { background: #f2f2f2; color: #005da4; }
    .faq-answer table.tabela-faq tr:nth-child(even) td { background: #fafafa; }
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
      <a href="estrategias.html">Estratégias</a>
      <a href="ia.html">IA</a>
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
        <a href="https://site.boloesdoborges.shop" rel="noopener noreferrer">Participação e cadastro</a>
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
