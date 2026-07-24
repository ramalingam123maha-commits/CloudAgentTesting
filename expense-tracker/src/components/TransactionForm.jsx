// Controlled form for adding a new income or expense transaction
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CATEGORIES, currentMonthKey } from '../utils.js';

// Blank form state; date defaults to today so the user rarely has to change it
const defaultForm = {
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
};

export default function TransactionForm({ onAdd }) {
  // Track whether the user is adding an expense or income
  const [type, setType] = useState('expense');
  const [form, setForm] = useState(defaultForm);
  // Validation error message; empty string means no error
  const [error, setError] = useState('');

  // Category list changes depending on the selected type
  const categories = CATEGORIES[type];

  // Generic single-field updater so each input doesn't need its own handler
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    // Validate all required fields before calling the parent callback
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) { setError('Enter a valid positive amount.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (!form.date) { setError('Please pick a date.'); return; }

    setError('');
    onAdd({
      type,
      description: form.description.trim(),
      // Round to 2 decimal places to avoid floating-point surprises
      amount: parseFloat((+form.amount).toFixed(2)),
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    });
    // Reset form but keep today's date pre-filled for quick consecutive entries
    setForm({ ...defaultForm, date: new Date().toISOString().slice(0, 10) });
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="form-title">
        <PlusCircle size={16} /> Add Transaction
      </div>

      {/* Type Tabs */}
      <div className="type-tabs">
        <button
          type="button"
          className={`type-tab ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => { setType('expense'); set('category', ''); }}
        >
          💸 Expense
        </button>
        <button
          type="button"
          className={`type-tab ${type === 'income' ? 'active income' : ''}`}
          onClick={() => { setType('income'); set('category', ''); }}
        >
          💵 Income
        </button>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="desc">Description</label>
        <input
          id="desc"
          type="text"
          placeholder="e.g. Monthly Salary"
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      {/* Amount + Date */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={form.category}
          onChange={e => set('category', e.target.value)}
        >
          <option value="" disabled>Select category…</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Note (optional) */}
      <div className="form-group">
        <label htmlFor="note">Note (optional)</label>
        <input
          id="note"
          type="text"
          placeholder="Any extra details…"
          value={form.note}
          onChange={e => set('note', e.target.value)}
        />
      </div>

      {error && <p style={{ color: 'var(--expense)', fontSize: 12, marginBottom: 10 }}>{error}</p>}

      <button type="submit" className="btn-submit">
        <PlusCircle size={14} /> Add {type === 'income' ? 'Income' : 'Expense'}
      </button>
    </form>
  );
}
