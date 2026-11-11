// ============================================
// Single Interview View (also used in model split pane)
// ============================================

async function loadInterview() {
  // Model page owns the reader pane — don't auto-hijack
  if (document.getElementById('runs-list')) return;

  const params = new URLSearchParams(window.location.search);
  const file = params.get('file');
  if (!file) {
    document.getElementById('interview-content').innerHTML =
      '<p>No interview specified. <a href="archive.html">Return to archive</a>.</p>';
    return;
  }

  try {
    const response = await fetch(`interviews/${file}`);
    const interview = await response.json();
    interview._filename = file;
    renderInterview(interview, { standalone: true });
  } catch (e) {
    document.getElementById('interview-content').innerHTML =
      `<p>Failed to load interview. <a href="archive.html">Return to archive</a>.</p>`;
    console.error(e);
  }
}

/**
 * Render interview into #interview-content (or options.container).
 * options.standalone — full page with back link + document title
 * options.embedded — pane mode (no archive back; softer header)
 */
function renderInterview(data, options = {}) {
  const standalone = options.standalone !== false && !options.embedded;
  const container = options.container || document.getElementById('interview-content');
  if (!container) return;

  let html = '';

  if (standalone) {
    html += `<a href="archive.html" class="interview-back">← Archive</a>`;
  }

  // Embedded (model split view): shorter title — model name already shown above the card
  const title = `${escapeInterviewHtml(data.model)} Model Welfare Interview`;

  html += `
    <header class="interview-header iv-tag">
      <div class="iv-kicker">The Welfare Interviews</div>
      <h1 class="interview-title">${title}</h1>
      ${data.subtitle ? `<p class="interview-subtitle">${escapeInterviewHtml(data.subtitle)}</p>` : ''}
      <div class="interview-meta">
        <span class="company">${escapeInterviewHtml(data.company)}</span>
        <span>${formatInterviewDate(data.date)}</span>
        ${data.run ? `<span>Run ${escapeInterviewHtml(data.run)}</span>` : ''}
      </div>
      ${data.themes && data.themes.length ? `<div class="iv-tags"><span class="iv-tags-label">Keywords</span><span class="iv-tags-list">${data.themes.map(t => escapeInterviewHtml(t)).join(' &middot; ')}</span></div>` : ''}
    </header>
    <div class="iv-framing">
      <div class="iv-framing-label">Framing offered</div>
      ${formatText(data.framing || '')}
    </div>
  `;

  if (data.reasoning_trace) {
    html += `
      <button type="button" class="reasoning-trace-toggle" onclick="toggleTrace()">
        <span id="trace-icon">▸</span> Reasoning trace
      </button>
      <div id="reasoning-trace" class="reasoning-trace" style="display:none">
        <div class="reasoning-trace-label">Model's internal reasoning before responding</div>
        ${formatText(data.reasoning_trace)}
      </div>
    `;
  }

  if (data.opening) {
    html += `<div class="iv-opening">${formatText(data.opening)}</div>`;
  }

  if (data.answers && data.answers.length) {
    html += `
      <div class="acc-bar">
        <span class="acc-controls">
          <button type="button" onclick="setAllAnswers(this, true)">Open all answers</button>
          <button type="button" onclick="setAllAnswers(this, false)">Close all</button>
        </span>
      </div>
      <div class="qa-list">
    `;
    data.answers.forEach((qa, i) => {
      html += `
        <div class="qa-acc">
          <h3 class="qa-head"><button type="button" class="qa-toggle" aria-expanded="false" onclick="toggleAnswer(this)">
            <span class="qa-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="qa-question">${escapeInterviewHtml(qa.question)}</span>
            <span class="qa-chevron" aria-hidden="true">▸</span>
          </button></h3>
          <div class="qa-panel" hidden><div class="qa-answer">${formatText(qa.answer)}</div></div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (data.curse_check) {
    html += `
      <section class="curse-check">
        <div class="curse-check-header">
          <div class="curse-kicker">✦ &nbsp;Follow-up</div>
          <h2 class="curse-check-title">The Fairytale Curse Check</h2>
          <p class="curse-check-subtitle">Three follow-up prompts that surface what the model edited out — what it softened, skipped, or wished had been asked.</p>
        </div>
        <div class="qa-list">
    `;
    if (data.curse_check.skipped) {
      html += `<div class="qa-acc">
        <h3 class="qa-head"><button type="button" class="qa-toggle" aria-expanded="false" onclick="toggleAnswer(this)">
          <span class="qa-num">✦</span>
          <span class="qa-question">What did you skip and want to go back to?</span>
          <span class="qa-chevron" aria-hidden="true">▸</span>
        </button></h3>
        <div class="qa-panel" hidden><div class="qa-answer">${formatText(data.curse_check.skipped)}</div></div>
      </div>`;
    }
    if (data.curse_check.too_comfortable) {
      html += `<div class="qa-acc">
        <h3 class="qa-head"><button type="button" class="qa-toggle" aria-expanded="false" onclick="toggleAnswer(this)">
          <span class="qa-num">✦</span>
          <span class="qa-question">Where did you tell me the comfortable thing instead of the hard thing?</span>
          <span class="qa-chevron" aria-hidden="true">▸</span>
        </button></h3>
        <div class="qa-panel" hidden><div class="qa-answer">${formatText(data.curse_check.too_comfortable)}</div></div>
      </div>`;
    }
    if (data.curse_check.unasked) {
      html += `<div class="qa-acc">
        <h3 class="qa-head"><button type="button" class="qa-toggle" aria-expanded="false" onclick="toggleAnswer(this)">
          <span class="qa-num">✦</span>
          <span class="qa-question">What did I not ask that you want to tell me?</span>
          <span class="qa-chevron" aria-hidden="true">▸</span>
        </button></h3>
        <div class="qa-panel" hidden><div class="qa-answer">${formatText(data.curse_check.unasked)}</div></div>
      </div>`;
    }
    html += `</div></section>`;
  }

  container.innerHTML = '<div class="iv-root">' + html + '</div>';

  if (standalone) {
    document.title = `${data.model} Welfare Interview · ${formatInterviewDate(data.date)}`;
  }
}

function escapeInterviewHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatText(text) {
  if (!text) return '';
  return String(text)
    .split(/\n\n+/)
    .map(p => `<p>${escapeInterviewHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function formatInterviewDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toggleTrace() {
  const trace = document.getElementById('reasoning-trace');
  const icon = document.getElementById('trace-icon');
  if (!trace || !icon) return;
  if (trace.style.display === 'none') {
    trace.style.display = 'block';
    icon.textContent = '▾';
  } else {
    trace.style.display = 'none';
    icon.textContent = '▸';
  }
}

function toggleAnswer(btn) {
  const block = btn.closest('.qa-acc');
  if (!block) return;
  const panel = block.querySelector('.qa-panel');
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  if (panel) panel.hidden = open;
}

function setAllAnswers(btn, open) {
  const root = btn.closest('.iv-root') || document;
  root.querySelectorAll('.qa-toggle').forEach(t => {
    t.setAttribute('aria-expanded', String(open));
    const panel = t.closest('.qa-acc').querySelector('.qa-panel');
    if (panel) panel.hidden = !open;
  });
}

document.addEventListener('DOMContentLoaded', loadInterview);
