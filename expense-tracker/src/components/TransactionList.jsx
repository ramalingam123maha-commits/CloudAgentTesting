import { Trash2, TrendingUp, TrendingDown, Inbox } from 'lucide-react';
import { getCategoryMeta, formatCurrency, formatDate } from '../utils.js';

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <Inbox size={40} />
        <p>No transactions found.</p>
        <p style={{ marginTop: 4, fontSize: 12 }}>Add one using the form on the left.</p>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {transactions.map(tx => {
        const meta = getCategoryMeta(tx.category);
        return (
          <div key={tx.id} className="tx-item">
            <div className={`tx-icon ${tx.type}`}>
              <span>{meta.icon}</span>
            </div>
            <div className="tx-info">
              <div className="tx-desc" title={tx.description}>{tx.description}</div>
              <div className="tx-meta">
                <span>{formatDate(tx.date)}</span>
                <span className="tx-cat-badge">{meta.label}</span>
                {tx.note && <span title={tx.note} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{tx.note}</span>}
              </div>
            </div>
            <span className={`tx-amount ${tx.type}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
            <button className="tx-delete" onClick={() => onDelete(tx.id)} aria-label="Delete transaction">
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
