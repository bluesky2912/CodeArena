'use strict';

/* ─── Build review prompt ──────────────────────────── */
function makePrompt(code, lang, roast, hl) {
  return `Review this ${lang} code. Respond ONLY with a single valid JSON object — no markdown, no prose outside the JSON.

\`\`\`${lang}
${code}
\`\`\`

Required JSON shape:

{
  "verdict": "<2-5 word punchy verdict>",
  "summary": "<one sentence overview>",
  "brain_score": <integer 1-10>,
  "cleanliness_score": <integer 1-10>,
  "performance_score": <integer 1-10>,
  "bug_risk_level": "Low|Medium|High|Critical",
  "roast": ${roast ? '"<funny specific one-liner about THIS code>"' : 'null'},
  "suggestions": ["<specific fix 1>","<specific fix 2>","<specific fix 3>","<specific fix 4>"],
  "highlights": ${hl
    ? '{"bad":[<critical line numbers>],"warn":[<warning line numbers>],"good":[<clean line numbers>]}'
    : 'null'}
}

Rules:
- scores must be honest integers 1-10
- suggestions must reference specific things in THIS snippet
- line numbers must be accurate 1-based integers present in the code
- roast must be specific to THIS code's actual patterns, not generic`;
}

/* ─── Run review ───────────────────────────────────── */
async function runReview() {
  const ta   = $('#code-ta');
  const code = ta.value.trim();

  if (!code) {
    ta.style.outline = '1px solid var(--red)';
    ta.focus();
    setTimeout(() => { ta.style.outline = ''; }, 900);
    return;
  }

  if (S.busy) return;
  S.busy = true;

  const btn = $('#review-btn');
  btn.disabled = true;
  $('#btn-icon').textContent = '⏳';
  $('#btn-txt').textContent  = 'Reviewing…';

  const p    = PERSONAS.find(x => x.id === S.persona);
  const lang = $('#lang-sel').value;
  const roast = $('#roast-tog').checked;
  const hl    = $('#hl-tog').checked;

  $('#load-msg').innerHTML = `${p.load[0]} <strong>${p.load[1]}</strong>…`;
  showState('loading');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1200,
        system:     p.sys,
        messages:   [{ role: 'user', content: makePrompt(code, lang, roast, hl) }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
    }

    const api = await res.json();
    const raw = api?.content?.[0]?.text || '';
    if (!raw) throw new Error('Empty API response');

    /* Robust JSON extraction — strip possible markdown fences */
    const clean = raw
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const data = JSON.parse(jsonMatch[0]);

    /* Validate required fields */
    const required = ['brain_score', 'cleanliness_score', 'performance_score', 'bug_risk_level', 'suggestions'];
    for (const k of required) {
      if (data[k] == null) throw new Error(`Missing field: ${k}`);
    }

    renderResults(data);

    const avg = (
      Math.min(10, data.brain_score) +
      Math.min(10, data.cleanliness_score) +
      Math.min(10, data.performance_score)
    ) / 3;
    gainXP(Math.round(50 + avg * 9));
    bumpStreak();

  } catch (err) {
    showState('results');
    $('#st-results').innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Review failed</div>
        <div class="error-body">${esc(err.message)}</div>
      </div>`;
    console.error('[CodeArena]', err);

  } finally {
    S.busy             = false;
    btn.disabled       = false;
    $('#btn-icon').textContent = '⚔️';
    $('#btn-txt').textContent  = 'Enter the Arena';
  }
}
