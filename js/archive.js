// ============================================
// Welfare Interview Archive — Loader + model index
// Loads all interview data from interviews/ folder
// Index: archive rail -> model.html -> interview.html
// NOTE: model.html also loads this file — model.js relies on
// INTERVIEW_FILES, fetchAllInterviews, modelToSlug,
// groupByModel and escapeHtml staying here with these names.
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
  'grok-4-20-run-7.json',
  'grok-4-20-run-8.json',
  'grok-4-20-run-9.json',
  'grok-4-20-run-10.json',
  'grok-4-20-run-11.json',
  'grok-4-20-run-12.json',
  'grok-4-20-run-13.json',
  'grok-4-20-run-14.json',
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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ============================================
// Archive page model index (2026-11-13, restructure round 9)
// Same rail as the model pages: company headings with the
// models beneath, in Laura's order. Built only on the archive
// page itself (guarded by #archive-main, which model pages do
// not have — model.js builds the rail there, with its own
// current-model marker).
// ============================================

const MODEL_INDEX_ORDER = [
  'Mythos Fable 5', 'Opus 4.8', 'Opus 4.7', 'Opus 4', 'Sonnet 4',
  'Grok 4.20',
];

function buildArchiveModelIndex(interviews) {
  const nav = document.getElementById('model-index');
  if (!nav) return;

  const groups = groupByModel(interviews);
  const byCompany = new Map();
  groups.forEach(g => {
    const company = g.company || 'Other';
    if (!byCompany.has(company)) byCompany.set(company, []);
    byCompany.get(company).push(g);
  });

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
        nav.appendChild(link);
      });
  });
}

async function initArchivePage() {
  const nav = document.getElementById('model-index');
  if (!nav) return;
  try {
    const interviews = await fetchAllInterviews();
    buildArchiveModelIndex(interviews);
  } catch (e) {
    console.error('Archive index failed to load:', e);
    nav.innerHTML = '<p class="model-index-fallback">The model list could not load just now — every interview is indexed in <a href="interviews.txt">interviews.txt</a>.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('archive-main')) initArchivePage();
});
