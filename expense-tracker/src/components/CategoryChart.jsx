// Doughnut chart that breaks down the current month's expenses by category
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getCategoryMeta, formatCurrency, CHART_COLORS } from '../utils.js';

// Register the required Chart.js components for a doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart({ transactions }) {
  // Only expenses are relevant for this chart
  const expenseTxs = transactions.filter(t => t.type === 'expense');

  // Aggregate total spend per category id
  const totals = expenseTxs.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // Sort categories from highest to lowest spend so the chart reads naturally
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title">Expenses by Category</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No expense data</p>
      </div>
    );
  }

  const data = {
    labels: entries.map(([id]) => getCategoryMeta(id).label),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: CHART_COLORS.slice(0, entries.length),
      borderColor: '#1a1d27',
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8b90a7',
          font: { size: 11 },
          boxWidth: 10,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-title">Expenses by Category</div>
      <Doughnut data={data} options={options} />
    </div>
  );
}
