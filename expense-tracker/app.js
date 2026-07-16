/* =====================================================
   EXPENSE TRACKER — app.js
   ===================================================== */

'use strict';

/* ─── Constants ─────────────────────────────────── */
const STORAGE_KEY   = 'expenseTracker_v2_transactions';
const BUDGET_KEY    = 'expenseTracker_v2_budgets';

const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',     icon: 'fa-utensils',         color: '#f97316' },
  { id: 'transport',     label: 'Transportation',    icon: 'fa-car',              color: '#3b82f6' },
  { id: 'housing',       label: 'Housing & Rent',    icon: 'fa-house',            color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment',     icon: 'fa-film',             color: '#ec4899' },
  { id: 'shopping',      label: 'Shopping',          icon: 'fa-bag-shopping',     color: '#14b8a6' },
  { id: 'health',        label: 'Health & Medical',  icon: 'fa-heart-pulse',      color: '#ef4444' },
  { id: 'education',     label: 'Education',         icon: 'fa-graduation-cap',   color: '#f59e0b' },
  { id: 'utilities',     label: 'Utilities & Bills', icon: 'fa-bolt',             color: '#84cc16' },
  { id: 'personal',      label: 'Personal Care',     icon: 'fa-spa',              color: '#a78bfa' },
  { id: 'travel',        label: 'Travel',            icon: 'fa-plane',            color: '#06b6d4' },
  { id: 'gifts',         label: 'Gifts & Charity',   icon: 'fa-gift',             color: '#fb7185' },
  { id: 'other_exp',     label: 'Other',             icon: 'fa-circle-dot',       color: '#6b7280' },
];

const INCOME_CATEGORIES = [
  { id: 'salary',     label: 'Salary & Wages',    icon: 'fa-briefcase',    color: '#22c55e' },
  { id: 'freelance',  label: 'Freelance',         icon: 'fa-laptop-code',  color: '#34d399' },
  { id: 'business',   label: 'Business',          icon: 'fa-store',        color: '#4ade80' },
  { id: 'investment', label: 'Investments',       icon: 'fa-chart-line',   color: '#86efac' },
  { id: 'rental',     label: 'Rental Income',     icon: 'fa-building',     color: '#6ee7b7' },
  { id: 'gift_inc',   label: 'Gifts Received',    icon: 'fa-hand-holding-dollar', color: '#a3e635' },
  { id: 'other_inc',  label: 'Other Income',      icon: 'fa-circle-dot',   color: '#6b7280' },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/* ─── State ─────────────────────────────────────── */
let transactions = [];
let budgets      = [];
let currentPage  = 'dashboard';
let txCurrentPage = 1;
const TX_PER_PAGE = 10;
let deleteTargetId = null;
let currentTxType  = 'expense';
let monthlyBarChart    = null;
let expensePieChart    = null;
let trendLineChart     = null;
let incomePieChart     = null;
let expensePieChart2   = null;

/* ─── Persistence ───────────────────────────────── */
function loadData() {
  try {
    transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    budgets      = JSON.parse(localStorage.getItem(BUDGET_KEY)  || '[]');
  } catch { transactions = []; budgets = []; }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(BUDGET_KEY,  JSON.stringify(budgets));
}

/* ─── Helpers ───────────────────────────────────── */
function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getCategory(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { label: id, icon: 'fa-circle-dot', color: '#6b7280' };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* Get month key from transaction date: "2024-05" */
function txMonth(tx) { return tx.date.slice(0, 7); }

/* Get currently selected month key "YYYY-MM" */
function selectedMonthKey() {
  return document.getElementById('monthFilter').value;
}

function filterByMonth(list, month) {
  return list.filter(t => txMonth(t) === month);
}

/* ─── Month Filter Dropdown ─────────────────────── */
function buildMonthFilter() {
  const sel = document.getElementById('monthFilter');
  const months = new Set(transactions.map(t => txMonth(t)));
  // Always include last 12 months
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.add(d.toISOString().slice(0,7));
  }
  const sorted = [...months].sort((a,b) => b.localeCompare(a));
  const current = sel.value || sorted[0];
  sel.innerHTML = sorted.map(m => {
    const [y, mo] = m.split('-');
    const label = new Date(+y, +mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `<option value="${m}"${m === current ? ' selected' : ''}>${label}</option>`;
  }).join('');
}

/* ─── Navigation ────────────────────────────────── */
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('pageTitle').textContent = {
    dashboard: 'Dashboard', transactions: 'Transactions',
    analytics: 'Analytics', budget: 'Budget Goals'
  }[page];
  currentPage = page;
  renderPage(page);
}

/* ─── Full Render ───────────────────────────────── */
function renderAll() {
  buildMonthFilter();
  renderPage(currentPage);
}

function renderPage(page) {
  if (page === 'dashboard')    renderDashboard();
  if (page === 'transactions') renderTransactions();
  if (page === 'analytics')    renderAnalytics();
  if (page === 'budget')       renderBudget();
}

/* ─── DASHBOARD ─────────────────────────────────── */
function renderDashboard() {
  const month = selectedMonthKey();
  const monthly = filterByMonth(transactions, month);
  const income  = monthly.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = monthly.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const balance = income - expense;
  const rate    = income > 0 ? ((income - expense) / income * 100) : 0;

  document.getElementById('totalBalance').textContent  = fmt(balance);
  document.getElementById('totalIncome').textContent   = fmt(income);
  document.getElementById('totalExpense').textContent  = fmt(expense);
  document.getElementById('savingsRate').textContent   = rate.toFixed(1) + '%';

  const [y, m] = month.split('-');
  document.getElementById('monthlySubtitle').textContent =
    new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  renderMonthlyBarChart(month);
  renderExpensePieChart(monthly);
  renderRecentTransactions(monthly);
}

/* Monthly bar chart — daily expenses/income for selected month */
function renderMonthlyBarChart(month) {
  const [year, mo] = month.split('-').map(Number);
  const days = new Date(year, mo, 0).getDate();
  const labels = Array.from({length: days}, (_,i) => String(i+1));
  const inc  = new Array(days).fill(0);
  const exp  = new Array(days).fill(0);

  filterByMonth(transactions, month).forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10) - 1;
    if (t.type === 'income')  inc[day]  += t.amount;
    else                      exp[day] += t.amount;
  });

  const ctx = document.getElementById('monthlyBarChart').getContext('2d');
  if (monthlyBarChart) monthlyBarChart.destroy();

  monthlyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',  data: inc,  backgroundColor: 'rgba(34,197,94,.7)',  borderRadius: 4, borderSkipped: false },
        { label: 'Expense', data: exp,  backgroundColor: 'rgba(248,113,113,.7)', borderRadius: 4, borderSkipped: false },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8b90a7', boxWidth: 12 } }, tooltip: { callbacks: { label: ctx => fmt(ctx.parsed.y) } } },
      scales: {
        x: { ticks: { color: '#555a72', font: { size: 10 } }, grid: { color: '#2e3145' } },
        y: { ticks: { color: '#8b90a7', callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }, grid: { color: '#2e3145' }, beginAtZero: true },
      }
    }
  });
}

/* Expense pie (donut) for dashboard */
function renderExpensePieChart(monthly) {
  const expenses = monthly.filter(t => t.type === 'expense');
  const noData   = document.getElementById('pieNoData');
  const ctx      = document.getElementById('expensePieChart').getContext('2d');
  if (expensePieChart) expensePieChart.destroy();

  if (!expenses.length) {
    noData.classList.remove('hidden');
    return;
  }
  noData.classList.add('hidden');

  const grouped = {};
  expenses.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
  const cats   = Object.keys(grouped);
  const vals   = cats.map(c => grouped[c]);
  const colors = cats.map(c => getCategory(c).color);

  expensePieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: cats.map(c => getCategory(c).label), datasets: [{ data: vals, backgroundColor: colors, borderWidth: 2, borderColor: '#20232f', hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8b90a7', boxWidth: 10, padding: 8, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` } }
      }
    }
  });
}

/* Recent transactions list */
function renderRecentTransactions(monthly) {
  const list = document.getElementById('recentTxList');
  const sorted = [...monthly].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);
  if (!sorted.length) {
    list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>No transactions yet. Add one above!</p></div>`;
    return;
  }
  list.innerHTML = sorted.map(t => buildTxItemHTML(t)).join('');
}

function buildTxItemHTML(t) {
  const cat = getCategory(t.category);
  return `
  <div class="tx-item">
    <div class="tx-icon ${t.type}-icon"><i class="fa-solid ${cat.icon}"></i></div>
    <div class="tx-meta">
      <div class="tx-desc">${escHtml(t.description)}</div>
      <div class="tx-cat">${cat.label}${t.tags ? ' · ' + escHtml(t.tags) : ''}</div>
    </div>
    <div class="tx-right">
      <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</div>
      <div class="tx-date">${fmtDate(t.date)}</div>
    </div>
  </div>`;
}

/* ─── TRANSACTIONS TABLE ────────────────────────── */
function getFilteredTx() {
  const type   = document.getElementById('filterType').value;
  const cat    = document.getElementById('filterCategory').value;
  const search = document.getElementById('filterSearch').value.toLowerCase();
  const month  = selectedMonthKey();

  return filterByMonth(transactions, month)
    .filter(t => (type === 'all' || t.type === type))
    .filter(t => (cat  === 'all' || t.category === cat))
    .filter(t => !search || t.description.toLowerCase().includes(search) || (t.notes||'').toLowerCase().includes(search) || (t.tags||'').toLowerCase().includes(search))
    .sort((a,b) => b.date.localeCompare(a.date));
}

function renderTransactions() {
  populateCategoryFilter();
  const filtered = getFilteredTx();
  const total    = filtered.length;
  const pages    = Math.max(1, Math.ceil(total / TX_PER_PAGE));
  if (txCurrentPage > pages) txCurrentPage = 1;
  const paged = filtered.slice((txCurrentPage-1)*TX_PER_PAGE, txCurrentPage*TX_PER_PAGE);

  const tbody = document.getElementById('txTableBody');
  const empty = document.getElementById('txEmptyState');

  if (!paged.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    tbody.innerHTML = paged.map(t => {
      const cat = getCategory(t.category);
      return `
      <tr>
        <td>${fmtDate(t.date)}</td>
        <td>
          <div style="font-weight:600;font-size:.88rem">${escHtml(t.description)}</div>
          ${t.notes ? `<div style="font-size:.75rem;color:var(--text-muted)">${escHtml(t.notes)}</div>` : ''}
        </td>
        <td><span class="cat-badge"><i class="fa-solid ${cat.icon}" style="color:${cat.color}"></i>${cat.label}</span></td>
        <td><span class="badge badge-${t.type}">${t.type}</span></td>
        <td class="text-right" style="font-weight:700;color:var(--${t.type}-color)">${t.type==='income'?'+':'-'}${fmt(t.amount)}</td>
        <td>
          <div class="table-actions">
            <button class="icon-btn icon-btn-edit"   title="Edit"   onclick="openEditTx('${t.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn icon-btn-delete" title="Delete" onclick="confirmDelete('${t.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  renderPagination(pages);
}

function renderPagination(pages) {
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML = ''; return; }
  let html = '';
  html += `<button class="page-btn" ${txCurrentPage===1?'disabled':''} onclick="goPage(${txCurrentPage-1})"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i > 2 && i < pages-1 && Math.abs(i - txCurrentPage) > 1) {
      if (i === 3 || i === pages-2) html += `<span class="page-btn" style="pointer-events:none">…</span>`;
      continue;
    }
    html += `<button class="page-btn${i===txCurrentPage?' active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${txCurrentPage===pages?'disabled':''} onclick="goPage(${txCurrentPage+1})"><i class="fa-solid fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}

function goPage(n) { txCurrentPage = n; renderTransactions(); }

function populateCategoryFilter() {
  const sel = document.getElementById('filterCategory');
  const prev = sel.value;
  sel.innerHTML = `<option value="all">All Categories</option>` +
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(c =>
      `<option value="${c.id}">${c.label}</option>`
    ).join('');
  if (prev) sel.value = prev;
}

/* ─── ANALYTICS ─────────────────────────────────── */
function renderAnalytics() {
  render12MonthTrend();
  const month = selectedMonthKey();
  const monthly = filterByMonth(transactions, month);
  renderDonutChart('incomePieChart',   'incomePieNoData',  monthly.filter(t=>t.type==='income'),  INCOME_CATEGORIES);
  renderDonutChart('expensePieChart2', 'expensePieNoData', monthly.filter(t=>t.type==='expense'), EXPENSE_CATEGORIES);
  renderCatSummary(monthly);
}

function render12MonthTrend() {
  const now = new Date();
  const labels = [];
  const inc  = [];
  const exp  = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0,7);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    const monthly = filterByMonth(transactions, key);
    inc.push( monthly.filter(t=>t.type==='income') .reduce((s,t)=>s+t.amount,0));
    exp.push( monthly.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0));
  }

  const ctx = document.getElementById('trendLineChart').getContext('2d');
  if (trendLineChart) trendLineChart.destroy();

  trendLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Income',  data: inc, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.1)',  tension: .4, fill: true, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Expense', data: exp, borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,.1)', tension: .4, fill: true, pointRadius: 4, pointHoverRadius: 6 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#8b90a7', boxWidth: 12 } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } } },
      scales: {
        x: { ticks: { color: '#8b90a7' }, grid: { color: '#2e3145' } },
        y: { ticks: { color: '#8b90a7', callback: v => '$' + (v>=1000?(v/1000).toFixed(1)+'k':v) }, grid: { color: '#2e3145' }, beginAtZero: true }
      }
    }
  });
}

let incPieInst = null, expPie2Inst = null;
function renderDonutChart(canvasId, noDataId, list, catList) {
  const noData = document.getElementById(noDataId);
  const ctx    = document.getElementById(canvasId).getContext('2d');
  // destroy old
  if (canvasId === 'incomePieChart'   && incPieInst)  { incPieInst.destroy();  incPieInst  = null; }
  if (canvasId === 'expensePieChart2' && expPie2Inst) { expPie2Inst.destroy(); expPie2Inst = null; }

  if (!list.length) { noData.classList.remove('hidden'); return; }
  noData.classList.add('hidden');

  const grouped = {};
  list.forEach(t => { grouped[t.category] = (grouped[t.category]||0) + t.amount; });
  const keys   = Object.keys(grouped);
  const vals   = keys.map(k => grouped[k]);
  const colors = keys.map(k => getCategory(k).color);

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: keys.map(k=>getCategory(k).label), datasets: [{ data: vals, backgroundColor: colors, borderWidth: 2, borderColor: '#20232f', hoverOffset: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: '#8b90a7', boxWidth: 10, padding: 8, font: { size: 11 } } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.parsed)}` } } }
    }
  });
  if (canvasId === 'incomePieChart')   incPieInst  = chart;
  if (canvasId === 'expensePieChart2') expPie2Inst = chart;
}

function renderCatSummary(monthly) {
  const grid = document.getElementById('catSummaryGrid');
  if (!monthly.length) { grid.innerHTML = '<p class="text-muted" style="padding:12px">No transactions for this month.</p>'; return; }

  const grouped = {};
  monthly.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = { total: 0, count: 0, type: t.type };
    grouped[t.category].total += t.amount;
    grouped[t.category].count++;
  });

  const maxVal = Math.max(...Object.values(grouped).map(g => g.total));
  grid.innerHTML = Object.entries(grouped)
    .sort((a,b) => b[1].total - a[1].total)
    .map(([id, g]) => {
      const cat  = getCategory(id);
      const pct  = maxVal > 0 ? (g.total / maxVal * 100).toFixed(1) : 0;
      return `
      <div class="cat-summary-item">
        <div class="cat-name">
          <div class="cat-icon" style="background:${cat.color}22;color:${cat.color}"><i class="fa-solid ${cat.icon}"></i></div>
          ${cat.label}
        </div>
        <div class="cat-amount" style="color:${g.type==='income'?'var(--income-color)':'var(--expense-color)'}">${fmt(g.total)}</div>
        <div class="cat-count">${g.count} transaction${g.count!==1?'s':''}</div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
      </div>`;
    }).join('');
}

/* ─── BUDGET GOALS ──────────────────────────────── */
function renderBudget() {
  const list  = document.getElementById('budgetList');
  const empty = document.getElementById('budgetEmptyState');
  const month = selectedMonthKey();
  const monthly = filterByMonth(transactions, month).filter(t=>t.type==='expense');

  if (!budgets.length) {
    empty.classList.remove('hidden');
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }
  empty.classList.add('hidden');

  list.innerHTML = budgets.map(b => {
    const cat      = getCategory(b.category);
    const spent    = monthly.filter(t=>t.category===b.category).reduce((s,t)=>s+t.amount,0);
    const pct      = Math.min(100, (spent / b.limit * 100));
    const over     = spent > b.limit;
    const barColor = over ? 'var(--expense-color)' : pct > 80 ? 'var(--warning)' : 'var(--income-color)';
    return `
    <div class="budget-item">
      <div class="budget-item-header">
        <div class="cat-label">
          <div class="cat-icon" style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.8rem;background:${cat.color}22;color:${cat.color}">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          ${cat.label}
        </div>
        <span class="budget-amounts">${fmt(spent)} / ${fmt(b.limit)}</span>
      </div>
      <div class="budget-progress">
        <div class="budget-progress-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="budget-footer">
        <span>${pct.toFixed(1)}% used${over ? ' — <span style="color:var(--expense-color)">Over budget!</span>' : ''}</span>
        <span>${over ? fmt(spent - b.limit) + ' over' : fmt(b.limit - spent) + ' remaining'}</span>
      </div>
      <div class="budget-delete">
        <button class="icon-btn icon-btn-delete" title="Delete goal" onclick="deleteBudget('${b.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

/* ─── ADD/EDIT TRANSACTION MODAL ────────────────── */
function openAddModal() {
  document.getElementById('txId').value          = '';
  document.getElementById('txAmount').value      = '';
  document.getElementById('txDate').value        = todayStr();
  document.getElementById('txDescription').value = '';
  document.getElementById('txNotes').value       = '';
  document.getElementById('txTags').value        = '';
  document.getElementById('txModalTitle').textContent = 'Add Transaction';
  document.getElementById('txSaveBtn').textContent    = 'Save Transaction';
  setTxType('expense');
  openModal('txModalOverlay');
}

function openEditTx(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;
  document.getElementById('txId').value          = t.id;
  document.getElementById('txAmount').value      = t.amount;
  document.getElementById('txDate').value        = t.date;
  document.getElementById('txDescription').value = t.description;
  document.getElementById('txNotes').value       = t.notes || '';
  document.getElementById('txTags').value        = t.tags  || '';
  document.getElementById('txModalTitle').textContent = 'Edit Transaction';
  document.getElementById('txSaveBtn').textContent    = 'Update Transaction';
  setTxType(t.type);
  document.getElementById('txCategory').value = t.category;
  openModal('txModalOverlay');
}

function setTxType(type) {
  currentTxType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  populateCategorySelect(type);
}

function populateCategorySelect(type) {
  const sel  = document.getElementById('txCategory');
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  sel.innerHTML = cats.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
}

function saveTx(e) {
  e.preventDefault();
  const id   = document.getElementById('txId').value;
  const amt  = parseFloat(document.getElementById('txAmount').value);
  const date = document.getElementById('txDate').value;
  const desc = document.getElementById('txDescription').value.trim();
  const cat  = document.getElementById('txCategory').value;
  const notes= document.getElementById('txNotes').value.trim();
  const tags = document.getElementById('txTags').value.trim();

  // Validation
  let valid = true;
  ['txAmount','txDate','txDescription','txCategory'].forEach(fid => {
    const el = document.getElementById(fid);
    el.classList.remove('error');
    if (!el.value.trim() || (fid === 'txAmount' && (isNaN(amt) || amt <= 0))) {
      el.classList.add('error'); valid = false;
    }
  });
  if (!valid) { showToast('Please fill in all required fields.', 'error'); return; }

  if (id) {
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      transactions[idx] = { ...transactions[idx], amount: amt, date, description: desc, category: cat, notes, tags, type: currentTxType };
      showToast('Transaction updated!', 'success');
    }
  } else {
    transactions.push({ id: uid(), amount: amt, date, description: desc, category: cat, notes, tags, type: currentTxType });
    showToast('Transaction added!', 'success');
  }

  saveData();
  closeModal('txModalOverlay');
  renderAll();
}

/* ─── DELETE TRANSACTION ────────────────────────── */
function confirmDelete(id) {
  deleteTargetId = id;
  openModal('deleteModalOverlay');
}

function doDelete() {
  transactions = transactions.filter(t => t.id !== deleteTargetId);
  saveData();
  closeModal('deleteModalOverlay');
  showToast('Transaction deleted.', 'info');
  renderAll();
}

/* ─── BUDGET MODAL ──────────────────────────────── */
function openBudgetModal() {
  const sel = document.getElementById('budgetCategory');
  sel.innerHTML = EXPENSE_CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  document.getElementById('budgetLimit').value = '';
  document.getElementById('budgetId').value    = '';
  openModal('budgetModalOverlay');
}

function saveBudget(e) {
  e.preventDefault();
  const cat   = document.getElementById('budgetCategory').value;
  const limit = parseFloat(document.getElementById('budgetLimit').value);
  if (!cat || isNaN(limit) || limit <= 0) { showToast('Invalid budget values.', 'error'); return; }

  const existing = budgets.findIndex(b => b.category === cat);
  if (existing !== -1) { budgets[existing].limit = limit; }
  else budgets.push({ id: uid(), category: cat, limit });

  saveData();
  closeModal('budgetModalOverlay');
  showToast('Budget goal saved!', 'success');
  renderBudget();
}

function deleteBudget(id) {
  budgets = budgets.filter(b => b.id !== id);
  saveData();
  showToast('Budget goal removed.', 'info');
  renderBudget();
}

/* ─── MODAL HELPERS ─────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ─── TOAST ─────────────────────────────────────── */
const TOAST_ICONS = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${TOAST_ICONS[type]}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('removing'); el.addEventListener('animationend', () => el.remove()); }, 3000);
}

/* ─── SEED DATA ─────────────────────────────────── */
function seedDemoData() {
  if (transactions.length) return; // Don't overwrite existing data
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();

  const entries = [
    // Current month income
    { type:'income',  category:'salary',     description:'Monthly Salary',          amount:5200, day:1 },
    { type:'income',  category:'freelance',  description:'Web Design Project',       amount:850,  day:5 },
    // Current month expenses
    { type:'expense', category:'housing',    description:'Rent Payment',             amount:1400, day:1 },
    { type:'expense', category:'food',       description:'Grocery Shopping',         amount:280,  day:3 },
    { type:'expense', category:'transport',  description:'Monthly Bus Pass',         amount:85,   day:4 },
    { type:'expense', category:'utilities',  description:'Electricity Bill',         amount:95,   day:6 },
    { type:'expense', category:'food',       description:'Restaurant Dinner',        amount:62,   day:8 },
    { type:'expense', category:'entertainment', description:'Netflix Subscription',  amount:15,   day:9 },
    { type:'expense', category:'shopping',   description:'Clothing Purchase',        amount:140,  day:12 },
    { type:'expense', category:'health',     description:'Gym Membership',           amount:45,   day:13 },
    { type:'expense', category:'food',       description:'Coffee Shop',              amount:28,   day:15 },
    { type:'expense', category:'education',  description:'Online Course',            amount:79,   day:16 },
    { type:'expense', category:'transport',  description:'Uber Rides',               amount:42,   day:18 },
    { type:'expense', category:'personal',   description:'Haircut',                  amount:35,   day:20 },
    { type:'expense', category:'food',       description:'Weekly Groceries',         amount:195,  day:21 },
    { type:'income',  category:'investment', description:'Dividend Payment',         amount:120,  day:22 },
    { type:'expense', category:'entertainment', description:'Movie Tickets',         amount:38,   day:24 },
    { type:'expense', category:'utilities',  description:'Internet Bill',            amount:60,   day:25 },
  ];

  // Past months
  for (let mo = 1; mo <= 5; mo++) {
    const pm = m - mo;
    const py = pm < 0 ? y - 1 : y;
    const pmo = ((pm % 12) + 12) % 12;
    transactions.push(
      { id:uid(), type:'income',  category:'salary',    description:'Monthly Salary',   amount: 5000 + Math.random()*400|0,  date:`${py}-${String(pmo+1).padStart(2,'0')}-01` },
      { id:uid(), type:'expense', category:'housing',   description:'Rent Payment',     amount: 1400, date:`${py}-${String(pmo+1).padStart(2,'0')}-01` },
      { id:uid(), type:'expense', category:'food',      description:'Groceries',        amount: 300 + Math.random()*100|0,   date:`${py}-${String(pmo+1).padStart(2,'0')}-05` },
      { id:uid(), type:'expense', category:'transport', description:'Transport',        amount: 90  + Math.random()*50|0,    date:`${py}-${String(pmo+1).padStart(2,'0')}-08` },
      { id:uid(), type:'expense', category:'utilities', description:'Utilities',        amount: 120 + Math.random()*40|0,    date:`${py}-${String(pmo+1).padStart(2,'0')}-10` },
      { id:uid(), type:'income',  category:'freelance', description:'Freelance Work',   amount: 200 + Math.random()*600|0,   date:`${py}-${String(pmo+1).padStart(2,'0')}-15` },
      { id:uid(), type:'expense', category:'entertainment', description:'Entertainment', amount: 80 + Math.random()*60|0,   date:`${py}-${String(pmo+1).padStart(2,'0')}-20` },
    );
  }

  entries.forEach(e => {
    transactions.push({ id:uid(), type:e.type, category:e.category, description:e.description, amount:e.amount,
      date:`${y}-${String(m+1).padStart(2,'0')}-${String(e.day).padStart(2,'0')}`, notes:'', tags:'' });
  });

  budgets = [
    { id:uid(), category:'food',       limit:600  },
    { id:uid(), category:'housing',    limit:1500 },
    { id:uid(), category:'transport',  limit:200  },
    { id:uid(), category:'entertainment', limit:100 },
    { id:uid(), category:'shopping',   limit:250  },
  ];

  saveData();
}

/* ─── XSS Escape ────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── INIT ──────────────────────────────────────── */
function init() {
  loadData();
  seedDemoData();
  buildMonthFilter(); // build before any render so selectedMonthKey() works

  /* Month filter */
  document.getElementById('monthFilter').addEventListener('change', () => renderAll());

  /* Navigation */
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.page);
      // close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  document.querySelectorAll('.view-all').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });

  /* Sidebar toggle */
  document.getElementById('menuToggle').addEventListener('click', () =>
    document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('sidebarClose').addEventListener('click', () =>
    document.getElementById('sidebar').classList.remove('open'));

  /* Add transaction button */
  document.getElementById('openAddModal').addEventListener('click', openAddModal);

  /* Type toggle */
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => setTxType(btn.dataset.type));
  });

  /* Transaction form */
  document.getElementById('txForm').addEventListener('submit', saveTx);
  document.getElementById('txModalClose').addEventListener('click', () => closeModal('txModalOverlay'));
  document.getElementById('txModalCancel').addEventListener('click', () => closeModal('txModalOverlay'));

  /* Delete modal */
  document.getElementById('deleteConfirm').addEventListener('click', doDelete);
  document.getElementById('deleteCancel').addEventListener('click', () => closeModal('deleteModalOverlay'));
  document.getElementById('deleteModalClose').addEventListener('click', () => closeModal('deleteModalOverlay'));

  /* Budget modal */
  document.getElementById('addBudgetGoal').addEventListener('click', openBudgetModal);
  document.getElementById('budgetForm').addEventListener('submit', saveBudget);
  document.getElementById('budgetModalClose').addEventListener('click', () => closeModal('budgetModalOverlay'));
  document.getElementById('budgetModalCancel').addEventListener('click', () => closeModal('budgetModalOverlay'));

  /* Transaction filter inputs */
  ['filterType','filterCategory','filterSearch'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => { txCurrentPage = 1; renderTransactions(); });
  });

  /* Close modals on overlay click */
  ['txModalOverlay','deleteModalOverlay','budgetModalOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) closeModal(id);
    });
  });

  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
