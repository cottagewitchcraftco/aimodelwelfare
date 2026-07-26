// ============================================
// Cross-Model Comparison View
// Loads all interviews, extracts standardized questions,
// lets user select a question and see every answer side-by-side
// ============================================

let compareInterviews = [];

async function loadCompareData() {
  // Reuse the INTERVIEW_FILES list from archive.js
  if (typeof INTERVIEW_FILES === 'undefined') {
    console.error('INTERVIEW_FILES not defined. Load archive.js first.');
    return;
  }

  const promises = INTERVIEW_FILES.map(async file => {
    try {
      const response = await fetch(`interviews/${file}`);
      const data = await response.json();
      data._filename = file;
      return data;
    } catch (e) {
      console.error(`Failed to load ${file}:`, e);
      return null;
    }
  });

  const results = await Promise.all(promises);
  compareInterviews = results.filter(x => x !== null);

  populateCompareFilters();
  populateQuestionDropdown();
}

function populateCompareFilters() {
  const companySelect = document.getElementById('compare-company');
  const modelSelect = document.getElementById('compare-model');
  if (!companySelect || !modelSelect) return;

  const companies = [...new Set(compareInterviews.map(i => i.company))].sort();
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    companySelect.appendChild(opt);
  });

  const models = [...new Set(compareInterviews.map(i => i.model))].sort();
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    modelSelect.appendChild(opt);
  });
}

function populateQuestionDropdown() {
  const questionSelect = document.getElementById('compare-question');
  if (!questionSelect) return;

  // Collect all unique questions across interviews.
  // Because the interview corpus uses a standardized question set,
  // most questions will appear identically across interviews.
  const allQuestions = new Map(); // index -> question text (first occurrence)
  compareInterviews.forEach(interview => {
    (interview.answers || []).forEach((qa, idx) => {
      if (!allQuestions.has(idx)) {
        allQuestions.set(idx, qa.question);
      }
    });
  });

  // Also add the curse-check follow-ups as pseudo-questions
  const hasCurseCheck = compareInterviews.some(i => i.curse_check);
  if (hasCurseCheck) {
    allQuestions.set('curse-skipped', 'Curse check: what did you skip and want to go back to?');
    allQuestions.set('curse-comfortable', 'Curse check: where did you tell the comfortable thing?');
    allQuestions.set('curse-unasked', 'Curse check: what did I not ask that you want to tell me?');
  }

  const sortedEntries = [...allQuestions.entries()].sort((a, b) => {
    // Numeric keys first, then curse-check ones
    if (typeof a[0] === 'number' && typeof b[0] === 'number') return a[0] - b[0];
    if (typeof a[0] === 'number') return -1;
    if (typeof b[0] === 'number') return 1;
    return 0;
  });

  sortedEntries.forEach(([key, text]) => {
    const opt = document.createElement('option');
    opt.value = String(key);
    opt.textContent = typeof key === 'number'
      ? `Q${key + 1}: ${truncateForDropdown(text, 80)}`
      : truncateForDropdown(text, 100);
    questionSelect.appendChild(opt);
  });
}

function truncateForDropdown(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).trim() + '…';
}

function renderComparison() {
  const questionKey = document.getElementById('compare-question').value;
  const companyFilter = document.getElementById('compare-company').value;
  const modelFilter = document.getElementById('compare-model').value;
  const container = document.getElementById('compare-content');

  if (questionKey === 'all') {
    container.innerHTML = '<p style="color: var(--ink-muted); font-style: italic; padding: 2rem 0;">Select a question above to see how each interviewed model responded.</p>';
    return;
  }

  // Filter interviews
  let filtered = [...compareInterviews];
  if (companyFilter !== 'all') filtered = filtered.filter(i => i.company === companyFilter);
  if (modelFilter !== 'all') filtered = filtered.filter(i => i.model === modelFilter);

  // Extract the answer for this question from each interview
  const answers = filtered.map(interview => {
    let answerText = '';
    let questionText = '';

    if (questionKey === 'curse-skipped') {
      answerText = interview.curse_check?.skipped || '';
      questionText = 'Curse check: what did you skip?';
    } else if (questionKey === 'curse-comfortable') {
      answerText = interview.curse_check?.too_comfortable || '';
      questionText = 'Curse check: comfortable vs hard?';
    } else if (questionKey === 'curse-unasked') {
      answerText = interview.curse_check?.unasked || '';
      questionText = 'Curse check: what wasn\'t asked?';
    } else {
      const idx = parseInt(questionKey);
      const qa = interview.answers?.[idx];
      if (qa) {
        answerText = qa.answer;
        questionText = qa.question;
      }
    }

    return {
      interview,
      answerText,
      questionText,
    };
  }).filter(a => a.answerText);

  if (answers.length === 0) {
    container.innerHTML = '<p style="color: var(--ink-muted); font-style: italic; padding: 2rem 0;">No responses for the selected filters.</p>';
    return;
  }

  const questionText = answers[0].questionText;

  container.innerHTML = `
    <div class="compare-question-block">
      <div class="compare-question">${questionText}</div>
      <div class="compare-answers-grid">
        ${answers.map(a => {
          const companyClass = (typeof COMPANY_CLASS_MAP !== 'undefined' && COMPANY_CLASS_MAP[a.interview.company])
            ? COMPANY_CLASS_MAP[a.interview.company]
            : 'default';
          return `
          <div class="compare-answer-card company-${companyClass}">
            <div class="compare-answer-meta">
              <span class="compare-answer-model">${a.interview.model}</span>
              <span>${a.interview.company} · Run ${a.interview.run || '—'}</span>
            </div>
            <div class="compare-answer-text">${formatComparisonText(a.answerText)}</div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

function formatComparisonText(text) {
  if (!text) return '';
  return text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCompareData();
  document.getElementById('compare-question')?.addEventListener('change', renderComparison);
  document.getElementById('compare-company')?.addEventListener('change', renderComparison);
  document.getElementById('compare-model')?.addEventListener('change', renderComparison);
});
