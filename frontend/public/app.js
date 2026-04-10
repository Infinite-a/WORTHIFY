/* ═══════════════════════════════════════════════
   Worthify — Frontend Application
   Full-stack SPA with JWT auth + Analysis Engine
═══════════════════════════════════════════════ */

const API = '';  // same-origin
let currentUser  = null;
let priceChartInst = null;
let sentimentChartInst = null;
let statsChartInst = null;

// ─── Token Management ──────────────────────────────────────────────────────
const getToken  = () => localStorage.getItem('worthify_token');
const setToken  = t  => localStorage.setItem('worthify_token', t);
const clearAuth = () => { localStorage.removeItem('worthify_token'); currentUser = null; };

// ─── Fetch Helper ──────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(API + endpoint, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
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
  }
}

// ─── Auth Check ────────────────────────────────────────────────────────────
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

// ─── Auth Handlers ─────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btnText  = document.getElementById('login-btn-text');
  const loading  = document.getElementById('login-loading');

  errEl.classList.add('hidden');
  btnText.classList.add('hidden');
  loading.classList.remove('hidden');

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
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btnText.classList.remove('hidden');
    loading.classList.add('hidden');
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

  errEl.classList.add('hidden');
  btnText.classList.add('hidden');
  loading.classList.remove('hidden');

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
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btnText.classList.remove('hidden');
    loading.classList.add('hidden');
  }
}

function handleLogout() {
  clearAuth();
  showToast('Signed out successfully', 'info');
  showPage('landing');
}

function togglePassword(id) {
  const inp = document.getElementById(id);
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

// ─── Clock ─────────────────────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  tick();
  setInterval(tick, 1000);
}

// ─── Quick Search ──────────────────────────────────────────────────────────
function quickSearch(q) {
  const inp = document.getElementById('search-input');
  if (inp) { inp.value = q; runAnalysis(); }
}

// ─── Main Analysis ─────────────────────────────────────────────────────────
async function runAnalysis() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;

  // UI transition
  document.getElementById('idle-state').classList.add('hidden');
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('loading-state').classList.remove('hidden');

  const btnText = document.getElementById('analyze-btn-text');
  const loading = document.getElementById('analyze-loading');
  btnText.classList.add('hidden');
  loading.classList.remove('hidden');
  document.getElementById('analyze-btn').disabled = true;

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
      body: JSON.stringify({ query })
    });

    clearInterval(stepInterval);
    steps.forEach(s => {
      const el = document.getElementById(s);
      if (el) { el.classList.add('done'); el.classList.remove('active'); }
    });

    await new Promise(r => setTimeout(r, 600));

    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');

    renderResults(data);
    showToast(`Analysis complete! Quality Score: ${data.quality_score}/100`, 'success');

  } catch (err) {
    clearInterval(stepInterval);
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('idle-state').classList.remove('hidden');
    showToast('Analysis failed: ' + err.message, 'error');
  } finally {
    btnText.classList.remove('hidden');
    loading.classList.add('hidden');
    document.getElementById('analyze-btn').disabled = false;
  }
}

// ─── Render Results ────────────────────────────────────────────────────────
function renderResults(data) {
  renderVerdict(data);
  renderQualityScore(data.quality_score);
  renderPriceIntel(data.price_intel);
  renderSentimentSummary(data.sentiment);
  renderSentimentSection(data.sentiment);
  renderAspects(data.aspects);
  renderTelemetry(data.telemetry, data.timestamp);
  renderProductInfoCard(data.product_info || data.product_meta);
  renderOfflineStores(data.price_comparison);
  renderCharts(data);
  renderProducts(data.platform_data);
  renderSnippets(data.snippets);
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

  const icon  = catIcons[meta.category] || catIcons.default;
  const color = catColors[meta.category] || 'blue';

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
  if (hlWrap && hlEl && meta.key_highlights && meta.key_highlights.length > 0) {
    hlEl.innerHTML = meta.key_highlights.map(h =>
      `<span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-${color}-500/10 text-${color}-300 border border-${color}-500/20 rounded-full">
        <i class="fas fa-check-circle text-${color}-400 text-[10px]"></i>${escapeHtml(h)}
      </span>`
    ).join('');
    hlWrap.classList.remove('hidden');
  }

  // Specs table
  const specsWrap = document.getElementById('product-specs-wrap');
  const specsTable = document.getElementById('specs-table');
  if (specsWrap && specsTable && meta.specs && Object.keys(meta.specs).length > 0) {
    specsTable.innerHTML = Object.entries(meta.specs).map(([k, v]) => `
      <div class="flex gap-2 py-1.5 border-b border-slate-800/60">
        <span class="text-slate-500 min-w-[120px] flex-shrink-0">${escapeHtml(k)}</span>
        <span class="text-slate-200 font-medium">${escapeHtml(v)}</span>
      </div>
    `).join('');
    specsWrap.classList.remove('hidden');
  }

  // Buy links
  const buyLinksEl = document.getElementById('product-buy-links');
  if (buyLinksEl && meta.buy_links && Object.keys(meta.buy_links).length > 0) {
    const linkIcons = {
      Amazon: 'fab fa-amazon', Flipkart: 'fas fa-shopping-bag',
      Myntra: 'fas fa-tshirt', JioMart: 'fas fa-store', Official: 'fas fa-globe'
    };
    const linkColors = {
      Amazon: 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30',
      Flipkart: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
      Myntra: 'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30',
      JioMart: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
      Official: 'bg-slate-600/40 text-slate-200 border-slate-500/30 hover:bg-slate-600/60',
    };
    buyLinksEl.innerHTML = Object.entries(meta.buy_links).map(([platform, url]) => {
      const ic = linkIcons[platform] || 'fas fa-external-link-alt';
      const cl = linkColors[platform] || 'bg-slate-600/40 text-slate-300 border-slate-500/30';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" 
        class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg font-medium transition-all ${cl}">
        <i class="${ic} text-[11px]"></i>${platform}
        <i class="fas fa-arrow-up-right-from-square text-[9px] opacity-60"></i>
      </a>`;
    }).join('');
  }

  // Savings label
  const piMin = document.getElementById('price-min');
  if (meta.mrp && piMin) {
    const minVal = parseInt(piMin.textContent.replace(/[₹,]/g, '')) || 0;
    if (minVal && meta.mrp > minVal) {
      const savePct = Math.round((meta.mrp - minVal) / meta.mrp * 100);
      setText('product-savings-label', `Save up to ${savePct}% online`);
    }
  }

  card.classList.remove('hidden');
}

// Toggle specs table visibility
function toggleSpecs() {
  const wrap = document.getElementById('specs-table-wrap');
  const btn  = document.getElementById('specs-toggle-btn');
  const chev = document.getElementById('specs-chevron');
  if (!wrap) return;
  const hidden = wrap.classList.contains('hidden');
  wrap.classList.toggle('hidden', !hidden);
  if (btn) btn.innerHTML = `<i class="fas fa-chevron-${hidden ? 'up' : 'down'} mr-1" id="specs-chevron"></i>${hidden ? 'Hide' : 'Show'} Specs`;
}

// Verdict Banner
function renderVerdict(data) {
  const banner = document.getElementById('verdict-banner');
  const v = data.verdict || '';
  const cls = v.includes('Buy') ? 'buy' : v.includes('Wait') ? 'wait' : v.includes('Consider') ? 'consider' : 'avoid';
  const color = cls === 'buy' ? '#22c55e' : cls === 'wait' ? '#f59e0b' : cls === 'consider' ? '#a855f7' : '#ef4444';

  banner.className = `verdict-banner ${cls}`;
  banner.innerHTML = `
    <div class="flex-1">
      <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Worthify Verdict — ${escapeHtml(data.query)}</div>
      <div class="text-2xl font-black" style="color:${color}">${escapeHtml(v)}</div>
      <p class="text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">${escapeHtml(data.verdict_detail || '')}</p>
    </div>
    <div class="flex flex-col items-center gap-2 min-w-[100px]">
      <div class="text-xs text-slate-500">Confidence</div>
      <div class="text-4xl font-black" style="color:${color}">${data.confidence}<span class="text-lg text-slate-500">%</span></div>
      <div class="text-xs text-slate-500">${data.total_reviews} reviews · ${data.total_products} products</div>
    </div>
  `;
}

// Quality Score Ring
function renderQualityScore(score) {
  document.getElementById('quality-score-val').textContent = score;
  document.getElementById('quality-mini').textContent = score;

  const bar = document.getElementById('quality-bar');
  setTimeout(() => { if (bar) bar.style.width = score + '%'; }, 100);

  const circle = document.getElementById('quality-circle');
  if (circle) {
    const circ = 2 * Math.PI * 15; // r=15
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
    circle.style.stroke = color;
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);
  }
}

// Price Intelligence
function renderPriceIntel(pi) {
  const fmt = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
  setText('price-min', fmt(pi.min));
  setText('price-avg', fmt(pi.avg));
  // Show MRP in the "max" slot (renamed to "MRP / List Price" in HTML)
  setText('price-max', fmt(pi.mrp || pi.max));
  setText('price-savings', `~${pi.savings || 0}% below MRP`);

  const mp = pi.market_parity || {};
  const colorMap = { green: 'text-green-400', yellow: 'text-amber-400', red: 'text-red-400' };
  const el = document.getElementById('market-parity-badge');
  if (el) {
    el.className = `text-xs font-medium ${colorMap[mp.color] || 'text-slate-400'}`;
    el.textContent = `${mp.icon || ''} ${mp.label || ''}`;
  }
}

// Sentiment Summary
function renderSentimentSummary(s) {
  setText('pos-pct', `${s.positive_pct}%`);
  setText('neu-pct', `${s.neutral_pct}%`);
  setText('neg-pct', `${s.negative_pct}%`);
  setText('total-reviews', s.total);
  setTimeout(() => {
    setBarWidth('pos-bar', s.positive_pct);
    setBarWidth('neu-bar', s.neutral_pct);
    setBarWidth('neg-bar', s.negative_pct);
  }, 200);
}

// Aspect Analysis
function renderAspects(aspects) {
  const grid = document.getElementById('aspects-grid');
  if (!grid) return;
  const icons = {
    quality: 'fa-star', value: 'fa-coins', delivery: 'fa-truck',
    service: 'fa-headset', durability: 'fa-shield-halved', usability: 'fa-sliders'
  };
  const colors = {
    quality: 'blue', value: 'green', delivery: 'amber',
    service: 'purple', durability: 'cyan', usability: 'rose'
  };
  grid.innerHTML = Object.entries(aspects).map(([k, v]) => {
    const score = v.score || 0;
    const icon  = icons[k] || 'fa-circle';
    const col   = colors[k] || 'blue';
    const barColor = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    return `
      <div class="aspect-bar-container">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-300">
            <i class="fas ${icon} text-${col}-400 text-xs"></i>
            ${capitalize(k)}
          </div>
          <span class="text-xs font-bold text-white">${score.toFixed(0)}</span>
        </div>
        <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-700" style="width:${score}%; background:${barColor}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Dedicated Sentiment Section ─────────────────────────────────────────
function renderSentimentSection(s) {
  if (!s) return;
  const fmt1 = v => `${v}%`;

  setText('sent-pos-big', fmt1(s.positive_pct));
  setText('sent-neu-big', fmt1(s.neutral_pct));
  setText('sent-neg-big', fmt1(s.negative_pct));
  setText('sent-score-big', s.score || '--');
  setText('sent-polarity-display', `Polarity: ${s.polarity || 0} · ${s.label || ''}`);
  setText('sentiment-label-display', s.label || '');

  setTimeout(() => {
    setBarWidth('sent-pos-bar2', s.positive_pct);
    setBarWidth('sent-neu-bar2', s.neutral_pct);
    setBarWidth('sent-neg-bar2', s.negative_pct);
  }, 300);
}

// ─── Offline Stores Price Comparison ──────────────────────────────────────
function renderOfflineStores(priceComparison) {
  if (!priceComparison) return;
  const fmt = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
  const grid = document.getElementById('offline-stores-grid');
  const strip = document.getElementById('offline-summary-strip');

  // Summary strip
  if (strip && priceComparison.online_best) {
    setText('compare-online-best', fmt(priceComparison.online_best));
    setText('compare-offline-best', fmt(priceComparison.offline_best));
    const rec = priceComparison.recommendation;
    const saveAmt = priceComparison.you_save_online;
    const recEl = document.getElementById('compare-recommendation');
    if (recEl) {
      if (rec === 'online' && saveAmt > 0) {
        recEl.innerHTML = `<span class="text-green-400"><i class="fas fa-trophy mr-1"></i>Buy Online — Save ${fmt(saveAmt)} more vs offline</span>`;
      } else if (rec === 'offline') {
        recEl.innerHTML = `<span class="text-amber-400"><i class="fas fa-store mr-1"></i>Offline may offer better deal today</span>`;
      } else {
        recEl.innerHTML = `<span class="text-blue-400"><i class="fas fa-balance-scale mr-1"></i>Similar pricing across channels</span>`;
      }
    }
    strip.classList.remove('hidden');
  }

  // Store cards
  if (!grid) return;
  const stores = priceComparison.offline_stores || [];
  if (stores.length === 0) {
    grid.innerHTML = `<div class="text-slate-500 text-sm col-span-3 text-center py-4">No offline store data available for this product.</div>`;
    return;
  }

  const mrp = priceComparison.mrp || 0;
  grid.innerHTML = stores.map(store => {
    const discPct = store.discount_pct || 0;
    const avail = store.availability || 'Available';
    const isAvail = avail === 'Available';
    return `
      <a href="${escapeHtml(store.url)}" target="_blank" rel="noopener"
         class="block p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-amber-500/40 hover:bg-slate-800 transition-all group">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">${store.icon || '🏪'}</span>
            <span class="text-sm font-semibold text-white">${escapeHtml(store.store)}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium ${isAvail ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}">
            ${escapeHtml(avail)}
          </span>
        </div>
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-xl font-black text-amber-300 price-mono">${fmt(store.price)}</span>
          ${mrp > store.price ? `<span class="text-xs text-slate-500 line-through price-mono">${fmt(mrp)}</span>` : ''}
          ${discPct > 0 ? `<span class="text-xs font-bold text-green-400">${discPct}% OFF</span>` : ''}
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500"><i class="fas fa-store mr-1"></i>In-store pickup</span>
          <span class="text-blue-400 group-hover:text-blue-300 transition-colors">
            Visit Store <i class="fas fa-arrow-up-right-from-square text-[9px] ml-1"></i>
          </span>
        </div>
      </a>
    `;
  }).join('');
}

// Telemetry Grid
function renderTelemetry(telemetry, timestamp) {
  const tbody = document.getElementById('telemetry-body');
  if (!tbody) return;
  const fmt = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
  const platformIcons = {
    'Amazon':          '<i class="fab fa-amazon text-orange-400"></i>',
    'Flipkart':        '<i class="fas fa-shopping-bag text-blue-400"></i>',
    'Myntra':          '<i class="fas fa-tshirt text-pink-400"></i>',
    'JioMart':         '<i class="fas fa-store text-green-400"></i>',
    'Google Shopping': '<i class="fab fa-google text-green-400"></i>',
  };
  tbody.innerHTML = telemetry.map(row => {
    const icon = platformIcons[row.platform] || '<i class="fas fa-store text-slate-400"></i>';
    const starsN = Math.round(row.avg_rating || 0);
    const stars = '★'.repeat(starsN) + '☆'.repeat(Math.max(0, 5 - starsN));
    const badge = row.badge ? `<span class="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded">${escapeHtml(row.badge)}</span>` : '';
    const disc  = row.best_discount && row.best_discount !== '0%' ?
      `<span class="ml-1 text-[10px] text-green-400 font-semibold">${row.best_discount} off</span>` : '';
    const stock = row.in_stock ?
      '<span class="text-[10px] text-green-400">● Stock</span>' :
      '<span class="text-[10px] text-red-400">● OOS</span>';
    const src_badge = row.market_source === 'live_scrape' ?
      '<span class="ml-1 text-[9px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>' :
      '<span class="ml-1 text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">INTEL</span>';
    return `
      <tr class="cursor-pointer hover:bg-slate-800/40 transition-colors" onclick="window.open('${row.url || '#'}', '_blank')">
        <td>
          <div class="flex items-center gap-2">${icon}<span class="font-medium">${escapeHtml(row.platform)}</span>${src_badge}</div>
        </td>
        <td class="max-w-[200px]">
          <div class="truncate text-xs text-slate-300 mb-1">${escapeHtml(row.best_title || '—')}</div>
          <div class="font-bold text-green-400 text-sm price-mono">${fmt(row.best_price)}${disc}${badge}</div>
        </td>
        <td class="price-mono text-green-400 font-bold text-sm">${fmt(row.min_price)}</td>
        <td class="price-mono text-white">${fmt(row.avg_price)}</td>
        <td class="price-mono text-slate-400">${fmt(row.mrp || row.max_price)}</td>
        <td>
          <div class="stars text-xs text-amber-400">${stars}</div>
          <div class="text-xs text-slate-500">${row.avg_rating || '—'}/5</div>
        </td>
        <td>
          <div class="text-xs text-slate-400">${escapeHtml(row.delivery || '—')}</div>
          <div class="mt-0.5">${stock}</div>
        </td>
      </tr>
    `;
  }).join('');

  const tsEl = document.getElementById('telemetry-timestamp');
  if (tsEl && timestamp) {
    tsEl.textContent = 'Last scan: ' + new Date(timestamp).toLocaleTimeString();
  }
}

// Charts
function renderCharts(data) {
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }
  };

  // Price Chart
  const priceCtx = document.getElementById('priceChart');
  if (priceCtx) {
    if (priceChartInst) priceChartInst.destroy();
    const labels = data.telemetry.map(r => r.platform);
    priceChartInst = new Chart(priceCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Min Price (₹)',
            data: data.telemetry.map(r => r.min_price),
            backgroundColor: 'rgba(34,197,94,0.7)',
            borderRadius: 6,
          },
          {
            label: 'Avg Price (₹)',
            data: data.telemetry.map(r => r.avg_price),
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderRadius: 6,
          },
          {
            label: 'Max Price (₹)',
            data: data.telemetry.map(r => r.max_price),
            backgroundColor: 'rgba(100,116,139,0.5)',
            borderRadius: 6,
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } },
          y: {
            ticks: { color: '#64748b', callback: v => '₹' + v.toLocaleString('en-IN') },
            grid: { color: 'rgba(51,65,85,0.3)' }
          }
        }
      }
    });
  }

  // Sentiment Doughnut
  const sentCtx = document.getElementById('sentimentChart');
  if (sentCtx) {
    if (sentimentChartInst) sentimentChartInst.destroy();
    const s = data.sentiment;
    sentimentChartInst = new Chart(sentCtx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [s.positive_pct, s.neutral_pct, s.negative_pct],
          backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(100,116,139,0.6)', 'rgba(239,68,68,0.7)'],
          borderColor: ['#22c55e', '#64748b', '#ef4444'],
          borderWidth: 1,
          hoverOffset: 8,
        }]
      },
      options: {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toFixed(1)}%` }
          }
        }
      }
    });
  }
}

// Product Cards
function renderProducts(platformData) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const allProducts = [];
  const platformIcons = {
    amazon:   '<i class="fab fa-amazon text-orange-400"></i>',
    flipkart: '<i class="fas fa-shopping-bag text-blue-400"></i>',
    myntra:   '<i class="fas fa-tshirt text-pink-400"></i>',
    jiomart:  '<i class="fas fa-store text-green-400"></i>',
    google:   '<i class="fab fa-google text-cyan-400"></i>',
  };

  Object.entries(platformData).forEach(([platform, pd]) => {
    if (pd.products) {
      pd.products.slice(0, 2).forEach(p => {
        allProducts.push({ ...p, _platform_key: platform });
      });
    }
  });

  // Sort products by price ascending
  allProducts.sort((a, b) => (a.price || 0) - (b.price || 0));

  grid.innerHTML = allProducts.slice(0, 12).map(p => {
    const pkey  = (p._platform_key || '').toLowerCase();
    const icon  = platformIcons[pkey] || '<i class="fas fa-store text-slate-400"></i>';
    const fmt   = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
    const starsN = Math.round(p.rating || 0);
    const stars  = '★'.repeat(starsN) + '☆'.repeat(Math.max(0, 5 - starsN));
    const badge  = p.badge ? `<span class="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] rounded-full font-medium">${escapeHtml(p.badge)}</span>` : '';
    const stock  = p.in_stock ?
      '<span class="text-green-400 text-[11px] font-medium">● In Stock</span>' :
      '<span class="text-red-400 text-[11px]">● Out of Stock</span>';
    const discPct = p.discount_pct || (p.mrp && p.price ? Math.round((p.mrp - p.price) / p.mrp * 100) : 0);
    const discBadge = discPct > 2 ?
      `<span class="text-[10px] font-bold text-white bg-green-600/80 px-1.5 py-0.5 rounded">${discPct}% OFF</span>` : '';
    const mrpLine = p.mrp && p.mrp > p.price ?
      `<span class="text-xs text-slate-500 line-through price-mono">${fmt(p.mrp)}</span>` : '';
    const isLive = p.market_source === 'live_scrape';
    const srcTag = isLive ?
      '<span class="text-[9px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded font-semibold">LIVE</span>' :
      '<span class="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">INTEL</span>';

    return `
      <div class="product-card cursor-pointer" onclick="window.open('${escapeHtml(p.url || '#')}', '_blank')">
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            ${icon} ${escapeHtml(p.platform || pkey)}
          </div>
          <div class="flex items-center gap-1">${badge}${srcTag}</div>
        </div>
        <h4 class="text-sm font-semibold text-white mb-2.5 leading-snug" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(p.title || '—')}</h4>
        <div class="flex items-baseline gap-2 mb-2 flex-wrap">
          <span class="text-xl font-black text-white price-mono">${fmt(p.price)}</span>
          ${mrpLine}
          ${discBadge}
        </div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1">
            <span class="text-amber-400 text-xs">${stars}</span>
            <span class="text-xs text-slate-500">${p.rating || 0} (${(p.review_count || 0).toLocaleString()})</span>
          </div>
          ${stock}
        </div>
        <div class="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <span><i class="fas fa-truck mr-1 text-blue-500/60"></i>${escapeHtml(p.delivery || '—')}</span>
          <span class="truncate max-w-[90px] text-right">${escapeHtml(p.seller || '—')}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Sentiment Snippets
function renderSnippets(snippets) {
  const grid = document.getElementById('snippets-grid');
  if (!grid || !snippets) return;
  const labelIcons = {
    Positive: '<i class="fas fa-smile text-green-400 text-xs"></i>',
    Negative: '<i class="fas fa-frown text-red-400 text-xs"></i>',
    Neutral:  '<i class="fas fa-meh text-slate-400 text-xs"></i>',
  };
  grid.innerHTML = snippets.map(s => `
    <div class="snippet-card ${s.label.toLowerCase()}">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 text-xs font-medium" style="color:${s.color === 'green' ? '#4ade80' : s.color === 'red' ? '#f87171' : '#94a3b8'}">
          ${labelIcons[s.label] || ''} ${s.label}
        </div>
        <span class="text-[10px] text-slate-600 font-mono">score: ${s.score.toFixed(2)}</span>
      </div>
      <p class="text-sm text-slate-300 leading-relaxed">"${escapeHtml(s.text)}"</p>
    </div>
  `).join('');
}

// ─── History ───────────────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const data = await apiFetch('/api/history');
    const list = document.getElementById('history-list');
    if (!list) return;
    if (!data || data.length === 0) {
      list.innerHTML = `
        <div class="text-slate-500 text-sm py-8 text-center">
          <i class="fas fa-clock text-2xl mb-3 block"></i>
          No searches yet. Analyze a product to see history here.
        </div>
      `;
      return;
    }
    list.innerHTML = data.map(h => {
      const cls = h.verdict?.includes('Buy') ? 'text-green-400' :
                  h.verdict?.includes('Wait') ? 'text-amber-400' :
                  h.verdict?.includes('Consider') ? 'text-purple-400' : 'text-red-400';
      const ts  = h.timestamp ? new Date(h.timestamp).toLocaleString() : '—';
      return `
        <div class="history-item" onclick="quickSearch('${escapeHtml(h.query)}'); switchTab('analyze')">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-search text-blue-400 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-white text-sm">${escapeHtml(h.query)}</div>
            <div class="text-xs text-slate-500 mt-0.5">${ts}</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold ${cls}">${escapeHtml(h.verdict || '—')}</div>
            <div class="text-xs text-slate-500">Score: ${h.quality_score || '—'}</div>
          </div>
          <i class="fas fa-chevron-right text-slate-600 text-xs"></i>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('History error:', e);
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const data = await apiFetch('/api/stats');
    setText('stat-total', data.total || 0);
    setText('stat-buy',   data.buy || 0);
    setText('stat-wait',  data.wait || 0);
    setText('stat-avoid', data.avoid || 0);

    // Stats doughnut
    const ctx = document.getElementById('statsChart');
    if (ctx && (data.total > 0)) {
      if (statsChartInst) statsChartInst.destroy();
      statsChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Buy Now', 'Wait & Watch', 'Avoid/Consider'],
          datasets: [{
            data: [data.buy, data.wait, (data.avoid || 0)],
            backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.7)'],
            borderColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderWidth: 1,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
          }
        }
      });
    }
  } catch (e) {
    console.error('Stats error:', e);
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setBarWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Toast Notification ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast  = document.getElementById('toast');
  const inner  = document.getElementById('toast-inner');
  const icon   = document.getElementById('toast-icon');
  const msgEl  = document.getElementById('toast-msg');
  if (!toast) return;

  const cfg = {
    success: { icon: 'fas fa-check-circle text-green-400', border: 'rgba(34,197,94,0.3)' },
    error:   { icon: 'fas fa-times-circle text-red-400',   border: 'rgba(239,68,68,0.3)' },
    info:    { icon: 'fas fa-info-circle text-blue-400',   border: 'rgba(59,130,246,0.3)' },
    warn:    { icon: 'fas fa-exclamation-triangle text-amber-400', border: 'rgba(245,158,11,0.3)' }
  };
  const c = cfg[type] || cfg.info;
  icon.className = c.icon + ' text-base';
  inner.style.borderColor = c.border;
  msgEl.textContent = msg;

  toast.classList.remove('translate-y-4', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}

// ─── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', checkAuth);
