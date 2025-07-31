function generateModuleVisitChart(modules) {
    const ctx = document.getElementById('moduleVisitChart').getContext('2d');

    // Include ALL modules from moduleVideoLengths
    const moduleVideoLengths = {
        'Benefits of kidney transplant': 55.0,
        'Who can get a kidney transplant': 49.0,
        'The transplant work-up': 55.0,
        'Overview - The waiting list': 65.0,
        'Living donor transplant': 60.0,
        'Getting a transplant sooner': 54.0,
        'How long do kidney transplants last': 60.0,
        'The risks of kidney transplant': 65.0,
        'Choosing a transplant center': 92.0,
        'Who can be a living kidney donor': 56.0,
        'Talking to your doctor': 50.0
    };

    const moduleNames = Object.keys(moduleVideoLengths);

    // Group modules by page name
    const groupedModules = {};
    modules.forEach(module => {
        if (!groupedModules[module.PageName]) {
            groupedModules[module.PageName] = [];
        }
        groupedModules[module.PageName].push(module);
    });

    const overallAvg = [];
    const characterData = {};

    ['Character_a', 'Character_b', 'Character_c', 'Character_d'].forEach(char => {
        characterData[char] = [];
    });

    moduleNames.forEach(moduleName => {
        const moduleGroup = groupedModules[moduleName] || [];
        const overallVisits = moduleGroup.length > 0 ?
            moduleGroup.reduce((sum, m) => sum + (m.avgVisits || 0), 0) / moduleGroup.length : 0;
        overallAvg.push(overallVisits);

        ['Character_a', 'Character_b', 'Character_c', 'Character_d'].forEach(char => {
            const charModule = moduleGroup.find(m => m.CharacterSelected === char);
            characterData[char].push(charModule ? (charModule.avgVisits || 0) : 0);
        });
    });

    const datasets = [
        {
            label: 'Overall Average',
            data: overallAvg,
            backgroundColor: '#FF6384',
            borderColor: '#FF4069',
            borderWidth: 2
        },
        ...Object.keys(characterData).map((char, index) => ({
            label: char,
            data: characterData[char],
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index],
            borderColor: ['#1E88E5', '#FFB300', '#00ACC1', '#7B1FA2'][index],
            borderWidth: 1
        }))
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moduleNames.map(name => name.length > 15 ? name.substring(0, 15) + '...' : name),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Number of Visits'
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
