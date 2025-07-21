document.addEventListener('DOMContentLoaded', function() {
    const analyticsData = JSON.parse(sessionStorage.getItem('dashboardAnalytics'));
    
    if (!analyticsData) {
        document.getElementById('analyticsContent').innerHTML = '<p>No analytics data found. Please go back and generate the report.</p>';
        return;
    }

    renderAnalytics(analyticsData);
    setupDownloadButton(analyticsData);
});

function setupDownloadButton(analyticsData) {
    const downloadButton = document.getElementById('downloadExcelButton');
    
    downloadButton.addEventListener('click', async function() {
        downloadButton.disabled = true;
        downloadButton.innerHTML = '⏳ Generating Excel...';
        
        try {
            const response = await fetch('/dashboard/download-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: analyticsData.source,
                    selectedVisits: analyticsData.selectedVisits
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Failed to generate Excel file');
            }
        } catch (error) {
            alert(`Error downloading Excel: ${error.message}`);
        } finally {
            downloadButton.disabled = false;
            downloadButton.innerHTML = '📊 Download Excel Report';
        }
    });
}

function renderAnalytics(data) {
    const container = document.getElementById('analyticsContent');
    
    // Overall Statistics
    container.innerHTML += renderOverallStats(data.analytics.overall);
    
    // Populate character-specific data in the overall stats table
    populateCharacterStatsInOverallTable(data.analytics.characters);
    
    // Character Statistics  
    container.innerHTML += renderCharacterStats(data.analytics.characters);
    
    // Knowledge Rating Distribution
    container.innerHTML += renderKnowledgeRating(data.analytics.knowledgeRating);
    
    // Usefulness Statistics
    container.innerHTML += renderUsefulnessStats(data.analytics.usefulness);
    
    // Completion Statistics
    container.innerHTML += renderCompletionStats(data.analytics.completion);
    
    // Module Statistics
    container.innerHTML += renderModuleStats(data.analytics.modules, 'All Characters');
    
    // Character-specific module stats
    const characters = ['Character_a', 'Character_b', 'Character_c', 'Character_d'];
    characters.forEach(character => {
        const characterModules = data.analytics.modules.filter(m => m.CharacterSelected === character);
        if (characterModules.length > 0) {
            container.innerHTML += renderModuleStats(characterModules, character);
        }
    });
}

function renderOverallStats(stats) {
    return `
        <div class="analytics-section">
            <h2>Overall Statistics</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Overall</th>
                        <th>Unit</th>
                        <th>Character_a</th>
                        <th>Character_b</th>
                        <th>Character_c</th>
                        <th>Character_d</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Median Number of Topics/Modules Reviewed</td>
                        <td class="metric-value">${(stats.medianModules || 0).toFixed(1)}</td>
                        <td>modules</td>
                        <td class="metric-value" id="char-a-median-modules">-</td>
                        <td class="metric-value" id="char-b-median-modules">-</td>
                        <td class="metric-value" id="char-c-median-modules">-</td>
                        <td class="metric-value" id="char-d-median-modules">-</td>
                    </tr>
                    <tr>
                        <td>Average Number of Topics/Modules Reviewed</td>
                        <td class="metric-value">${(stats.avgModules || 0).toFixed(1)}</td>
                        <td>modules</td>
                        <td class="metric-value" id="char-a-avg-modules">-</td>
                        <td class="metric-value" id="char-b-avg-modules">-</td>
                        <td class="metric-value" id="char-c-avg-modules">-</td>
                        <td class="metric-value" id="char-d-avg-modules">-</td>
                    </tr>
                    <tr>
                        <td>Average Time spent in Intervention</td>
                        <td class="metric-value">${(stats.avgTime || 0).toFixed(0)}</td>
                        <td>seconds</td>
                        <td class="metric-value" id="char-a-avg-time-sec">-</td>
                        <td class="metric-value" id="char-b-avg-time-sec">-</td>
                        <td class="metric-value" id="char-c-avg-time-sec">-</td>
                        <td class="metric-value" id="char-d-avg-time-sec">-</td>
                    </tr>
                    <tr>
                        <td>Average Time spent in Intervention</td>
                        <td class="metric-value">${((stats.avgTime || 0) / 60).toFixed(1)}</td>
                        <td>minutes</td>
                        <td class="metric-value" id="char-a-avg-time-min">-</td>
                        <td class="metric-value" id="char-b-avg-time-min">-</td>
                        <td class="metric-value" id="char-c-avg-time-min">-</td>
                        <td class="metric-value" id="char-d-avg-time-min">-</td>
                    </tr>
                    <tr>
                        <td>Median Time spent in Intervention</td>
                        <td class="metric-value">${(stats.medianTime || 0).toFixed(0)}</td>
                        <td>seconds</td>
                        <td class="metric-value" id="char-a-median-time-sec">-</td>
                        <td class="metric-value" id="char-b-median-time-sec">-</td>
                        <td class="metric-value" id="char-c-median-time-sec">-</td>
                        <td class="metric-value" id="char-d-median-time-sec">-</td>
                    </tr>
                    <tr>
                        <td>Median Time spent in Intervention</td>
                        <td class="metric-value">${((stats.medianTime || 0) / 60).toFixed(1)}</td>
                        <td>minutes</td>
                        <td class="metric-value" id="char-a-median-time-min">-</td>
                        <td class="metric-value" id="char-b-median-time-min">-</td>
                        <td class="metric-value" id="char-c-median-time-min">-</td>
                        <td class="metric-value" id="char-d-median-time-min">-</td>
                    </tr>
                    <tr>
                        <td>Average Self rating of Knowledge at start of intervention (out of 100)</td>
                        <td class="metric-value">${(stats.avgKnowledge || 0).toFixed(1)}</td>
                        <td></td>
                        <td class="metric-value" id="char-a-avg-knowledge">-</td>
                        <td class="metric-value" id="char-b-avg-knowledge">-</td>
                        <td class="metric-value" id="char-c-avg-knowledge">-</td>
                        <td class="metric-value" id="char-d-avg-knowledge">-</td>
                    </tr>
                    <tr>
                        <td>Median Self rating of Knowledge at start of intervention (out of 100)</td>
                        <td class="metric-value">${(stats.medianKnowledge || 0).toFixed(1)}</td>
                        <td></td>
                        <td class="metric-value" id="char-a-median-knowledge">-</td>
                        <td class="metric-value" id="char-b-median-knowledge">-</td>
                        <td class="metric-value" id="char-c-median-knowledge">-</td>
                        <td class="metric-value" id="char-d-median-knowledge">-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function renderCharacterStats(characters) {
    const total = characters.reduce((sum, char) => sum + char.count, 0);
    
    const characterImages = {
        'Character_a': 'https://national-kidney-foundation.s3.amazonaws.com/Assets/a_henry_image.png',
        'Character_b': 'https://national-kidney-foundation.s3.amazonaws.com/Assets/b_will_image.png',
        'Character_c': 'https://national-kidney-foundation.s3.amazonaws.com/Assets/c_olivia_image.png',
        'Character_d': 'https://national-kidney-foundation.s3.amazonaws.com/Assets/d_tilly_image.png'
    };
    
    let html = `
        <div class="analytics-section">
            <h2>Character Selection</h2>
            <table>
                <thead>
                    <tr>
                        <th>Character</th>
                        <th>Image</th>
                        <th>Number of participants</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    characters.forEach(char => {
        const percentage = total > 0 ? ((char.count / total) * 100).toFixed(1) : 0;
        const imageUrl = characterImages[char.CharacterSelected] || '';
        html += `
            <tr>
                <td>${char.CharacterSelected}</td>
                <td><img src="${imageUrl}" alt="${char.CharacterSelected}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                <td class="metric-value">${char.count}</td>
                <td class="metric-value">${percentage}%</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function renderKnowledgeRating(ratings) {
    const categories = [
        'I really need Information',
        'I think I need information',
        'I don\'t know if I need information or not',
        'I think I know a lot',
        'I know a lot'
    ];
    
    let html = `
        <div class="analytics-section">
            <h2>Knowledge Rating Distribution</h2>
            <table>
                <thead>
                    <tr>
                        <th>Knowledge Category</th>
                        <th>Count</th>
                        <th>Character_a</th>
                        <th>Character_b</th>
                        <th>Character_c</th>
                        <th>Character_d</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    categories.forEach(category => {
        const categoryRatings = ratings.filter(r => r.KnowledgeCategory === category);
        const total = categoryRatings.reduce((sum, r) => sum + r.count, 0);
        
        html += `<tr><td>${category}</td><td class="metric-value">${total}</td>`;
        
        ['Character_a', 'Character_b', 'Character_c', 'Character_d'].forEach(char => {
            const charRating = categoryRatings.find(r => r.CharacterSelected === char);
            html += `<td class="metric-value">${charRating ? charRating.count : 0}</td>`;
        });
        
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function renderUsefulnessStats(usefulnessStats) {
    console.log('Usefulness stats received:', usefulnessStats); // Debug log
    
    if (!usefulnessStats || usefulnessStats.length === 0) {
        return `
            <div class="analytics-section">
                <h2>Transplant Waiting List Module Usefulness</h2>
                <p>No usefulness response data available.</p>
            </div>
        `;
    }

    // Get all unique usefulness levels from the actual data
    const usefulnessLevels = [...new Set(usefulnessStats.map(s => s.UsefulnessResponse))].sort();
    console.log('Found usefulness levels:', usefulnessLevels); // Debug log
    
    const totalResponses = usefulnessStats.reduce((sum, stat) => sum + stat.count, 0);
    
    let html = `
        <div class="analytics-section">
            <h2>Transplant Waiting List Module Usefulness</h2>
            <table>
                <thead>
                    <tr>
                        <th>Usefulness Level</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Character_a</th>
                        <th>Character_b</th>
                        <th>Character_c</th>
                        <th>Character_d</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    usefulnessLevels.forEach(level => {
        const levelResponses = usefulnessStats.filter(s => s.UsefulnessResponse === level);
        const totalCount = levelResponses.reduce((sum, r) => sum + r.count, 0);
        const percentage = totalResponses > 0 ? ((totalCount / totalResponses) * 100).toFixed(1) : 0;
        
        const charCounts = {
            'Character_a': levelResponses.find(r => r.CharacterSelected === 'Character_a')?.count || 0,
            'Character_b': levelResponses.find(r => r.CharacterSelected === 'Character_b')?.count || 0,
            'Character_c': levelResponses.find(r => r.CharacterSelected === 'Character_c')?.count || 0,
            'Character_d': levelResponses.find(r => r.CharacterSelected === 'Character_d')?.count || 0
        };

        html += `
            <tr>
                <td>${level}</td>
                <td class="metric-value">${totalCount}</td>
                <td class="metric-value">${percentage}%</td>
                <td class="metric-value">${charCounts['Character_a']}</td>
                <td class="metric-value">${charCounts['Character_b']}</td>
                <td class="metric-value">${charCounts['Character_c']}</td>
                <td class="metric-value">${charCounts['Character_d']}</td>
            </tr>
        `;
    });

    html += `
                    <tr style="border-top: 2px solid #333; font-weight: bold;">
                        <td>Total participants that answered question</td>
                        <td class="metric-value">${totalResponses}</td>
                        <td class="metric-value">100.0%</td>
                        <td class="metric-value">${usefulnessStats.filter(s => s.CharacterSelected === 'Character_a').reduce((sum, s) => sum + s.count, 0)}</td>
                        <td class="metric-value">${usefulnessStats.filter(s => s.CharacterSelected === 'Character_b').reduce((sum, s) => sum + s.count, 0)}</td>
                        <td class="metric-value">${usefulnessStats.filter(s => s.CharacterSelected === 'Character_c').reduce((sum, s) => sum + s.count, 0)}</td>
                        <td class="metric-value">${usefulnessStats.filter(s => s.CharacterSelected === 'Character_d').reduce((sum, s) => sum + s.count, 0)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function renderCompletionStats(completionStats) {
    if (!completionStats || completionStats.length === 0) {
        return `
            <div class="analytics-section">
                <h2>Completion Statistics</h2>
                <p>No completion data available.</p>
            </div>
        `;
    }

    const getCharacterCompletion = (charName) => {
        const char = completionStats.find(c => c.CharacterSelected === charName);
        return char ? { total: char.totalParticipants, completed: char.completedParticipants } : { total: 0, completed: 0 };
    };

    const totalAll = completionStats.reduce((sum, stat) => sum + stat.totalParticipants, 0);
    const completedAll = completionStats.reduce((sum, stat) => sum + stat.completedParticipants, 0);

    let html = `
        <div class="analytics-section">
            <h2>Completion Statistics</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Total</th>
                        <th>Character_a</th>
                        <th>Character_b</th>
                        <th>Character_c</th>
                        <th>Character_d</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Number of Participants that completed Intervention</td>
                        <td class="metric-value">${completedAll}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_a').completed}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_b').completed}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_c').completed}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_d').completed}</td>
                    </tr>
                    <tr>
                        <td>Percentage of Participants that completed Intervention</td>
                        <td class="metric-value">${totalAll > 0 ? ((completedAll / totalAll) * 100).toFixed(1) + '%' : '0%'}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_a').total > 0 ? ((getCharacterCompletion('Character_a').completed / getCharacterCompletion('Character_a').total) * 100).toFixed(1) + '%' : '0%'}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_b').total > 0 ? ((getCharacterCompletion('Character_b').completed / getCharacterCompletion('Character_b').total) * 100).toFixed(1) + '%' : '0%'}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_c').total > 0 ? ((getCharacterCompletion('Character_c').completed / getCharacterCompletion('Character_c').total) * 100).toFixed(1) + '%' : '0%'}</td>
                        <td class="metric-value">${getCharacterCompletion('Character_d').total > 0 ? ((getCharacterCompletion('Character_d').completed / getCharacterCompletion('Character_d').total) * 100).toFixed(1) + '%' : '0%'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function renderModuleStats(modules, title) {
    const moduleVideoLengths = {
        'Benefits of kidney transplant': 55.0,
        'Who can get a kidney transplant': 49.0,
        'The transplant work-up': 55.0,
        'Overview - The waiting list': 50.0,
        'Living donor transplant': 60.0,
        'Getting a transplant sooner': 54.0,
        'How long do kidney transplants last': 60.0,
        'The risks of kidney transplant': 65.0,
        'Choosing a transplant center': 92.0,
        'Who can be a living kidney donor': 56.0,
        'Talking to your doctor': 28.0
    };

    // Group modules by page name
    const groupedModules = {};
    modules.forEach(module => {
        if (!groupedModules[module.PageName]) {
            groupedModules[module.PageName] = [];
        }
        groupedModules[module.PageName].push(module);
    });

    let html = `
        <div class="analytics-section character-section">
            <h2>${title} - Module Wise Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Module</th>
                        <th>Avg Time Spent (sec)</th>
                        <th>Video Length (sec)</th>
                        <th>Avg Watch Ratio</th>
                        <th>Avg Times Visited</th>
                        <th>More Info Requested</th>
                        <th>% More Info Requested</th>
                        <th>Visitors</th>
                        <th>% Visited</th>
                        <th>Active Visits</th>
                        <th>Passive Visits</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.keys(groupedModules).forEach(pageName => {
        const pageModules = groupedModules[pageName];
        const avgTimeSpent = pageModules.reduce((sum, m) => sum + (m.avgTimeSpent || 0), 0) / pageModules.length;
        const avgVisits = pageModules.reduce((sum, m) => sum + (m.avgVisits || 0), 0) / pageModules.length;
        const totalMoreInfo = pageModules.reduce((sum, m) => sum + (m.moreInfoRequested || 0), 0);
        const totalVisitors = pageModules.reduce((sum, m) => sum + (m.totalVisitors || 0), 0);
        const actualVisitors = pageModules.reduce((sum, m) => sum + (m.actualVisitors || 0), 0);
        const activeVisits = pageModules.reduce((sum, m) => sum + (m.activeVisits || 0), 0);
        const passiveVisits = pageModules.reduce((sum, m) => sum + (m.passiveVisits || 0), 0);
        
        const videoLength = moduleVideoLengths[pageName] || 0;
        const watchRatio = videoLength > 0 ? (avgTimeSpent / videoLength) : 0;
        const moreInfoPercentage = totalVisitors > 0 ? ((totalMoreInfo / totalVisitors) * 100) : 0;
        const visitedPercentage = totalVisitors > 0 ? ((actualVisitors / totalVisitors) * 100) : 0;

        html += `
            <tr>
                <td>${pageName}</td>
                <td class="metric-value">${avgTimeSpent.toFixed(1)}</td>
                <td>${videoLength}</td>
                <td class="metric-value">${watchRatio.toFixed(2)}</td>
                <td class="metric-value">${avgVisits.toFixed(1)}</td>
                <td class="metric-value">${totalMoreInfo}</td>
                <td class="metric-value">${moreInfoPercentage.toFixed(1)}%</td>
                <td class="metric-value">${actualVisitors}</td>
                <td class="metric-value">${visitedPercentage.toFixed(1)}%</td>
                <td class="metric-value">${activeVisits}</td>
                <td class="metric-value">${passiveVisits}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    return html;
}

function populateCharacterStatsInOverallTable(characters) {
    const getCharacterValue = (charName, field) => {
        const char = characters.find(c => c.CharacterSelected === charName);
        return char ? (char[field] || 0).toFixed(1) : '-';
    };

    // Populate median modules
    document.getElementById('char-a-median-modules').textContent = getCharacterValue('Character_a', 'medianModules');
    document.getElementById('char-b-median-modules').textContent = getCharacterValue('Character_b', 'medianModules');
    document.getElementById('char-c-median-modules').textContent = getCharacterValue('Character_c', 'medianModules');
    document.getElementById('char-d-median-modules').textContent = getCharacterValue('Character_d', 'medianModules');

    // Populate average modules
    document.getElementById('char-a-avg-modules').textContent = getCharacterValue('Character_a', 'avgModules');
    document.getElementById('char-b-avg-modules').textContent = getCharacterValue('Character_b', 'avgModules');
    document.getElementById('char-c-avg-modules').textContent = getCharacterValue('Character_c', 'avgModules');
    document.getElementById('char-d-avg-modules').textContent = getCharacterValue('Character_d', 'avgModules');

    // Populate average time in seconds
    document.getElementById('char-a-avg-time-sec').textContent = getCharacterValue('Character_a', 'avgTime');
    document.getElementById('char-b-avg-time-sec').textContent = getCharacterValue('Character_b', 'avgTime');
    document.getElementById('char-c-avg-time-sec').textContent = getCharacterValue('Character_c', 'avgTime');
    document.getElementById('char-d-avg-time-sec').textContent = getCharacterValue('Character_d', 'avgTime');

    // Populate average time in minutes
    const getTimeInMinutes = (charName) => {
        const char = characters.find(c => c.CharacterSelected === charName);
        return char ? ((char.avgTime || 0) / 60).toFixed(1) : '-';
    };
    document.getElementById('char-a-avg-time-min').textContent = getTimeInMinutes('Character_a');
    document.getElementById('char-b-avg-time-min').textContent = getTimeInMinutes('Character_b');
    document.getElementById('char-c-avg-time-min').textContent = getTimeInMinutes('Character_c');
    document.getElementById('char-d-avg-time-min').textContent = getTimeInMinutes('Character_d');

    // Populate median time in seconds
    document.getElementById('char-a-median-time-sec').textContent = getCharacterValue('Character_a', 'medianTime');
    document.getElementById('char-b-median-time-sec').textContent = getCharacterValue('Character_b', 'medianTime');
    document.getElementById('char-c-median-time-sec').textContent = getCharacterValue('Character_c', 'medianTime');
    document.getElementById('char-d-median-time-sec').textContent = getCharacterValue('Character_d', 'medianTime');

    // Populate median time in minutes
    const getMedianTimeInMinutes = (charName) => {
        const char = characters.find(c => c.CharacterSelected === charName);
        return char ? ((char.medianTime || 0) / 60).toFixed(1) : '-';
    };
    document.getElementById('char-a-median-time-min').textContent = getMedianTimeInMinutes('Character_a');
    document.getElementById('char-b-median-time-min').textContent = getMedianTimeInMinutes('Character_b');
    document.getElementById('char-c-median-time-min').textContent = getMedianTimeInMinutes('Character_c');
    document.getElementById('char-d-median-time-min').textContent = getMedianTimeInMinutes('Character_d');

    // Populate average knowledge
    document.getElementById('char-a-avg-knowledge').textContent = getCharacterValue('Character_a', 'avgKnowledge');
    document.getElementById('char-b-avg-knowledge').textContent = getCharacterValue('Character_b', 'avgKnowledge');
    document.getElementById('char-c-avg-knowledge').textContent = getCharacterValue('Character_c', 'avgKnowledge');
    document.getElementById('char-d-avg-knowledge').textContent = getCharacterValue('Character_d', 'avgKnowledge');

    // Populate median knowledge
    document.getElementById('char-a-median-knowledge').textContent = getCharacterValue('Character_a', 'medianKnowledge');
    document.getElementById('char-b-median-knowledge').textContent = getCharacterValue('Character_b', 'medianKnowledge');
    document.getElementById('char-c-median-knowledge').textContent = getCharacterValue('Character_c', 'medianKnowledge');
    document.getElementById('char-d-median-knowledge').textContent = getCharacterValue('Character_d', 'medianKnowledge');
}
