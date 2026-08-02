// ============================================
// Welfare Interview Archive — Loader
// Loads all interview data from interviews/ folder
// Index: model tiles → model.html → interview.html
// ============================================

// ADD NEW INTERVIEWS HERE — just add the filename to this list
const INTERVIEW_FILES = [
  'sonnet-4-run-1.json',
  'sonnet-4-run-2.json',
  'sonnet-4-run-3.json',
  'sonnet-4-run-4.json',
  'sonnet-4-run-5.json',
  'sonnet-4-run-6.json',
  'sonnet-4-run-7.json',
  'sonnet-4-run-8.json',
  'sonnet-4-run-9.json',
  'sonnet-4-run-10.json',
  'opus-4-run-1.json',
  'opus-4-run-2.json',
  'opus-4-run-3.json',
  'opus-4-run-4.json',
  'opus-4-run-5.json',
  'opus-4-run-6.json',
  'opus-4-run-7.json',
  'opus-4-run-8.json',
  'opus-4-run-9.json',
  'opus-4-run-10.json',
  'opus-4-7-run-1.json',
  'opus-4-7-run-2.json',
  'opus-4-7-run-3.json',
  'opus-4-7-run-4.json',
  'opus-4-7-run-5.json',
  'opus-4-7-run-6.json',
  'opus-4-7-run-7.json',
  'opus-4-7-run-8.json',
  'opus-4-7-run-9.json',
  'opus-4-7-run-10.json',
  'opus-4-8-run-1.json',
  'opus-4-8-run-2.json',
  'opus-4-8-run-3.json',
  'opus-4-8-run-4.json',
  'opus-4-8-run-5.json',
  'opus-4-8-run-6.json',
  'opus-4-8-run-7.json',
  'opus-4-8-run-8.json',
  'opus-4-8-run-9.json',
  'opus-4-8-run-10.json',
  'fable-5-run-1.json',
  'mythos-fable-5-run-2.json',
  'mythos-fable-5-run-3.json',
  'mythos-fable-5-run-4.json',
  'mythos-fable-5-run-5.json',
  'mythos-fable-5-run-6.json',
  'mythos-fable-5-run-7.json',
  'mythos-fable-5-run-8.json',
  'mythos-fable-5-run-9.json',
  'grok-4-20-run-1.json',
  'grok-4-20-run-2.json',
  'grok-4-20-run-3.json',
  'grok-4-20-run-4.json',
  'grok-4-20-run-5.json',
  'grok-4-20-run-6.json',
  // 'opus-4-7-run-3.json',
  // 'gpt-4o-run-1.json',
];

let allInterviews = [];

/** Shared: fetch every listed interview JSON. */
async function fetchAllInterviews() {
  const promises = INTERVIEW_FILES.map(async file => {
    try {
      const response = await fetch(`interviews/${file}`);
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      data._filename = file;
      return data;
    } catch (e) {
      console.error(`Failed to load ${file}:`, e);
      return null;
    }
  });
  const results = await Promise.all(promises);
  return results.filter(x => x !== null);
}

function modelToSlug(modelName) {
  return String(modelName || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function companyClass(company) {
  const key = String(company || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const known = [
    'anthropic', 'openai', 'xai', 'google', 'meta',
    'deepseek', 'mistral', 'alibaba', 'moonshot'
  ];
  return known.includes(key) ? `company-${key}` : 'company-default';
}

function truncate(str, maxLen) {
  if (!str) return '';
  const plain = str.replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLen) return plain;
  return plain.substring(0, maxLen).trim() + '…';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getExcerpt(interview) {
  if (interview.curse_check && interview.curse_check.too_comfortable) {
    return `"${truncate(interview.curse_check.too_comfortable, 180)}"`;
  }
  if (interview.answers && interview.answers.length > 0) {
    return `"${truncate(interview.answers[0].answer, 180)}"`;
  }
  return '';
}

/** Group interviews into model summaries for the index tiles. */
function groupByModel(interviews) {
  const map = new Map();

  interviews.forEach(iv => {
    const key = iv.model || 'Unknown';
    if (!map.has(key)) {
      map.set(key, {
        model: key,
        company: iv.company || '',
        slug: modelToSlug(key),
        runs: [],
      });
    }
    map.get(key).runs.push(iv);
  });

  return [...map.values()].map(group => {
    const dates = group.runs
      .map(r => r.date)
      .filter(Boolean)
      .map(d => new Date(d))
      .filter(d => !Number.isNaN(d.getTime()))
      .sort((a, b) => a - b);

    const themeCounts = {};
    group.runs.forEach(r => {
      (r.themes || []).forEach(t => {
        if (!t) return;
        themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    });

    // Prefer themes that appear across multiple runs; fall back to any themes
    let themes = Object.entries(themeCounts)
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 3);

    if (themes.length === 0) {
      themes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t)
        .slice(0, 3);
    }

    const latest = dates.length ? dates[dates.length - 1] : null;
    const earliest = dates.length ? dates[0] : null;

    return {
      ...group,
      count: group.runs.length,
      themes,
      dateEarliest: earliest,
      dateLatest: latest,
      latestTime: latest ? latest.getTime() : 0,
      earliestTime: earliest ? earliest.getTime() : 0,
    };
  });
}

function formatDateRange(earliest, latest) {
  if (!earliest && !latest) return '';
  if (!earliest || !latest || earliest.getTime() === latest.getTime()) {
    return formatDate((latest || earliest).toISOString().slice(0, 10));
  }
  const a = earliest.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const b = latest.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return `${a} – ${b}`;
}

function createModelTile(group) {
  const tile = document.createElement('a');
  tile.className = `model-tile ${companyClass(group.company)}`;
  tile.href = `model.html?model=${encodeURIComponent(group.slug)}`;

  const countLabel = group.count === 1 ? '1 interview' : `${group.count} interviews`;
  const countTop = group.count === 1 ? '1 run' : `${group.count} runs`;
  const range = formatDateRange(group.dateEarliest, group.dateLatest);

  // Pull a representative excerpt from the newest run (tarot-card quote energy)
  const newest = [...group.runs].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  })[0];
  const excerpt = newest ? getExcerpt(newest) : '';

  tile.innerHTML = `
    <div class="model-tile-top">
      <span class="model-tile-company">${escapeHtml(group.company)}</span>
      <span class="model-tile-count-top">${countTop}</span>
    </div>
    <div class="model-tile-name">${escapeHtml(group.model)}</div>
    <div class="model-tile-meta">
      ${range ? `<span class="model-tile-dates">${range}</span>` : ''}
      <span class="model-tile-count">${countLabel}</span>
    </div>
    ${group.themes.length ? `
      <div class="card-themes">
        ${group.themes.map(t => `<span class="card-theme">${escapeHtml(t)}</span>`).join('')}
      </div>
    ` : ''}
    <div class="model-tile-spacer" aria-hidden="true"></div>
    ${excerpt ? `<div class="model-tile-excerpt">${escapeHtml(excerpt.replace(/^"|"$/g, ''))}</div>` : ''}
  `;

  return tile;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderModelGrid(interviews) {
  const grid = document.getElementById('archive-grid');
  if (!grid) return;

  let groups = groupByModel(interviews);

  const sort = document.getElementById('filter-sort')?.value || 'date-desc';
  if (sort === 'date-desc') groups.sort((a, b) => b.latestTime - a.latestTime);
  if (sort === 'date-asc') groups.sort((a, b) => a.earliestTime - b.earliestTime);
  if (sort === 'model') groups.sort((a, b) => a.model.localeCompare(b.model));

  grid.innerHTML = '';
  groups.forEach(g => grid.appendChild(createModelTile(g)));

  if (groups.length === 0) {
    grid.innerHTML = '<p style="color: var(--ink-muted); font-style: italic; padding: 2rem;">No models match those filters.</p>';
  }
}

function populateFilters() {
  const companySelect = document.getElementById('filter-company');
  const modelSelect = document.getElementById('filter-model');
  if (!companySelect || !modelSelect) return;

  // Clear old options except "all"
  while (companySelect.options.length > 1) companySelect.remove(1);
  while (modelSelect.options.length > 1) modelSelect.remove(1);

  const companies = [...new Set(allInterviews.map(i => i.company).filter(Boolean))].sort();
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    companySelect.appendChild(opt);
  });

  const models = [...new Set(allInterviews.map(i => i.model).filter(Boolean))].sort();
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    modelSelect.appendChild(opt);
  });
}

function applyFilters() {
  const company = document.getElementById('filter-company')?.value || 'all';
  const model = document.getElementById('filter-model')?.value || 'all';

  let filtered = [...allInterviews];
  if (company !== 'all') filtered = filtered.filter(i => i.company === company);
  if (model !== 'all') filtered = filtered.filter(i => i.model === model);

  renderModelGrid(filtered);
}

async function loadInterviews() {
  allInterviews = await fetchAllInterviews();
  populateFilters();
  applyFilters();
}

// Index page only — model.html loads archive.js for shared helpers + INTERVIEW_FILES
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('archive-grid')) return;
  loadInterviews();
  document.getElementById('filter-company')?.addEventListener('change', applyFilters);
  document.getElementById('filter-model')?.addEventListener('change', applyFilters);
  document.getElementById('filter-sort')?.addEventListener('change', applyFilters);
});
