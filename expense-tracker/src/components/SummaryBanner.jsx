import { formatCurrency } from '../utils.js';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function SummaryBanner({ transactions, monthLabel }) {
  const totalIncome  = transactions.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;

  return (
    <div className="summary-grid">
      <div className="summary-card balance">
        <div className="label"><Wallet size={11} style={{verticalAlign:'middle',marginRight:4}}/>Net Balance</div>
        <div className="amount" style={{ color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
          {balance >= 0 ? '' : '-'}{formatCurrency(balance)}
        </div>
        <div className="sub">{monthLabel} • Savings rate: {savingsRate}%</div>
      </div>

      <div className="summary-card income">
        <div className="label"><TrendingUp size={11} style={{verticalAlign:'middle',marginRight:4}}/>Total Income</div>
        <div className="amount">{formatCurrency(totalIncome)}</div>
        <div className="sub">{transactions.filter(t => t.type === 'income').length} transactions</div>
      </div>

      <div className="summary-card expense">
        <div className="label"><TrendingDown size={11} style={{verticalAlign:'middle',marginRight:4}}/>Total Expenses</div>
        <div className="amount">{formatCurrency(totalExpense)}</div>
        <div className="sub">{transactions.filter(t => t.type === 'expense').length} transactions</div>
      </div>
    </div>
  );
}
