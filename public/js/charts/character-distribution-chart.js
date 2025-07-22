function generateCharacterDistributionChart(characters) {
    const ctx = document.getElementById('characterChart').getContext('2d');
    
    const labels = characters.map(char => char.CharacterSelected);
    const data = characters.map(char => char.count);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
