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
  renderAspects(data.aspects);
  renderTelemetry(data.telemetry, data.timestamp);
  renderCharts(data);
  renderProducts(data.platform_data);
  renderSnippets(data.snippets);
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
  const fmt = v => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  setText('price-min', fmt(pi.min));
  setText('price-avg', fmt(pi.avg));
  setText('price-max', fmt(pi.max));
  setText('price-savings', `~${pi.savings}% avg discount`);
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

// Telemetry Grid
function renderTelemetry(telemetry, timestamp) {
  const tbody = document.getElementById('telemetry-body');
  if (!tbody) return;
  const fmt = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
  const platformIcons = {
    'Amazon':          '<i class="fab fa-amazon text-orange-400"></i>',
    'Flipkart':        '<i class="fas fa-shopping-bag text-blue-400"></i>',
    'Myntra':          '<i class="fas fa-tshirt text-pink-400"></i>',
    'Google Shopping': '<i class="fab fa-google text-green-400"></i>',
  };
  tbody.innerHTML = telemetry.map(row => {
    const icon = platformIcons[row.platform] || '<i class="fas fa-store text-slate-400"></i>';
    const stars = '★'.repeat(Math.round(row.avg_rating || 0));
    const badge = row.badge ? `<span class="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded">${row.badge}</span>` : '';
    return `
      <tr>
        <td><div class="flex items-center gap-2">${icon}<span class="font-medium">${row.platform}</span></div></td>
        <td class="max-w-[180px]">
          <div class="truncate text-xs text-slate-300">${escapeHtml(row.best_title || '—')}</div>
          <div class="font-bold text-green-400 text-sm price-mono">${fmt(row.best_price)}${badge}</div>
        </td>
        <td class="price-mono text-green-400 font-semibold">${fmt(row.min_price)}</td>
        <td class="price-mono text-white">${fmt(row.avg_price)}</td>
        <td class="price-mono text-slate-400">${fmt(row.max_price)}</td>
        <td>
          <div class="stars text-xs">${stars}</div>
          <div class="text-xs text-slate-500">${row.avg_rating || '—'}/5</div>
        </td>
        <td class="text-slate-400">${row.products}</td>
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
    amazon: '<i class="fab fa-amazon text-orange-400"></i>',
    flipkart: '<i class="fas fa-shopping-bag text-blue-400"></i>',
    myntra: '<i class="fas fa-tshirt text-pink-400"></i>',
    google: '<i class="fab fa-google text-green-400"></i>',
  };

  Object.entries(platformData).forEach(([platform, pd]) => {
    if (pd.products) {
      pd.products.slice(0, 2).forEach(p => {
        allProducts.push({ ...p, _platform_key: platform });
      });
    }
  });

  grid.innerHTML = allProducts.slice(0, 9).map(p => {
    const icon   = platformIcons[p._platform_key] || '<i class="fas fa-store text-slate-400"></i>';
    const fmt    = v => v ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';
    const stars  = '★'.repeat(Math.round(p.rating || 0)) + '☆'.repeat(5 - Math.round(p.rating || 0));
    const badge  = p.badge ? `<span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-medium">${p.badge}</span>` : '';
    const stock  = p.in_stock ? '<span class="text-green-400 text-xs">● In Stock</span>' : '<span class="text-red-400 text-xs">● Out of Stock</span>';
    const disc   = p.discount && p.discount !== '0%' ? `<span class="text-green-400 text-xs ml-1">${p.discount} off</span>` : '';

    return `
      <div class="product-card">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            ${icon} ${(p.platform || p._platform_key).toUpperCase()}
          </div>
          ${badge}
        </div>
        <h4 class="text-sm font-semibold text-white mb-2 line-clamp-2 leading-snug">${escapeHtml(p.title || '—')}</h4>
        <div class="flex items-baseline gap-2 mb-2">
          <span class="text-xl font-black text-white price-mono">${fmt(p.price)}</span>
          ${p.original_price > p.price ? `<span class="text-xs text-slate-500 line-through price-mono">${fmt(p.original_price)}</span>` : ''}
          ${disc}
        </div>
        <div class="flex items-center justify-between">
          <div>
            <span class="stars text-xs">${stars}</span>
            <span class="text-xs text-slate-500 ml-1">${p.rating} (${(p.review_count || 0).toLocaleString()})</span>
          </div>
          ${stock}
        </div>
        <div class="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <span><i class="fas fa-truck mr-1 text-blue-500/70"></i>${p.delivery || '—'}</span>
          <span>${p.seller || '—'}</span>
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
