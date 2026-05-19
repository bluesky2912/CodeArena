'use strict';

/* ════════════════════════════════════════════════════
   LINE NUMBERS
   ════════════════════════════════════════════════════ */
function syncLines() {
  const ta   = $('#code-ta');
  const lnEl = $('#line-nums');
  const n    = ta.value.split('\n').length;
  const cur  = lnEl.children.length;
  if (n === cur) return;
  if (n > cur) {
    const frag = document.createDocumentFragment();
    for (let i = cur + 1; i <= n; i++) {
      const s = document.createElement('span');
      s.textContent = i;
      frag.appendChild(s);
    }
    lnEl.appendChild(frag);
  } else {
    while (lnEl.children.length > n) lnEl.removeChild(lnEl.lastChild);
  }
}

/* ════════════════════════════════════════════════════
   PERSONA BUTTONS
   ════════════════════════════════════════════════════ */
function buildPersonas() {
  const grid = $('#persona-grid');
  grid.innerHTML = '';
  PERSONAS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'p-btn' + (p.id === S.persona ? ' active' : '');
    btn.dataset.id = p.id;
    btn.innerHTML  = `<span class="p-icon">${p.icon}</span>
      <div>
        <div class="p-label">${p.label}</div>
        <div class="p-sub">${p.sub}</div>
      </div>`;
    btn.addEventListener('click', () => {
      S.persona = p.id;
      $$('.p-btn').forEach(b => b.classList.toggle('active', b.dataset.id === p.id));
      $('#p-desc').textContent = p.desc;
    });
    grid.appendChild(btn);
  });
  $('#p-desc').textContent = PERSONAS.find(p => p.id === S.persona).desc;
}

/* ════════════════════════════════════════════════════
   STREAK
   ════════════════════════════════════════════════════ */
function buildStreakDots() {
  const el = $('#streak-dots');
  el.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'streak-dot';
    el.appendChild(d);
  }
}

function bumpStreak() {
  S.reviews++;
  $$('.streak-dot').forEach((d, i) => d.classList.toggle('lit', i < S.reviews));
  $('#streak-label').textContent = `${S.reviews} review${S.reviews === 1 ? '' : 's'} today`;
  const cnt = $('#streak-cnt');
  cnt.textContent    = S.reviews;
  cnt.style.display  = '';
}

/* ════════════════════════════════════════════════════
   XP + RANK
   ════════════════════════════════════════════════════ */
function gainXP(amt) {
  const prev = getRank(S.xp);
  S.xp += amt;
  const cur  = getRank(S.xp);

  $('#rank-emoji').textContent = cur.emoji;
  $('#rank-name').textContent  = cur.name;
  $('#rank-name').style.color  = cur.color;
  $('#rank-xp').textContent    = S.xp + ' XP';

  const pct = Math.min(100, ((S.xp - cur.min) / (cur.max - cur.min)) * 100);
  $('#xp-bar').style.width = pct.toFixed(1) + '%';

  showXPToast('+' + amt + ' XP');
  if (prev.name !== cur.name) showRankToast(cur);
}

function showXPToast(msg) {
  const el = document.createElement('div');
  el.className   = 'xp-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 1800);
}

function showRankToast(rank) {
  const el = document.createElement('div');
  el.className = 'rank-toast';
  el.innerHTML = `
    <div class="rank-toast-title">${rank.emoji} Rank up! You're now a ${rank.name}</div>
    <div class="rank-toast-sub">Keep reviewing to level up</div>`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 3500);
}

/* ════════════════════════════════════════════════════
   RENDER RESULTS
   ════════════════════════════════════════════════════ */
function renderResults(data) {
  const showRoast = $('#roast-tog').checked;
  const showHL    = $('#hl-tog').checked;

  const bs = Math.min(10, Math.max(0, data.brain_score       || 0));
  const cs = Math.min(10, Math.max(0, data.cleanliness_score || 0));
  const ps = Math.min(10, Math.max(0, data.performance_score || 0));
  const overall = (bs + cs + ps) / 3;
  const oStr    = overall.toFixed(1);
  const oColor  = scoreColor(overall);
  const circ    = 2 * Math.PI * 36;
  const dash    = ((overall / 10) * circ).toFixed(2);
  const riskKey = (data.bug_risk_level || 'low').toLowerCase();
  const risk    = RISK[riskKey] || RISK.low;
  const riskText = data.bug_risk_level || 'Low';

  const out = $('#st-results');
  out.innerHTML = '';

  /* ── Grade ring + verdict ── */
  const hdr = document.createElement('div');
  hdr.className = 'res-hdr';
  hdr.innerHTML = `
    <div class="grade-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="6"/>
        <circle class="grade-arc" cx="44" cy="44" r="36" fill="none" stroke="${oColor}" stroke-width="6"
          stroke-dasharray="0 ${circ.toFixed(2)}" stroke-linecap="round"/>
      </svg>
      <div class="grade-lbl">
        <span class="grade-val" style="color:${oColor}">${oStr}</span>
        <span class="grade-den">/ 10</span>
      </div>
    </div>
    <div class="res-meta">
      <div class="res-verdict">${esc(data.verdict || 'Review Complete')}</div>
      <div class="res-summary">${esc(data.summary || '')}</div>
    </div>`;
  out.appendChild(hdr);

  /* Animate arc after paint */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const arc = out.querySelector('.grade-arc');
    if (arc) arc.setAttribute('stroke-dasharray', `${dash} ${circ.toFixed(2)}`);
  }));

  /* ── Score cards ── */
  const grid = document.createElement('div');
  grid.className = 'scores-grid';

  const cardDefs = [
    { label: '🧠 Brain',       val: bs,   isScore: true  },
    { label: '🧹 Clean',       val: cs,   isScore: true  },
    { label: '⚡ Performance', val: ps,   isScore: true  },
    { label: '🔥 Bug Risk',    val: null, isScore: false },
  ];

  cardDefs.forEach((def, i) => {
    const card = document.createElement('div');
    card.className = 'score-card';

    if (def.isScore) {
      const col = scoreColor(def.val);
      card.innerHTML = `
        <div class="sc-lbl">${def.label}</div>
        <div class="sc-val" style="color:${col}">${def.val}<span style="font-size:13px;color:var(--t2)">/10</span></div>
        <div class="sc-track"><div class="sc-fill" data-pct="${(def.val / 10 * 100).toFixed(1)}" style="background:${col}"></div></div>`;
    } else {
      card.innerHTML = `
        <div class="sc-lbl">${def.label}</div>
        <div class="sc-val" style="font-size:14px;padding-top:4px">
          <span class="risk-badge" style="color:${risk.color};background:${risk.bg}">${esc(riskText)}</span>
        </div>
        <div class="sc-track"><div class="sc-fill" data-pct="${risk.pct}" style="background:${risk.color}"></div></div>`;
    }
    grid.appendChild(card);

    /* Stagger in */
    setTimeout(() => {
      card.classList.add('vis');
      const fill = card.querySelector('.sc-fill');
      if (fill) requestAnimationFrame(() => { fill.style.width = fill.dataset.pct + '%'; });
    }, i * 80);
  });

  out.appendChild(grid);

  /* ── Roast ── */
  if (showRoast && data.roast) {
    const roast = document.createElement('div');
    roast.className = 'roast-card';
    roast.innerHTML = `
      <div class="roast-hdr">🔥 Roast</div>
      <div class="roast-body">"${esc(data.roast)}"</div>`;
    out.appendChild(roast);
    setTimeout(() => roast.classList.add('vis'), 320);
  }

  /* ── Tabs ── */
  const hasHL = showHL && data.highlights &&
    ((data.highlights.bad  || []).length +
     (data.highlights.warn || []).length +
     (data.highlights.good || []).length) > 0;

  const tabIds   = ['suggestions', ...(hasHL ? ['highlights'] : [])];
  const tabsBar  = document.createElement('div');
  tabsBar.className = 'tabs-bar';
  const panelMap = {};

  tabIds.forEach((id, i) => {
    const label = id === 'suggestions' ? '🛠 Suggestions' : '🎨 Highlights';
    const btn   = document.createElement('button');
    btn.className   = 'tab-btn' + (i === 0 ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      $$('.tab-btn', tabsBar).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(panelMap).forEach(p => p.classList.remove('active'));
      panelMap[id].classList.add('active');
    });
    tabsBar.appendChild(btn);
  });
  out.appendChild(tabsBar);

  /* ── Suggestions panel ── */
  const sugPanel = document.createElement('div');
  sugPanel.className = 'tab-panel active';
  const sugList  = document.createElement('div');
  sugList.className  = 'sug-list';
  (data.suggestions || []).forEach((txt, i) => {
    const item = document.createElement('div');
    item.className = 'sug-item';
    item.innerHTML = `<div class="sug-idx">${i + 1}</div><div class="sug-txt">${esc(txt)}</div>`;
    sugList.appendChild(item);
    setTimeout(() => item.classList.add('vis'), 360 + i * 70);
  });
  sugPanel.appendChild(sugList);
  out.appendChild(sugPanel);
  panelMap.suggestions = sugPanel;

  /* ── Highlights panel ── */
  if (hasHL) {
    const hlPanel = document.createElement('div');
    hlPanel.className = 'tab-panel';

    const badSet  = new Set((data.highlights.bad  || []).map(Number));
    const warnSet = new Set((data.highlights.warn || []).map(Number));
    const goodSet = new Set((data.highlights.good || []).map(Number));

    const wrap = document.createElement('div');
    wrap.className = 'hl-code-wrap';

    $('#code-ta').value.split('\n').forEach((line, idx) => {
      const n   = idx + 1;
      const cls = badSet.has(n) ? 'bad' : warnSet.has(n) ? 'warn' : goodSet.has(n) ? 'good' : '';
      const row = document.createElement('div');
      row.className = 'hl-row' + (cls ? ' ' + cls : '');
      row.innerHTML = `<span class="hl-n">${n}</span><span class="hl-c">${esc(line || ' ')}</span>`;
      wrap.appendChild(row);
    });
    hlPanel.appendChild(wrap);

    /* FIX: use appendChild for legend — never innerHTML += (destroys child nodes) */
    const legend = document.createElement('div');
    legend.className = 'hl-legend';
    legend.innerHTML = `
      <div class="hl-leg-item"><div class="hl-leg-dot" style="background:rgba(239,68,68,.5)"></div> Critical</div>
      <div class="hl-leg-item"><div class="hl-leg-dot" style="background:rgba(245,158,11,.5)"></div> Warning</div>
      <div class="hl-leg-item"><div class="hl-leg-dot" style="background:rgba(34,197,94,.5)"></div> Clean</div>`;
    hlPanel.appendChild(legend);

    out.appendChild(hlPanel);
    panelMap.highlights = hlPanel;
  }

  showState('results');
}
