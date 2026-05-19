'use strict';

/* ─── Example loader ───────────────────────────────── */
function loadExample() {
  const ta = $('#code-ta');
  ta.value = EXAMPLES[S.exIdx++ % EXAMPLES.length];
  syncLines();
  ta.focus();
}

/* ─── Boot ─────────────────────────────────────────── */
(function init() {
  const ta   = $('#code-ta');
  const lnEl = $('#line-nums');

  /* Sync line numbers on input */
  ta.addEventListener('input', syncLines);

  /* Keep line-number gutter scroll in sync with textarea */
  ta.addEventListener('scroll', () => {
    lnEl.scrollTop = ta.scrollTop;
  });

  /* Platform-aware keyboard shortcut label */
  const isMac = /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent);
  $('#kbd-hint').textContent = isMac ? '⌘↵' : 'Ctrl↵';

  /* Global keyboard shortcut Cmd/Ctrl + Enter → run review */
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runReview();
    }
  });

  /* Button bindings */
  $('#review-btn').addEventListener('click',  runReview);
  $('#example-btn').addEventListener('click', loadExample);

  /* Initial renders */
  buildPersonas();
  buildStreakDots();
  syncLines();
})();
