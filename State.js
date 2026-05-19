'use strict';

/* ─── App state (single source of truth) ──────────── */
const S = {
  xp:      0,
  reviews: 0,
  persona: 'senior',
  busy:    false,
  exIdx:   0,
};

/* ─── DOM helpers ──────────────────────────────────── */
const $  = sel => document.querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

/* ─── Safe HTML escape ─────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Score → colour ───────────────────────────────── */
function scoreColor(n) {
  return n >= 8 ? '#22c55e' : n >= 6 ? '#f59e0b' : n >= 4 ? '#f97316' : '#ef4444';
}

/* ─── Rank lookup ──────────────────────────────────── */
function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0];
}

/* ─── Show one panel, hide the others ─────────────── */
function showState(name) {
  ['empty', 'loading', 'results'].forEach(k => {
    const el = $(`#st-${k}`);
    if (el) el.style.display = (k === name) ? '' : 'none';
  });
}
