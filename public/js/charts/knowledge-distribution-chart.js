function generateKnowledgeDistributionChart(knowledgeRating) {
    const ctx = document.getElementById('knowledgeChart').getContext('2d');
    
    const categories = [
        'I really need Information',
        'I think I need information',
        'I don\'t know if I need information or not',
        'I think I know a lot',
        'I know a lot'
    ];
    
    const data = categories.map(category => {
        const categoryData = knowledgeRating.filter(r => r.KnowledgeCategory === category);
        return categoryData.reduce((sum, r) => sum + r.count, 0);
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(cat => cat.length > 20 ? cat.substring(0, 20) + '...' : cat),
            datasets: [{
                label: 'Number of Participants',
                data: data,
                backgroundColor: '#36A2EB',
                borderColor: '#1E88E5',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}
