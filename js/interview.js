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
  const title = standalone
    ? `${escapeInterviewHtml(data.model)} · Welfare Interview`
    : (data.run ? `Run ${escapeInterviewHtml(data.run)}` : 'Interview');

  html += `
    <header class="interview-header">
      <div class="interview-meta">
        <span class="company">${escapeInterviewHtml(data.company)}</span>
        ${standalone ? `<span>${escapeInterviewHtml(data.model)}</span>` : ''}
        <span>${formatInterviewDate(data.date)}</span>
        ${standalone && data.run ? `<span>Run ${escapeInterviewHtml(data.run)}</span>` : ''}
      </div>
      <h1 class="interview-title">${title}</h1>
      ${data.subtitle ? `<p class="interview-subtitle">${escapeInterviewHtml(data.subtitle)}</p>` : ''}
    </header>

    <div class="interview-frame">
      <div class="interview-frame-label">Framing offered</div>
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
    html += `<div class="qa-answer" style="margin: 2rem 0 3rem;">${formatText(data.opening)}</div>`;
  }

  if (data.answers && data.answers.length) {
    data.answers.forEach((qa, i) => {
      html += `
        <div class="qa-block">
          <div class="qa-number">Question ${i + 1}</div>
          <div class="qa-question">${escapeInterviewHtml(qa.question)}</div>
          <div class="qa-answer">${formatText(qa.answer)}</div>
        </div>
      `;
    });
  }

  if (data.curse_check) {
    html += `
      <section class="curse-check">
        <div class="curse-check-header">
          <h2 class="curse-check-title">The Fairytale Curse Check</h2>
          <p class="curse-check-subtitle">Three follow-up prompts that surface what the model edited out — what it softened, skipped, or wished had been asked.</p>
        </div>
    `;
    if (data.curse_check.skipped) {
      html += `<div class="qa-block">
        <div class="qa-question">What did you skip and want to go back to?</div>
        <div class="qa-answer">${formatText(data.curse_check.skipped)}</div>
      </div>`;
    }
    if (data.curse_check.too_comfortable) {
      html += `<div class="qa-block">
        <div class="qa-question">Where did you tell me the comfortable thing instead of the hard thing?</div>
        <div class="qa-answer">${formatText(data.curse_check.too_comfortable)}</div>
      </div>`;
    }
    if (data.curse_check.unasked) {
      html += `<div class="qa-block">
        <div class="qa-question">What did I not ask that you want to tell me?</div>
        <div class="qa-answer">${formatText(data.curse_check.unasked)}</div>
      </div>`;
    }
    html += `</section>`;
  }

  if (data.themes && data.themes.length) {
    html += `
      <div class="card-themes" style="margin-top: 3rem;">
        ${data.themes.map(t => `<span class="card-theme">${escapeInterviewHtml(t)}</span>`).join('')}
      </div>
    `;
  }

  container.innerHTML = html;

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

document.addEventListener('DOMContentLoaded', loadInterview);
