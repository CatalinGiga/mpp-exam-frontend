import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useMemo } from 'react';
import './PartyChart.css';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function PartyChart({ candidates }) {
  // Count candidates per party
  const partyCounts = useMemo(() => {
    const counts = {};
    candidates.forEach(c => {
      counts[c.party] = (counts[c.party] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  const data = {
    labels: Object.keys(partyCounts),
    datasets: [
      {
        label: 'Candidates per Party',
        data: Object.values(partyCounts),
        backgroundColor: '#1e90ff',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: 'Party', color: '#fff' },
        ticks: { color: '#fff' },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#444' },
        title: { display: true, text: 'Number of Candidates', color: '#fff' },
        ticks: { color: '#fff', precision: 0 },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3>Candidates per Political Party</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default PartyChart; 