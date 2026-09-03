document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();

  // Header year
  const headerYear = document.getElementById('ano-atual');
  if (headerYear) headerYear.textContent = year;

  // Footer year
  const copyYear = document.getElementById('ano-copyright');
  if (copyYear) copyYear.textContent = year;

  // Title year
  const hasYearInTitle = /\b\d{4}\b/.test(document.title);
  if (hasYearInTitle) {
    document.title = document.title.replace(/\b\d{4}\b/g, String(year));
  }

  // Mantem a capa publica alinhada ao posicionamento editorial do site principal.
  const pageTitle = 'Bolões do Borges | Projetos organizados com transparência';
  const pageDescription = 'Projetos mensais, especiais e estratégicos organizados com regras claras, registros, documentos e prestação de contas do início ao fim.';

  document.title = pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', pageDescription);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', pageTitle);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', pageDescription);

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) twitterDescription.setAttribute('content', pageDescription);

  const heroKicker = document.querySelector('.hero-kicker');
  if (heroKicker) heroKicker.textContent = 'Bolões do Borges';

  const heroTitle = document.querySelector('.hero-text h1');
  if (heroTitle) heroTitle.textContent = 'Bolões organizados para você participar e acompanhar com tranquilidade.';

  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) heroSubtitle.textContent = pageDescription;

  const heroBadges = document.querySelectorAll('.hero-badge');
  const badgeTexts = [
    'Projetos mensais, especiais e estratégicos',
    'Cadastro, confirmação e acompanhamento',
    'Documentos e prestação de contas'
  ];
  heroBadges.forEach((badge, index) => {
    if (badgeTexts[index]) badge.textContent = badgeTexts[index];
  });
});
