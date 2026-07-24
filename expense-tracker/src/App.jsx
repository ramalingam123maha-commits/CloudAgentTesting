// Root application component – owns global state and composes all major sections
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Search } from 'lucide-react';
import './index.css';
import './App.css';
import { useTransactions } from './useTransactions.js';
import {
  CATEGORIES, ALL_CATEGORIES, monthKey, currentMonthKey,
  monthLabel, addMonths,
} from './utils.js';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import SummaryBanner from './components/SummaryBanner.jsx';
import CategoryChart from './components/CategoryChart.jsx';
import MonthlyBarChart from './components/MonthlyBarChart.jsx';

export default function App() {
  // Pull CRUD helpers and the full transaction list from the custom hook
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const [activeMonth, setActiveMonth] = useState(currentMonthKey);
  const [filterType, setFilterType]   = useState('all');
  const [filterCat,  setFilterCat]    = useState('all');
  const [search,     setSearch]       = useState('');

  // ── Transactions for the selected month ──────────────
  const monthTx = useMemo(
    () => transactions.filter(t => t.date.slice(0, 7) === activeMonth),
    [transactions, activeMonth],
  );

  // ── Filtered list for display ─────────────────────────
  const filtered = useMemo(() => {
    return monthTx.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCat  !== 'all' && t.category !== filterCat) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [monthTx, filterType, filterCat, search]);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-title">
          <LayoutDashboard size={20} color="#6366f1" />
          Expense Tracker
        </div>

        <div className="month-selector">
          <button
            className="month-btn"
            onClick={() => setActiveMonth(m => addMonths(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="month-label">{monthLabel(activeMonth)}</span>
          <button
            className="month-btn"
            onClick={() => setActiveMonth(m => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </header>

      {/* ── Summary Banner ── */}
      <SummaryBanner transactions={monthTx} monthLabel={monthLabel(activeMonth)} />

      {/* ── Main Grid ── */}
      <div className="main-grid">
        {/* Left: Add Form */}
        <TransactionForm onAdd={addTransaction} />

        {/* Right: Filters + List + Charts */}
        <div className="right-panel">
          {/* Filters */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">
                Transactions
                <span className="count-badge">{filtered.length}</span>
              </span>
            </div>

            <div className="filters-row" style={{ marginBottom: 12 }}>
              {/* Search */}
              <div className="search-wrap">
                <Search size={12} />
                <input
                  className="search-input"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Type filter */}
              <select
                className="filter-select"
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setFilterCat('all'); }}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              {/* Category filter */}
              <select
                className="filter-select"
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
              >
                <option value="all">All Categories</option>
                {(filterType === 'income'
                  ? CATEGORIES.income
                  : filterType === 'expense'
                  ? CATEGORIES.expense
                  : ALL_CATEGORIES
                ).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <TransactionList transactions={filtered} onDelete={deleteTransaction} />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <CategoryChart transactions={monthTx} />
            <MonthlyBarChart transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
