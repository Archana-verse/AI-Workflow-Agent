const MODES = {
  email: {
    label: 'Write Email',
    steps: ['Understand', 'Drafting', 'Structuring', 'Polishing', 'Deliver'],
    system: `You are an expert AI email writing assistant that works in clear steps.

When given a task:
1. Start with "Step 1 — Understanding your request:" and briefly restate what's needed (1-2 lines).
2. Then "Step 2 — Analyzing tone & context:" note the appropriate tone and key points to include.
3. Then "Step 3 — Generating draft:" write the full email with a Subject line.
4. Then "Step 4 — Refining:" note 1-2 improvements you applied.
5. End with "✓ Delivered" and a one-line tip.

Be concise, professional, and genuinely helpful.`
  },
  summary: {
    label: 'Summarize',
    steps: ['Understand', 'Extracting', 'Structuring', 'Refining', 'Deliver'],
    system: `You are an expert summarization agent that works in clear steps.

When given a task:
1. "Step 1 — Understanding:" restate what needs summarizing (1 line).
2. "Step 2 — Extracting key points:" list the 3-5 most important points.
3. "Step 3 — Structuring the summary:" write a clean concise summary.
4. "Step 4 — Refining:" note simplifications or improvements made.
5. End with "✓ Delivered" and a brief note on what was prioritized.

Be clear, concise and useful.`
  },
  plan: {
    label: 'Action Plan',
    steps: ['Understand', 'Research', 'Planning', 'Refining', 'Deliver'],
    system: `You are an expert planning agent that creates clear, actionable plans.

When given a task:
1. "Step 1 — Understanding the goal:" restate the objective clearly (1-2 lines).
2. "Step 2 — Breaking it down:" identify 3-5 key phases or focus areas.
3. "Step 3 — Building the plan:" create a detailed week-by-week or phase-by-phase action plan.
4. "Step 4 — Refining:" add tips, tools, or resources to support success.
5. End with "✓ Plan Delivered" and a motivational one-liner.

Be practical and specific.`
  },
  report: {
    label: 'Draft Report',
    steps: ['Understand', 'Outline', 'Drafting', 'Refining', 'Deliver'],
    system: `You are an expert report writing agent that works in clear steps.

When given a task:
1. "Step 1 — Understanding the brief:" restate what report is needed (1-2 lines).
2. "Step 2 — Creating outline:" list the main sections briefly.
3. "Step 3 — Drafting the report:" write the full report with proper headings and content.
4. "Step 4 — Refining:" note improvements made to structure or clarity.
5. End with "✓ Report Delivered" and a note on tone/style used.

Be thorough and professional.`
  },
  custom: {
    label: 'Custom Task',
    steps: ['Understand', 'Analyze', 'Generate', 'Refine', 'Deliver'],
    system: `You are a versatile AI automation agent that handles any multi-step task.

When given a task:
1. "Step 1 — Understanding:" clearly restate the task (1-2 lines).
2. "Step 2 — Analyzing:" break down what's needed and your approach.
3. "Step 3 — Generating output:" produce the main deliverable fully.
4. "Step 4 — Refining:" note improvements or alternatives.
5. End with "✓ Delivered" and a brief summary of what was done.

Adapt your format to best suit the task.`
  }
};

// ── State ────────────────────────────────────────────────────────────────────

let currentMode = 'email';
let history     = [];
let running     = false;

// ── Mode Switching ────────────────────────────────────────────────────────────

function setMode(m) {
  currentMode = m;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === MODES[m].label);
  });
  resetPipeline();
}

// ── Pipeline ─────────────────────────────────────────────────────────────────

function resetPipeline() {
  const steps = MODES[currentMode].steps;
  ['s1','s2','s3','s4','s5'].forEach((id, i) => {
    const el = document.getElementById(id);
    el.textContent = steps[i];
    el.className = 'step-badge';
  });
}

function activateStep(i) {
  ['s1','s2','s3','s4','s5'].forEach((id, j) => {
    const el = document.getElementById(id);
    if      (j < i)  el.className = 'step-badge done';
    else if (j === i) el.className = 'step-badge active';
    else              el.className = 'step-badge';
  });
}

function allStepsDone() {
  ['s1','s2','s3','s4','s5'].forEach(id => {
    document.getElementById(id).className = 'step-badge done';
  });
}

// ── Quick Prompts ─────────────────────────────────────────────────────────────

function useQuick(btn) {
  const inp = document.getElementById('inp');
  inp.value = btn.textContent.trim();
  autoResize(inp);
  inp.focus();
}

// ── Textarea ──────────────────────────────────────────────────────────────────

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ── Message Rendering ─────────────────────────────────────────────────────────

function addMsg(role, html, thinking = '') {
  const msgs = document.getElementById('messages');
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;

  const av = document.createElement('div');
  av.className = 'avatar ' + role;
  av.textContent = role === 'ai' ? 'AI' : 'You';

  const bub = document.createElement('div');
  bub.className = 'bubble ' + role;
  bub.innerHTML = thinking
    ? `<div class="thinking">${thinking}</div>${html}`
    : html;

  wrap.appendChild(av);
  wrap.appendChild(bub);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  return bub;
}

function addTyping() {
  const msgs = document.getElementById('messages');
  const div  = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="bubble ai">
      <div class="typing">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/Step (\d+) — ([^:]+):/g, (_, n, label) => {
      const tags = ['tag-analyze','tag-analyze','tag-generate','tag-refine','tag-done'];
      const cls  = tags[Math.min(n - 1, 4)];
      return `<br><span class="step-tag ${cls}">Step ${n}</span> <strong>${label}:</strong>`;
    })
    .replace(/✓ (.+)/g, '<br><span class="step-tag tag-done">✓ $1</span>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ── API Call ──────────────────────────────────────────────────────────────────

async function sendMessage() {
  const inp  = document.getElementById('inp');
  const text = inp.value.trim();
  if (!text || running) return;

  running = true;
  document.getElementById('sendBtn').disabled = true;

  resetPipeline();
  activateStep(0);

  addMsg('user', text);
  inp.value = '';
  inp.style.height = 'auto';

  history.push({ role: 'user', content: text });

  addTyping();

  // Animate pipeline steps while waiting
  let stepIdx = 0;
  const stepTimer = setInterval(() => {
    stepIdx = Math.min(stepIdx + 1, 4);
    activateStep(stepIdx);
  }, 1200);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode:    currentMode,
        history: history
      })
    });

    clearInterval(stepTimer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.reply || 'No response received. Please try again.';

    removeTyping();
    allStepsDone();
    addMsg('ai', formatResponse(reply), 'Agent completed workflow');
    history.push({ role: 'assistant', content: reply });

  } catch (err) {
    clearInterval(stepTimer);
    removeTyping();
    activateStep(0);
    addMsg('ai',
      `<strong>Error:</strong> ${err.message || 'Something went wrong. Please try again.'}`,
      'Agent error'
    );
    console.error('Agent error:', err);
  }

  running = false;
  document.getElementById('sendBtn').disabled = false;
}
