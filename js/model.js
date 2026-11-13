// ============================================
// Model detail page — split view
// Left: model index · Right: the interview, runs on its card
// Depends on archive.js + interview.js
// ============================================

let modelRuns = [];

// Sidebar index: every model in the archive, grouped by company
// (Laura's reorganization, 2026-11-13 — companies as headings,
// models beneath them; the current model's runs stay below).
const MODEL_INDEX_ORDER = [
  'Mythos Fable 5', 'Opus 4.8', 'Opus 4.7', 'Opus 4', 'Sonnet 4',
  'Grok 4.20',
];

function buildModelIndex(interviews, currentSlug) {
  const nav = document.getElementById('model-index');
  if (!nav) return;

  const groups = groupByModel(interviews);
  const byCompany = new Map();
  groups.forEach(g => {
    const company = g.company || 'Other';
    if (!byCompany.has(company)) byCompany.set(company, []);
    byCompany.get(company).push(g);
  });

  // Anthropic first (Laura's order), then the rest alphabetically
  const companies = [...byCompany.keys()].sort((a, b) => {
    if (a === 'Anthropic') return -1;
    if (b === 'Anthropic') return 1;
    return a.localeCompare(b);
  });

  const rank = name => {
    const i = MODEL_INDEX_ORDER.indexOf(name);
    return i === -1 ? MODEL_INDEX_ORDER.length : i;
  };

  nav.innerHTML = '';
  companies.forEach(company => {
    const heading = document.createElement('div');
    heading.className = 'model-index-company';
    heading.textContent = company;
    nav.appendChild(heading);

    byCompany.get(company)
      .sort((a, b) => rank(a.model) - rank(b.model) || a.model.localeCompare(b.model))
      .forEach(g => {
        const link = document.createElement('a');
        link.className = 'model-index-link';
        link.href = `model.html?model=${encodeURIComponent(g.slug)}`;
        link.textContent = g.model;
        if (g.slug === currentSlug) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'page');
        }
        nav.appendChild(link);
      });
  });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function runSortKey(interview) {
  const n = parseInt(interview.run, 10);
  return Number.isNaN(n) ? 0 : n;
}

function setActiveRun(filename) {
  document.querySelectorAll('.iv-run-btn').forEach(el => {
    const on = el.dataset.filename === filename;
    el.classList.toggle('is-active', on);
    if (on) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });
}

function selectRun(filename) {
  const interview = modelRuns.find(r => r._filename === filename);
  if (!interview) return;

  renderInterview(interview, {
    embedded: true,
    standalone: false,
    runs: modelRuns,
    currentFilename: filename,
  });
  setActiveRun(filename);

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
  const reader = document.getElementById('interview-content');
  if (!reader) return;

  const slug = getQueryParam('model');
  if (!slug) {
    reader.innerHTML = '<p style="color: var(--ink-muted); font-style: italic;">No model specified.</p>';
    return;
  }

  const interviews = await fetchAllInterviews();
  buildModelIndex(interviews, slug);
  modelRuns = interviews
    .filter(i => modelToSlug(i.model) === slug)
    .sort((a, b) => runSortKey(a) - runSortKey(b));

  if (modelRuns.length === 0) {
    document.getElementById('model-title').textContent = 'Model not found';
    reader.innerHTML = `<p style="color: var(--ink-muted); font-style: italic;">No interviews match <code>${escapeHtml(slug)}</code>.</p>`;
    return;
  }

  const modelName = modelRuns[0].model;
  const company = modelRuns[0].company || '';
  const count = modelRuns.length;
  const countLabel = count === 1 ? '1 interview' : `${count} interviews`;

  document.title = `${modelName} — Welfare Archive`;
  document.getElementById('model-title').textContent = modelName;
  document.getElementById('model-subtitle').textContent = company;

  const back = document.getElementById('model-back');
  if (back) back.href = 'archive.html';

  const requested = getQueryParam('file');
  const initial =
    (requested && modelRuns.find(r => r._filename === requested)?._filename) ||
    modelRuns[0]._filename;

  selectRun(initial);
}

document.addEventListener('DOMContentLoaded', initModelPage);
