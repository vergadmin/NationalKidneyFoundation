function generateKnowledgeScatterPlot(analytics) {
    const ctx = document.getElementById('knowledgeScatterChart').getContext('2d');
    
    const characters = analytics.characters;
    const rawData = analytics.rawData || [];
    
    const datasets = characters.map((char, index) => {
        // Get actual participant data for this character
        const charKnowledgeData = rawData
            .filter(d => d.CharacterSelected === char.CharacterSelected && 
                        d.KidneyTransplantResponse !== null && 
                        d.KidneyTransplantResponse !== undefined)
            .map((d, i) => ({
                x: i + 1,
                y: d.KidneyTransplantResponse
            }));
        
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
        return {
            label: char.CharacterSelected,
            data: charKnowledgeData,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    // Add average line for each character
    characters.forEach((char, index) => {
        if (char.avgKnowledge !== null && char.avgKnowledge !== undefined) {
            const charDataCount = rawData.filter(d => 
                d.CharacterSelected === char.CharacterSelected && 
                d.KidneyTransplantResponse !== null && 
                d.KidneyTransplantResponse !== undefined
            ).length;
            
            if (charDataCount > 0) {
                const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
                datasets.push({
                    label: `${char.CharacterSelected} Average`,
                    data: [
                        { x: 0, y: char.avgKnowledge },
                        { x: charDataCount + 1, y: char.avgKnowledge }
                    ],
                    type: 'line',
                    borderColor: colors[index % colors.length],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                });
            }
        }
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
                    max: 100,
                    title: {
                        display: true,
                        text: 'Knowledge Confidence (0-100)'
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
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            }
        }
    });
}
