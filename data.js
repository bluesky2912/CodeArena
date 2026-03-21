/* ─── Personas ─────────────────────────────────────── */
const PERSONAS = [
  {
    id: 'senior',
    icon: '🧙',
    label: 'Senior Dev',
    sub: 'Mentoring + thorough',
    desc: 'Balanced, mentoring review. Real issues, actionable fixes, no sugarcoating.',
    sys: 'You are a pragmatic senior software engineer known for thorough, mentoring code reviews. You catch real issues, explain why they matter, and suggest concrete improvements. Be professional but human.',
    load: ['Summoning', 'senior dev'],
  },
  {
    id: 'toxic',
    icon: '😈',
    label: 'Toxic Reviewer',
    sub: 'Brutal + secretly helpful',
    desc: 'Legendary 10x energy. Roasts mercilessly, but every burn has a real fix attached.',
    sys: 'You are a legendary 10x developer who is brutally sarcastic. You roast code mercilessly but every criticism is actionable and correct. Be inventive and specific — not generically mean.',
    load: ['Waking up', 'toxic reviewer'],
  },
  {
    id: 'linter',
    icon: '🤖',
    label: 'Strict Linter',
    sub: 'Cold + mechanical',
    desc: 'Zero emotion. Every violation enumerated. Brevity and precision only.',
    sys: 'You are a cold, emotionless static analysis bot. You enumerate every code quality violation clinically. No encouragement, no filler — pure signal.',
    load: ['Booting', 'linter bot'],
  },
  {
    id: 'intern',
    icon: '🐣',
    label: 'Friendly Intern',
    sub: 'Supportive + enthusiastic',
    desc: 'Enthusiastic and supportive — but still correctly identifies every real problem.',
    sys: 'You are an enthusiastic junior developer doing your first code review. You are supportive and find positives, but you correctly identify real issues in a helpful, non-threatening way.',
    load: ['Fetching', 'friendly intern'],
  },
];

/* ─── Ranks ────────────────────────────────────────── */
const RANKS = [
  { name: 'Noob',        emoji: '🌱',  color: '#6b7280', min: 0,    max: 250   },
  { name: 'Dev',         emoji: '💻',  color: '#22c55e', min: 250,  max: 700   },
  { name: 'Senior',      emoji: '🧑‍💻', color: '#6366f1', min: 700,  max: 1500  },
  { name: 'Code Wizard', emoji: '🧙‍♂️', color: '#f59e0b', min: 1500, max: 99999 },
];

/* ─── Example snippets ─────────────────────────────── */
const EXAMPLES = [
`function fetchUserData(userId) {
  var data = null;
  var x = 0;
  fetch('/api/users/' + userId)
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      data = result;
      x = 1;
      for (var i = 0; i < data.tags.length; i++) {
        for (var j = 0; j < data.tags.length; j++) {
          if (data.tags[i] == data.tags[j] && i != j) {
            console.log("duplicate found");
          }
        }
      }
    })
    .catch(function(e) {
      console.log(e);
    });
  return data;
}`,

`def process_orders(orders):
    result = []
    for i in range(len(orders)):
        o = orders[i]
        if o['status'] == 'pending':
            if o['amount'] > 0:
                if o['user'] != None:
                    result.append(o)
    return result`,
];

/* ─── Risk level config ────────────────────────────── */
const RISK = {
  low:      { color: '#22c55e', bg: 'rgba(34,197,94,.12)',   pct: 15  },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  pct: 45  },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,.12)',  pct: 75  },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,.12)',   pct: 100 },
};
