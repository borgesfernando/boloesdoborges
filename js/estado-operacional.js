(function () {
  const MAX_AGE_MS = 36 * 60 * 60 * 1000;
  function isOpen(record, now = Date.now()) {
    if (!record || record.estado !== 'ABERTA' || record.ativo !== true || !record.atualizadoEm) return false;
    const updated = Date.parse(record.atualizadoEm);
    if (!Number.isFinite(updated) || now - updated > MAX_AGE_MS || updated > now + 5 * 60 * 1000) return false;
    if (record.abreEm && now < Date.parse(record.abreEm)) return false;
    if (record.fechaEm && now >= Date.parse(record.fechaEm)) return false;
    return true;
  }
  async function load() { const res = await fetch('data/estado-operacional.json', { cache: 'no-store' }); const json = await res.json(); if (!res.ok || json.schemaVersion !== 2 || !json.projetos) throw new Error('Estado operacional indisponível'); return json; }
  function render(container, state) { const records = Object.values(state.projetos); container.innerHTML = records.map((p) => `<article class="card"><h3>${p.nome}</h3><p>${p.tipo}</p><p><strong>${isOpen(p) ? 'Adesões abertas' : p.estado === 'FECHADA' ? 'Adesões fechadas' : 'Indisponível'}</strong></p>${p.concurso ? `<p>Concurso: ${p.concurso}</p>` : ''}</article>`).join(''); }
  async function init() { const container = document.getElementById('projetos-operacionais'); if (!container) return; try { render(container, await load()); } catch (_) { container.innerHTML = '<p>Informações operacionais indisponíveis no momento.</p>'; } }
  window.EstadoOperacional = { isOpen, load }; document.addEventListener('DOMContentLoaded', init);
}());

