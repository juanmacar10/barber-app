import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import './StatsChart.scss';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const StatsChart = ({ selectedMonth, reservas }) => {
    const chartData = useMemo(() => {
        const [year, month] = selectedMonth.split('-');
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

        const dailyCounts = new Array(daysInMonth).fill(0);

        const finalizedReservations = reservas.filter(r => {
            if (r.estado !== 'finalizada') return false;
            const [rYear, rMonth] = r.fecha.split('-').map(Number);
            return rYear === parseInt(year) && rMonth === parseInt(month);
        });

        finalizedReservations.forEach(reserva => {
            const day = parseInt(reserva.fecha.split('-')[2]) - 1;
            dailyCounts[day]++;
        });

        return {
            labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            datasets: [
                {
                    label: 'Cortes finalizados',
                    data: dailyCounts,
                    backgroundColor: '#1A1A1A',
                    borderRadius: 8,
                    barPercentage: 0.7,
                },
            ],
        };
    }, [selectedMonth, reservas]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Reservas finalizadas por día - ${selectedMonth}`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                title: { display: true, text: 'Número de cortes' },
            },
            x: {
                title: { display: true, text: 'Día del mes' },
            },
        },
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={chartOptions } />
        </div>
    );
};