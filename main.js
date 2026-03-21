/* ─── Example loader ───────────────────────────────── */
let exIdx = 0;

function loadExample() {
  const ta = $('#code-ta');
  ta.value = EXAMPLES[exIdx++ % EXAMPLES.length];
  syncLines();
  ta.focus();
}

/* ─── Boot ─────────────────────────────────────────── */
(function init() {
  const ta   = $('#code-ta');
  const lnEl = $('#line-nums');

  /* Line number sync */
  ta.addEventListener('input', syncLines);
  ta.addEventListener('scroll', () => { lnEl.scrollTop = ta.scrollTop; });

  /* Keyboard shortcut */
  $('#kbd-hint').textContent = /mac/i.test(navigator.platform) ? '⌘↵' : 'Ctrl↵';
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runReview();
    }
  });

  /* Button bindings */
  $('#review-btn').addEventListener('click', runReview);
  $('#example-btn').addEventListener('click', loadExample);

  /* Initial renders */
  buildPersonas();
  buildStreakDots();
  syncLines();
})();
