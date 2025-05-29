import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartPanel = () => {
    useEffect(() => {
        new Chart(document.getElementById("messageChart"), {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{
                    label: "Messages",
                    data: [4, 5, 7, 3, 8, 6, 4],
                    backgroundColor: "rgba(107,72,255,0.5)",
                    borderColor: "rgba(107,72,255,1)",
                    borderWidth: 2,
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: {
                    legend: { labels: { color: "#fff" } }
                }
            }
        });
    }, []);

    return React.createElement(
        'div',
        { className: 'chart-panel' },
        React.createElement('h3', null, 'Message Statistics'),
        React.createElement('canvas', { id: 'messageChart', width: 400, height: 150 })
    );
};

export default ChartPanel;
