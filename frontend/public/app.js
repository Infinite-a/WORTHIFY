/* ═══════════════════════════════════════════════
   Worthify — Frontend Application
   Full-stack SPA with JWT auth + Analysis Engine
════════════════════════════════════════════════ */

const API = '';  // same-origin
let currentUser  = null;
let priceChartInst = null;
let sentimentChartInst = null;
let statsChartInst = null;

// Trackers for intervals and in-flight requests
let _clockIntervalId = null;
let analyzeController = null;
let analyzeDebounceTimer = null;
const ANALYZE_DEBOUNCE_MS = 350;
const DEFAULT_FETCH_TIMEOUT = 30000; // 30s

// ─── Token Management ──────────────────────────────────────────────────────
const getToken  = () => localStorage.getItem('worthify_token');
const setToken  = t  => localStorage.setItem('worthify_token', t);
const clearAuth = () => { localStorage.removeItem('worthify_token'); currentUser = null; };

// ─── Fetch Helper (robust) ─────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || (controller && controller.signal);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const fetchOptions = { ...options, headers };
  if (!fetchOptions.signal) fetchOptions.signal = signal;

  const timeout = typeof options.timeout === 'number' ? options.timeout : DEFAULT_FETCH_TIMEOUT;
  let timeoutId = null;
  if (controller && timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const res = await fetch(API + endpoint, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      // fallback to text when server doesn't return JSON
      body = await res.text();
    }

    if (!res.ok) {
      const msg = (typeof body === 'object' && body && body.error) ? body.error : (typeof body === 'string' ? body : res.statusText);
      throw new Error(msg || 'Request failed');
    }
    return body;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out or was cancelled');
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// ─── Page Navigation ───────────────────────────────────────────────────────
function showPage(page) {
  ['landing', 'login', 'signup', 'dashboard'].forEach(p => {
    const el = document.getElementById(`page-${p}`);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.remove('hidden');

  if (page === 'dashboard') {
    startClock();
    loadHistory();
    loadStats();
  } else {
    // stop dashboard-only intervals when leaving
    stopClock();
  }
}

// ─── Auth Check ──────────────────────────────────────────────────────────
async function checkAuth() {
  const token = getToken();
  if (!token) { showPage('landing'); return; }
  try {
    const data = await apiFetch('/api/auth/me');
    currentUser = data;
    updateSidebarUser(data);
    showPage('dashboard');
  } catch {
    clearAuth();
    showPage('landing');
  }
}

function updateSidebarUser(user) {
  const nameEl   = document.getElementById('sidebar-username');
  const emailEl  = document.getElementById('sidebar-email');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl)   nameEl.textContent  = user.name || 'User';
  if (emailEl)  emailEl.textContent = user.email || '';
  if (avatarEl) avatarEl.textContent = (user.name || 'U')[0].toUpperCase();
}

// ─── Auth Handlers ────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btnText  = document.getElementById('login-btn-text');
  const loading  = document.getElementById('login-loading');

  if (errEl) errEl.classList.add('hidden');
  if (btnText) btnText.classList.add('hidden');
  if (loading) loading.classList.remove('hidden');

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    currentUser = data.user;
    updateSidebarUser(data.user);
    showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
    showPage('dashboard');
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
  } finally {
    if (btnText) btnText.classList.remove('hidden');
    if (loading) loading.classList.add('hidden');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signup-name').value;
  const email    = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const errEl    = document.getElementById('signup-error');
  const btnText  = document.getElementById('signup-btn-text');
  const loading  = document.getElementById('signup-loading');

  if (errEl) errEl.classList.add('hidden');
  if (btnText) btnText.classList.add('hidden');
  if (loading) loading.classList.remove('hidden');

  try {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setToken(data.token);
    currentUser = data.user;
    updateSidebarUser(data.user);
    showToast(`Account created! Welcome, ${data.user.name}! 🎉`, 'success');
    showPage('dashboard');
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
  } finally {
    if (btnText) btnText.classList.remove('hidden');
    if (loading) loading.classList.add('hidden');
  }
}

function handleLogout() {
  // cancel any in-flight analyze request
  if (analyzeController) { try { analyzeController.abort(); } catch(e){} analyzeController = null; }
  clearAuth();
  stopClock();
  showToast('Signed out successfully', 'info');
  showPage('landing');
}

function togglePassword(id) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─── Dashboard Tab Switching ───────────────────────────────────────────────
function switchTab(tab) {
  ['analyze', 'history', 'stats', 'about'].forEach(t => {
    const c = document.getElementById(`tab-content-${t}`);
    const l = document.getElementById(`tab-${t}`);
    if (c) c.classList.add('hidden');
    if (l) l.classList.remove('active');
  });
  document.getElementById(`tab-content-${tab}`)?.classList.remove('hidden');
  document.getElementById(`tab-${tab}`)?.classList.add('active');

  const titles = {
    analyze: ['Analyze Product', 'Enter any product to get your Worthify intelligence report'],
    history: ['Search History', 'Your previous analyses'],
    stats:   ['My Analytics', 'Your usage and verdict statistics'],
    about:   ['How It Works', 'The technology behind Worthify']
  };
  document.getElementById('page-title').textContent    = titles[tab][0];
  document.getElementById('page-subtitle').textContent = titles[tab][1];

  if (tab === 'history') loadHistory();
  if (tab === 'stats')   loadStats();
  return false;
}

// ─── Clock ───────────────────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  tick();
  if (_clockIntervalId) clearInterval(_clockIntervalId);
  _clockIntervalId = setInterval(tick, 1000);
}

function stopClock() {
  if (_clockIntervalId) { clearInterval(_clockIntervalId); _clockIntervalId = null; }
}

// ─── Quick Search ─────────────────────────────────────────────────────────
function quickSearch(q) {
  const inp = document.getElementById('search-input');
  if (inp) { inp.value = q; analyzeNow(); }
}

// ─── Main Analysis (debounced + cancelable) ─────────────────────────────────
function analyzeNow() {
  // Immediate start (bypass debounce)
  if (analyzeDebounceTimer) { clearTimeout(analyzeDebounceTimer); analyzeDebounceTimer = null; }
  _analyzeCore();
}

function runAnalysis() {
  if (analyzeDebounceTimer) clearTimeout(analyzeDebounceTimer);
  analyzeDebounceTimer = setTimeout(() => _analyzeCore(), ANALYZE_DEBOUNCE_MS);
}

async function _analyzeCore() {
  const inputEl = document.getElementById('search-input');
  const query = inputEl ? inputEl.value.trim() : '';
  if (!query) return;

  // Cancel previous request if running
  if (analyzeController) { try { analyzeController.abort(); } catch(e){} analyzeController = null; }
  analyzeController = new AbortController();
  const signal = analyzeController.signal;

  // UI transition
  document.getElementById('idle-state')?.classList.add('hidden');
  document.getElementById('results-section')?.classList.add('hidden');
  document.getElementById('loading-state')?.classList.remove('hidden');

  const btnText = document.getElementById('analyze-btn-text');
  const loading = document.getElementById('analyze-loading');
  if (btnText) btnText.classList.add('hidden');
  if (loading) loading.classList.remove('hidden');
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) analyzeBtn.disabled = true;

  // Animated scan steps
  const steps = ['scan-1','scan-2','scan-3','scan-4','scan-5'];
  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    if (stepIdx > 0) {
      const prev = document.getElementById(steps[stepIdx - 1]);
      if (prev) prev.classList.add('done');
    }
    const cur = document.getElementById(steps[stepIdx]);
    if (cur) {
      cur.style.animationDelay = `${stepIdx * 0.1}s`;
      cur.style.opacity = '1';
      cur.classList.add('active');
    }
    stepIdx++;
    if (stepIdx >= steps.length) clearInterval(stepInterval);
  }, 800);

  try {
    const data = await apiFetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ query }),
      signal,
      timeout: 45000
    });

    clearInterval(stepInterval);
    steps.forEach(s => {
      const el = document.getElementById(s);
      if (el) { el.classList.add('done'); el.classList.remove('active'); }
    });

    await new Promise(r => setTimeout(r, 600));

    document.getElementById('loading-state')?.classList.add('hidden');
    document.getElementById('results-section')?.classList.remove('hidden');

    renderResults(data || {});
    showToast(`Analysis complete! Quality Score: ${data?.quality_score ?? '—'}/100`, 'success');

  } catch (err) {
    clearInterval(stepInterval);
    // If cancelled by user, don't show a heavy error
    if (err && err.message && err.message.toLowerCase().includes('timed out')) {
      showToast('Analysis timed out or was cancelled', 'warn');
    } else if (err && err.message && err.message.toLowerCase().includes('cancelled')) {
      // no-op or small hint
      // showToast('Analysis cancelled', 'info');
    } else {
      document.getElementById('loading-state')?.classList.add('hidden');
      document.getElementById('idle-state')?.classList.remove('hidden');
      showToast('Analysis failed: ' + (err?.message || 'Unknown error'), 'error');
    }
  } finally {
    if (btnText) btnText.classList.remove('hidden');
    if (loading) loading.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.disabled = false;
    analyzeController = null;
  }
}

// ─── Render Results ───────────────────────────────────────────────────────
function renderResults(data) {
  renderVerdict(data);
  renderQualityScore(data?.quality_score || 0);
  renderPriceIntel(data?.price_intel || {});
  renderSentimentSummary(data?.sentiment || {});
  renderSentimentSection(data?.sentiment || {});
  renderAspects(data?.aspects || {});
  renderTelemetry(Array.isArray(data?.telemetry) ? data.telemetry : [], data?.timestamp);
  renderProductInfoCard(data?.product_info || data?.product_meta);
  renderOfflineStores(data?.price_comparison);
  renderCharts(data || {});
  renderProducts(data?.platform_data || {});
  renderSnippets(data?.snippets || []);
}

// ─── Product Info Card (Rich) ──────────────────────────────────────────────
function renderProductInfoCard(meta) {
  if (!meta) return;
  const card = document.getElementById('product-info-card');
  if (!card) return;

  const fmt = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '';
  const catIcons = {
    smartphone: 'fa-mobile-screen', laptop: 'fa-laptop', tablet: 'fa-tablet-screen-button',
    audio: 'fa-headphones', wearable: 'fa-watch', camera: 'fa-camera', tv: 'fa-tv',
    gaming: 'fa-gamepad', appliance: 'fa-blender', default: 'fa-box'
  };
  const catColors = {
    smartphone: 'blue', laptop: 'cyan', audio: 'purple',
    wearable: 'rose', camera: 'amber', tv: 'green', gaming: 'red', appliance: 'orange'
  };

  const safeCat = safeCategoryClass(meta.category);
  const icon  = catIcons[safeCat] || catIcons.default;
  const color = catColors[safeCat] || 'blue';

  // Icon
  const iconBg = document.getElementById('product-icon-bg');
  const iconEl = document.getElementById('product-cat-icon');
  if (iconBg) iconBg.className = `w-12 h-12 rounded-2xl bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center flex-shrink-0`;
  if (iconEl) iconEl.className = `fas ${icon} text-${color}-400 text-xl`;

  setText('product-title-name', meta.matched_key || meta.category || 'Product');
  setText('product-cat-badge', meta.category || '');
  setText('product-mrp-val', fmt(meta.mrp) || '—');
  setText('product-fx-rate', meta.inr_rate ? meta.inr_rate.toFixed(2) : '—');

  const brandEl = document.getElementById('product-brand-badge');
  if (brandEl && meta.brand && meta.brand !== 'unknown') {
    brandEl.textContent = meta.brand;
    brandEl.classList.remove('hidden');
  }

  // Description
  const descEl = document.getElementById('product-description');
  if (descEl && meta.description) {
    descEl.textContent = meta.description;
    descEl.classList.remove('hidden');
  }

  // Key highlights
  const hlWrap = document.getElementById('product-highlights-wrap');
  const hlEl   = document.getElementById('product-highlights');
  if (hlWrap && hlEl && Array.isArray(meta.key_highlights) && meta.key_highlights.length > 0) {
    hlEl.innerHTML = meta.key_highlights.map(h =>
      `<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-${color}-500/10 text-${color}-300 border border-${color}-500/20 rounded-full">
        <i class="fas fa-check-circle text-${color}-400 text-[10px]"></i>${escapeHtml(h)}
      </span>`
    ).join('');
    hlWrap.classList.remove('hidden');
  }

