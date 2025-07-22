function generateTimeSpentChart(characters) {
    const ctx = document.getElementById('timeSpentChart').getContext('2d');
    
    const datasets = characters.map((char, index) => {
        // Simulate individual participant data points
        const numParticipants = char.count;
        const avgTime = (char.avgTime || 300) / 60; // Convert to minutes
        const points = [];
        
        for (let i = 0; i < numParticipants; i++) {
            // Add some variation around the average
            const variation = (Math.random() - 0.5) * avgTime; // ±50% variation
            const time = Math.max(0, avgTime + variation);
            points.push({
                x: i + 1,
                y: time
            });
        }
        
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
        return {
            label: char.CharacterSelected,
            data: points,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    // Add average line for each character
    characters.forEach((char, index) => {
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
        datasets.push({
            label: `${char.CharacterSelected} Average`,
            data: [
                { x: 0, y: (char.avgTime || 300) / 60 },
                { x: char.count + 1, y: (char.avgTime || 300) / 60 }
            ],
            type: 'line',
            borderColor: colors[index % colors.length],
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0
        });
    });
    
    new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Participant Index'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time Spent (minutes)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} minutes`;
                        }
                    }
                }
            }
        }
    });
}
