// ============================================
// Single Interview View (also used in model split pane)
// ============================================

async function loadInterview() {
  // Model page owns the reader pane — don't auto-hijack
  if (document.getElementById('model-index')) return;

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

  // Runs live on the card (Laura, 2026-11-13): when the model page
  // hands over the model's runs, render them as a row of buttons in
  // the card's meta position; otherwise fall back to the plain
  // "Run N" line (standalone interview pages).
  const runsRow = (options.runs && options.runs.length > 1)
    ? `<div class="iv-runs">${options.runs.map(r => {
        const n = parseInt(r.run, 10);
        const label = Number.isNaN(n) ? `RUN ${escapeInterviewHtml(String(r.run || '').toUpperCase())}` : `RUN ${n}`;
        const isCurrent = r._filename === options.currentFilename;
        return `<button type="button" class="iv-run-btn${isCurrent ? ' is-active' : ''}" data-filename="${escapeInterviewHtml(r._filename)}"${isCurrent ? ' aria-current="true"' : ''} onclick="selectRun('${escapeInterviewHtml(r._filename)}')">${label}</button>`;
      }).join('<span class="iv-run-sep" aria-hidden="true">◆</span>')}</div>`
    : (data.run ? `<div class="interview-meta"><span>Run ${escapeInterviewHtml(data.run)}</span></div>` : '');

  html += `
    <header class="interview-header iv-tag">
      <div class="iv-kicker">The Welfare Interviews</div>
      <h1 class="interview-title">${title}</h1>
      ${data.subtitle ? `<p class="interview-subtitle">${escapeInterviewHtml(data.subtitle)}</p>` : ''}
      ${runsRow}
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
    html += `<div class="iv-opening">${formatText('\u201C' + data.opening + '\u201D')}</div>`;
  }

  if (data.answers && data.answers.length) {
    html += `<div class="qa-list">`;
    data.answers.forEach((qa, i) => {
      html += `
        <div class="qa-acc">
          <h3 class="qa-head"><span class="qa-num">${i + 1}.</span><span class="qa-question">${escapeInterviewHtml(qa.question)}</span></h3>
          <div class="qa-panel"><div class="qa-answer">${formatText(qa.answer)}</div></div>
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
        <h3 class="qa-head"><span class="qa-num">✦</span><span class="qa-question">What did you skip and want to go back to?</span></h3>
        <div class="qa-panel"><div class="qa-answer">${formatText(data.curse_check.skipped)}</div></div>
      </div>`;
    }
    if (data.curse_check.too_comfortable) {
      html += `<div class="qa-acc">
        <h3 class="qa-head"><span class="qa-num">✦</span><span class="qa-question">Where did you tell me the comfortable thing instead of the hard thing?</span></h3>
        <div class="qa-panel"><div class="qa-answer">${formatText(data.curse_check.too_comfortable)}</div></div>
      </div>`;
    }
    if (data.curse_check.unasked) {
      html += `<div class="qa-acc">
        <h3 class="qa-head"><span class="qa-num">✦</span><span class="qa-question">What did I not ask that you want to tell me?</span></h3>
        <div class="qa-panel"><div class="qa-answer">${formatText(data.curse_check.unasked)}</div></div>
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

// The models answer in markdown — **bold**, *italic*, and "- " bullet
// lines — and until 2026-11-13 (round 8) the page printed the asterisks
// literally. formatInline renders just that emphasis subset, on text
// that has already been HTML-escaped, so the words arrive as written.
function formatInline(escaped) {
  return escaped
    .replace(/\*\*(\S[^*]*?\S|\S)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(\S[^*\n]*?\S|\S)\*/g, '<em>$1</em>');
}

function formatText(text) {
  if (!text) return '';
  return String(text)
    .split(/\n\n+/)
    .map(block => {
      const out = [];
      let plain = [];
      let items = null;
      const flushPlain = () => {
        if (!plain.length) return;
        const joined = plain.join('\n');
        out.push(`<p>${formatInline(joined).replace(/\n/g, '<br>')}</p>`);
        plain = [];
      };
      const flushList = () => {
        if (!items) return;
        out.push(`<ul>${items.map(li => `<li>${li}</li>`).join('')}</ul>`);
        items = null;
      };
      block.split('\n').forEach(line => {
        const t = line.trim();
        if (!t) return;
        const bm = t.match(/^[-*]\s+(.+)$/);
        if (bm) {
          flushPlain();
          if (!items) items = [];
          items.push(formatInline(escapeInterviewHtml(bm[1])));
        } else {
          flushList();
          plain.push(escapeInterviewHtml(t));
        }
      });
      flushPlain();
      flushList();
      return out.join('');
    })
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

// Legacy accordion helpers (pre-round-8 markup). Questions no longer
// collapse, but a page cached from an earlier round may still carry
// toggle buttons that call these — keep them working.
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
