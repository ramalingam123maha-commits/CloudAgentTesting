// ── Categories ────────────────────────────────────────
export const CATEGORIES = {
  expense: [
    { id: 'food',      icon: '🍔', label: 'Food & Dining',    color: '#f97316' },
    { id: 'housing',   icon: '🏠', label: 'Housing & Rent',   color: '#8b5cf6' },
    { id: 'transport', icon: '🚗', label: 'Transport',        color: '#3b82f6' },
    { id: 'utilities', icon: '💡', label: 'Utilities',        color: '#eab308' },
    { id: 'health',    icon: '💊', label: 'Health',           color: '#22d3ee' },
    { id: 'shopping',  icon: '🛍️', label: 'Shopping',         color: '#ec4899' },
    { id: 'entertain', icon: '🎬', label: 'Entertainment',    color: '#a855f7' },
    { id: 'education', icon: '📚', label: 'Education',        color: '#14b8a6' },
    { id: 'travel',    icon: '✈️', label: 'Travel',           color: '#60a5fa' },
    { id: 'other_exp', icon: '📦', label: 'Other',            color: '#94a3b8' },
  ],
  income: [
    { id: 'salary',     icon: '💼', label: 'Salary',          color: '#22c55e' },
    { id: 'freelance',  icon: '💻', label: 'Freelance',       color: '#4ade80' },
    { id: 'investment', icon: '📈', label: 'Investment',      color: '#86efac' },
    { id: 'gift',       icon: '🎁', label: 'Gift',            color: '#f0abfc' },
    { id: 'rental',     icon: '🏢', label: 'Rental Income',   color: '#fbbf24' },
    { id: 'other_inc',  icon: '💰', label: 'Other Income',    color: '#94a3b8' },
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.expense, ...CATEGORIES.income];

const CAT_MAP = {};
ALL_CATEGORIES.forEach(c => { CAT_MAP[c.id] = c; });

export function getCategoryMeta(id) {
  return CAT_MAP[id] || { id, icon: '❓', label: id, color: '#94a3b8' };
}

// ── Chart Colours ─────────────────────────────────────
export const CHART_COLORS = [
  '#f97316','#8b5cf6','#3b82f6','#eab308','#22d3ee',
  '#ec4899','#a855f7','#14b8a6','#60a5fa','#94a3b8',
  '#22c55e','#4ade80','#86efac',
];

// ── Formatting ────────────────────────────────────────
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
export const formatCurrency = v => USD.format(v);

export const formatDate = dateStr => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Month Utilities ───────────────────────────────────
export const monthKey = dateStr => dateStr.slice(0, 7);   // "2024-06"

export const currentMonthKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};

export const monthLabel = key => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const addMonths = (key, delta) => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
