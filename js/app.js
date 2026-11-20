'use strict';

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
const Storage = {
  get(key, fallback) {
    if (fallback === undefined) fallback = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
};

const KEYS = {
  TASKS:      'ppd.tasks',
  LINKS:      'ppd.links',
  USERNAME:   'ppd.username',
  THEME:      'ppd.theme',
  TIMER_MINS: 'ppd.timerMins'
};

/* ============================================================
   ID GENERATOR
   ============================================================ */
function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ============================================================
   CLOCK & GREETING
   ============================================================ */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

function formatTime(date) {
  let h = date.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return String(h).padStart(2, '0') + ':' + mm + ':' + ss + ' ' + ampm;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

function initClock() {
  const greetingEl = document.getElementById('greeting');
  const timeEl     = document.getElementById('clock-time');
  const dateEl     = document.getElementById('clock-date');

  function tick() {
    const now      = new Date();
    const hour     = now.getHours();
    const name     = Storage.get(KEYS.USERNAME, '');
    const namePart = (typeof name === 'string' && name.trim()) ? ', ' + name.trim() + '!' : '!';
    greetingEl.textContent = getGreeting(hour) + namePart;
    timeEl.textContent     = formatTime(now);
    dateEl.textContent     = formatDate(now);
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   CUSTOM NAME  — Challenge: Custom name in greeting
   ============================================================ */
function initName() {
  const input   = document.getElementById('user-name');
  const saveBtn = document.getElementById('save-name');

  const saved = Storage.get(KEYS.USERNAME, '');
  if (typeof saved === 'string') input.value = saved;

  function saveName() {
    Storage.set(KEYS.USERNAME, input.value.trim());
    // Clock picks up new name on next tick (within 1 s)
  }

  saveBtn.addEventListener('click', saveName);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveName(); });
}

/* ============================================================
   LIGHT / DARK THEME  — Challenge: Light / Dark mode
   ============================================================ */
function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    Storage.set(KEYS.THEME, theme);
  }

  const saved = Storage.get(KEYS.THEME, 'light');
  applyTheme(typeof saved === 'string' ? saved : 'light');

  btn.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/* ============================================================
   FOCUS TIMER  — Challenge: Change Pomodoro time
   ============================================================ */
function initTimer() {
  const displayEl  = document.getElementById('timer-display');
  const badgeEl    = document.getElementById('timer-complete');
  const startBtn   = document.getElementById('timer-start');
  const pauseBtn   = document.getElementById('timer-pause');
  const resetBtn   = document.getElementById('timer-reset');
  const minsInput  = document.getElementById('timer-minutes');
  const setBtn     = document.getElementById('timer-set');

  const savedMins    = parseInt(Storage.get(KEYS.TIMER_MINS, 25), 10) || 25;
  const DEFAULT_MS   = savedMins * 60 * 1000;
  minsInput.value    = savedMins;

  let state = {
    status:      'idle',
    remainingMs: DEFAULT_MS,
    endTime:     null,
    totalMs:     DEFAULT_MS
  };
  let intervalId = null;

  function formatDuration(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function render() {
    displayEl.textContent  = formatDuration(state.remainingMs);
    badgeEl.classList.toggle('hidden', state.status !== 'completed');
    startBtn.disabled = (state.status === 'running' || state.status === 'completed');
    pauseBtn.disabled = (state.status !== 'running');
    resetBtn.disabled = false;
  }

  function tick() {
    if (state.status !== 'running') return;
    state.remainingMs = Math.max(0, state.endTime - Date.now());
    if (state.remainingMs === 0) {
      state.status = 'completed';
      clearInterval(intervalId);
      intervalId = null;
    }
    render();
  }

  startBtn.addEventListener('click', function () {
    if (state.status === 'running' || state.status === 'completed') return;
    state.endTime = Date.now() + state.remainingMs;
    state.status  = 'running';
    intervalId    = setInterval(tick, 500);
    render();
  });

  pauseBtn.addEventListener('click', function () {
    if (state.status !== 'running') return;
    state.remainingMs = Math.max(0, state.endTime - Date.now());
    state.status      = 'paused';
    state.endTime     = null;
    clearInterval(intervalId);
    intervalId = null;
    render();
  });

  resetBtn.addEventListener('click', function () {
    clearInterval(intervalId);
    intervalId    = null;
    state.status  = 'idle';
    state.remainingMs = state.totalMs;
    state.endTime = null;
    render();
  });

  setBtn.addEventListener('click', function () {
    const mins = parseInt(minsInput.value, 10);
    if (!mins || mins < 1 || mins > 99) return;
    clearInterval(intervalId);
    intervalId = null;
    const ms   = mins * 60 * 1000;
    Storage.set(KEYS.TIMER_MINS, mins);
    state = { status: 'idle', remainingMs: ms, endTime: null, totalMs: ms };
    render();
  });

  minsInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') setBtn.click(); });
  render();
}

/* ============================================================
   TASK MANAGER
   Challenge: Prevent duplicate tasks
   ============================================================ */
let tasks = [];

function saveTasks() { Storage.set(KEYS.TASKS, tasks); }

function showTaskStatus(msg, isSuccess) {
  const el = document.getElementById('task-status');
  el.textContent = msg;
  el.className   = 'status-msg' + (isSuccess ? ' success' : '');
  if (msg) setTimeout(function () { if (el.textContent === msg) el.textContent = ''; }, 3000);
}

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(function (task) {
    const li = document.createElement('li');
    li.className  = 'task-item' + (task.completed ? ' done' : '');
    li.dataset.id = task.id;

    // --- Checkbox ---
    const cb       = document.createElement('input');
    cb.type        = 'checkbox';
    cb.checked     = task.completed;
    cb.setAttribute('aria-label', 'Mark complete');
    cb.addEventListener('change', function () {
      task.completed = cb.checked;
      li.classList.toggle('done', task.completed);
      saveTasks();
    });

    // --- Text span (view mode) ---
    const span       = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    // --- Edit input (hidden by default) ---
    const editInput       = document.createElement('input');
    editInput.type        = 'text';
    editInput.className   = 'task-edit-input hidden';
    editInput.maxLength   = 200;
    editInput.value       = task.text;

    // --- Edit button ---
    const editBtn       = document.createElement('button');
    editBtn.className   = 'btn btn--sm btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit task');

    // --- Save-edit button (hidden by default) ---
    const saveEditBtn       = document.createElement('button');
    saveEditBtn.className   = 'btn btn--sm btn-save-edit btn--primary hidden';
    saveEditBtn.textContent = 'Save';
    saveEditBtn.setAttribute('aria-label', 'Save edit');

    function enterEditMode() {
      span.classList.add('hidden');
      editInput.classList.remove('hidden');
      editBtn.classList.add('hidden');
      saveEditBtn.classList.remove('hidden');
      editInput.focus();
      editInput.select();
    }

    function exitEditMode() {
      editInput.value = task.text;
      span.classList.remove('hidden');
      editInput.classList.add('hidden');
      editBtn.classList.remove('hidden');
      saveEditBtn.classList.add('hidden');
    }

    function commitEdit() {
      const newText = editInput.value.trim();
      if (!newText) {
        showTaskStatus('Task text cannot be empty.');
        return;
      }
      if (newText.length > 200) {
        showTaskStatus('Task text is too long (max 200 chars).');
        return;
      }
      const dup = tasks.some(function (t) {
        return t.id !== task.id && t.text.toLowerCase() === newText.toLowerCase();
      });
      if (dup) {
        showTaskStatus('A task with that text already exists.');
        return;
      }
      task.text        = newText;
      span.textContent = newText;
      saveTasks();
      exitEditMode();
    }

    editBtn.addEventListener('click', enterEditMode);
    saveEditBtn.addEventListener('click', commitEdit);
    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter')  commitEdit();
      if (e.key === 'Escape') exitEditMode();
    });

    // --- Delete button ---
    const delBtn       = document.createElement('button');
    delBtn.className   = 'btn btn--sm btn-delete';
    delBtn.textContent = 'X';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      renderTasks();
    });

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(editInput);
    li.appendChild(editBtn);
    li.appendChild(saveEditBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function initTasks() {
  const raw = Storage.get(KEYS.TASKS, []);
  tasks = Array.isArray(raw) ? raw : [];

  const input   = document.getElementById('task-input');
  const addBtn  = document.getElementById('task-add');
  const sortBtn = document.getElementById('sort-tasks');
  let   sortAsc = true;

  function addTask() {
    const text = input.value.trim();
    if (!text) return;
    if (text.length > 200) {
      showTaskStatus('Task is too long (max 200 characters).');
      return;
    }
    // Prevent duplicate tasks
    const dup = tasks.some(function (t) { return t.text.toLowerCase() === text.toLowerCase(); });
    if (dup) {
      showTaskStatus('That task already exists.');
      return;
    }
    tasks.push({ id: createId(), text: text, completed: false });
    saveTasks();
    input.value = '';
    renderTasks();
  }

  addBtn.addEventListener('click', addTask);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });

  sortBtn.addEventListener('click', function () {
    sortAsc = !sortAsc;
    tasks.sort(function (a, b) {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return sortAsc ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text);
    });
    saveTasks();
    renderTasks();
  });

  renderTasks();
}

/* ============================================================
   QUICK LINKS
   ============================================================ */
let links = [];

function saveLinks() { Storage.set(KEYS.LINKS, links); }

function showLinkStatus(msg) {
  const el       = document.getElementById('link-status');
  el.textContent = msg;
  el.className   = 'status-msg';
  if (msg) setTimeout(function () { if (el.textContent === msg) el.textContent = ''; }, 3000);
}

function normalizeUrl(url) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return 'https://' + url;
}

function renderLinks() {
  const list = document.getElementById('link-list');
  list.innerHTML = '';

  links.forEach(function (link) {
    const li       = document.createElement('li');
    li.className   = 'link-item';

    const a    = document.createElement('a');
    a.href     = normalizeUrl(link.url);
    a.textContent = link.name;
    a.target   = '_blank';
    a.rel      = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Open ' + link.name);

    const delBtn       = document.createElement('button');
    delBtn.className   = 'btn btn--sm btn-delete';
    delBtn.textContent = 'X';
    delBtn.setAttribute('aria-label', 'Delete ' + link.name);
    delBtn.addEventListener('click', function () {
      links = links.filter(function (l) { return l.id !== link.id; });
      saveLinks();
      renderLinks();
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function initLinks() {
  const raw = Storage.get(KEYS.LINKS, []);
  links = Array.isArray(raw) ? raw : [];

  const nameInput = document.getElementById('link-name');
  const urlInput  = document.getElementById('link-url');
  const addBtn    = document.getElementById('link-add');

  function addLink() {
    const name = nameInput.value.trim();
    const url  = urlInput.value.trim();
    if (!name || !url) {
      showLinkStatus('Please enter both a name and a URL.');
      return;
    }
    if (name.length > 100) {
      showLinkStatus('Name is too long (max 100 characters).');
      return;
    }
    if (url.length > 2048) {
      showLinkStatus('URL is too long (max 2048 characters).');
      return;
    }
    links.push({ id: createId(), name: name, url: url });
    saveLinks();
    nameInput.value = '';
    urlInput.value  = '';
    renderLinks();
  }

  addBtn.addEventListener('click', addLink);
  urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addLink(); });
  renderLinks();
}

/* ============================================================
   ENTRY POINT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  try { initTheme(); } catch (e) { console.error('Theme init failed:', e); }
  try { initClock(); } catch (e) { console.error('Clock init failed:', e); }
  try { initName();  } catch (e) { console.error('Name init failed:', e); }
  try { initTimer(); } catch (e) { console.error('Timer init failed:', e); }
  try { initTasks(); } catch (e) { console.error('Tasks init failed:', e); }
  try { initLinks(); } catch (e) { console.error('Links init failed:', e); }
});