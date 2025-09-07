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
  } else {
    document.title = `Bolões Especiais - Projetos ${year}`;
  }
});
