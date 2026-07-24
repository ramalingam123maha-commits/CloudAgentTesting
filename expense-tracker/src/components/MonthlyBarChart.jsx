// Grouped bar chart comparing income vs expenses across the last 6 months
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js';
import { addMonths, currentMonthKey, monthLabel } from '../utils.js';

// Register Chart.js components needed for a bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Returns an array of 6 "YYYY-MM" keys ending at the current month
function last6Months() {
  const cur = currentMonthKey();
  return Array.from({ length: 6 }, (_, i) => addMonths(cur, i - 5));
}

export default function MonthlyBarChart({ transactions }) {
  const months = last6Months();

  // For each of the 6 months, sum income and expenses separately
  const totals = months.map(mk => {
    const txs = transactions.filter(t => t.date.slice(0, 7) === mk);
    return {
      income:  txs.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  const data = {
    labels: months.map(mk => {
      const d = new Date(mk + '-01');
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Income',
        data: totals.map(t => t.income),
        backgroundColor: 'rgba(34,197,94,0.75)',
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: totals.map(t => t.expense),
        backgroundColor: 'rgba(239,68,68,0.75)',
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#8b90a7',
          font: { size: 11 },
          boxWidth: 10,
          padding: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b90a7', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8b90a7',
          font: { size: 10 },
          callback: v => `$${v}`,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-title">6-Month Overview</div>
      <Bar data={data} options={options} />
    </div>
  );
}
