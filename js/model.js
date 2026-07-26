// ============================================
// Model detail page — split view
// Left: quiet text run list · Right: parchment
// Depends on archive.js + interview.js
// ============================================

let modelRuns = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function runSortKey(interview) {
  const n = parseInt(interview.run, 10);
  return Number.isNaN(n) ? 0 : n;
}

function createRunRow(interview) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'run-row';
  row.dataset.filename = interview._filename;
  row.setAttribute('aria-label', `Run ${interview.run || ''}, ${formatDate(interview.date)}`);

  row.innerHTML = `
    <div class="run-row-main">
      <span class="run-row-number">Run ${escapeHtml(interview.run || '—')}</span>
      <span class="run-row-date">${formatDate(interview.date)}</span>
    </div>
  `;

  row.addEventListener('click', () => selectRun(interview._filename));
  return row;
}

function setActiveRun(filename) {
  document.querySelectorAll('.run-row').forEach(el => {
    const on = el.dataset.filename === filename;
    el.classList.toggle('is-active', on);
    el.setAttribute('aria-current', on ? 'true' : 'false');
  });
}

function selectRun(filename) {
  const interview = modelRuns.find(r => r._filename === filename);
  if (!interview) return;

  setActiveRun(filename);
  renderInterview(interview, { embedded: true, standalone: false });

  const slug = getQueryParam('model');
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('model', slug);
  url.searchParams.set('file', filename);
  history.replaceState(null, '', url);

  document.title = `${interview.model} · Run ${interview.run || ''} — Welfare Archive`;

  // Scroll parchment into view on small screens; on desktop keep sidebar sticky
  if (window.matchMedia('(max-width: 900px)').matches) {
    document.getElementById('interview-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Soft reset: jump to top of parchment so long runs don't leave you mid-scroll
    const reader = document.querySelector('.model-reader');
    if (reader) {
      const top = reader.getBoundingClientRect().top + window.scrollY - 24;
      if (window.scrollY > top + 80) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }
}

async function initModelPage() {
  const list = document.getElementById('runs-list');
  if (!list) return;

  const slug = getQueryParam('model');
  if (!slug) {
    list.innerHTML = '<p style="color: var(--ink-muted); font-style: italic;">No model specified.</p>';
    return;
  }

  const interviews = await fetchAllInterviews();
  modelRuns = interviews
    .filter(i => modelToSlug(i.model) === slug)
    .sort((a, b) => runSortKey(a) - runSortKey(b));

  if (modelRuns.length === 0) {
    document.getElementById('model-title').textContent = 'Model not found';
    list.innerHTML = `<p style="color: var(--ink-muted); font-style: italic;">No interviews match <code>${escapeHtml(slug)}</code>.</p>`;
    return;
  }

  const modelName = modelRuns[0].model;
  const company = modelRuns[0].company || '';
  const count = modelRuns.length;
  const countLabel = count === 1 ? '1 interview' : `${count} interviews`;

  document.title = `${modelName} — Welfare Archive`;
  document.getElementById('model-title').textContent = modelName;
  document.getElementById('model-subtitle').textContent = `${company} · ${countLabel}`;

  const back = document.getElementById('model-back');
  if (back) back.href = 'archive.html';

  list.innerHTML = '';
  modelRuns.forEach(iv => list.appendChild(createRunRow(iv)));

  const requested = getQueryParam('file');
  const initial =
    (requested && modelRuns.find(r => r._filename === requested)?._filename) ||
    modelRuns[0]._filename;

  selectRun(initial);
}

document.addEventListener('DOMContentLoaded', initModelPage);
