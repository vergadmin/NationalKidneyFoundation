function generateKnowledgeBoxPlot(analytics) {
    const ctx = document.getElementById('knowledgeBoxPlotChart').getContext('2d');
    
    // Get raw knowledge data by character
    const characters = analytics.characters;
    const rawData = analytics.rawData || [];
    
    // Calculate box plot statistics for each character and overall
    const boxPlotData = [];
    
    // Overall statistics
    const overallKnowledgeData = rawData
        .filter(d => d.KidneyTransplantResponse !== null && d.KidneyTransplantResponse !== undefined)
        .map(d => d.KidneyTransplantResponse)
        .sort((a, b) => a - b);
    
    if (overallKnowledgeData.length > 0) {
        boxPlotData.push({
            label: 'Overall',
            data: calculateBoxPlotStats(overallKnowledgeData),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            outlierColor: 'rgba(255, 99, 132, 0.8)',
            visible: true
        });
    }
    
    // Character-specific statistics
    characters.forEach((char, index) => {
        const charKnowledgeData = rawData
            .filter(d => d.CharacterSelected === char.CharacterSelected && 
                        d.KidneyTransplantResponse !== null && 
                        d.KidneyTransplantResponse !== undefined)
            .map(d => d.KidneyTransplantResponse)
            .sort((a, b) => a - b);
        
        if (charKnowledgeData.length > 0) {
            const colors = [
                { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
                { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' },
                { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
                { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' }
            ];
            
            boxPlotData.push({
                label: char.CharacterSelected,
                data: calculateBoxPlotStats(charKnowledgeData),
                backgroundColor: colors[index % colors.length].bg,
                borderColor: colors[index % colors.length].border,
                outlierColor: colors[index % colors.length].border,
                visible: true
            });
        }
    });
    
    // Create custom box plot
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: boxPlotData.map(d => d.label),
            datasets: [{
                label: 'Box Plot',
                data: boxPlotData.map(d => d.data.median),
                backgroundColor: 'transparent',
                borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Knowledge Confidence (0-100)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Groups'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        generateLabels: function() {
                            return boxPlotData.map((d, index) => ({
                                text: d.label,
                                fillStyle: d.backgroundColor,
                                strokeStyle: d.borderColor,
                                lineWidth: 2,
                                hidden: !d.visible,
                                datasetIndex: index
                            }));
                        }
                    },
                    onClick: function(event, legendItem) {
                        // Toggle visibility
                        const index = legendItem.datasetIndex;
                        boxPlotData[index].visible = !boxPlotData[index].visible;
                        
                        // Force redraw
                        chart.update('none');
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            interaction: {
                intersect: false
            }
        },
        plugins: [{
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                
                if (!boxPlotData || boxPlotData.length === 0) return;
                
                // Only draw visible box plots
                const visibleData = boxPlotData.filter(d => d.visible);
                if (visibleData.length === 0) return;
                
                const boxWidth = (chartArea.right - chartArea.left) / visibleData.length * 0.6;
                const boxSpacing = (chartArea.right - chartArea.left) / visibleData.length;
                
                visibleData.forEach((boxData, visibleIndex) => {
                    const x = chartArea.left + (visibleIndex + 0.5) * boxSpacing;
                    const stats = boxData.data;
                    
                    // Scale values to chart coordinates
                    const scaleY = (value) => {
                        return chartArea.bottom - ((value / 100) * (chartArea.bottom - chartArea.top));
                    };
                    
                    const q1Y = scaleY(stats.q1);
                    const medianY = scaleY(stats.median);
                    const q3Y = scaleY(stats.q3);
                    const minY = scaleY(stats.min);
                    const maxY = scaleY(stats.max);
                    
                    ctx.strokeStyle = boxData.borderColor;
                    ctx.fillStyle = boxData.backgroundColor;
                    ctx.lineWidth = 2;
                    
                    // Draw whiskers
                    ctx.beginPath();
                    ctx.moveTo(x, q3Y);
                    ctx.lineTo(x, maxY);
                    ctx.moveTo(x, q1Y);
                    ctx.lineTo(x, minY);
                    ctx.moveTo(x - boxWidth/4, maxY);
                    ctx.lineTo(x + boxWidth/4, maxY);
                    ctx.moveTo(x - boxWidth/4, minY);
                    ctx.lineTo(x + boxWidth/4, minY);
                    ctx.stroke();
                    
                    // Draw box
                    ctx.fillRect(x - boxWidth/2, q3Y, boxWidth, q1Y - q3Y);
                    ctx.strokeRect(x - boxWidth/2, q3Y, boxWidth, q1Y - q3Y);
                    
                    // Draw median line
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x - boxWidth/2, medianY);
                    ctx.lineTo(x + boxWidth/2, medianY);
                    ctx.stroke();
                    
                    // Draw outliers if any
                    if (stats.outliers && stats.outliers.length > 0) {
                        ctx.fillStyle = boxData.outlierColor;
                        stats.outliers.forEach(outlier => {
                            const outlierY = scaleY(outlier);
                            ctx.beginPath();
                            ctx.arc(x, outlierY, 3, 0, 2 * Math.PI);
                            ctx.fill();
                        });
                    }
                    
                    // Draw mean marker
                    ctx.fillStyle = '#ff4444';
                    ctx.strokeStyle = '#ff4444';
                    ctx.lineWidth = 2;
                    const meanY = scaleY(stats.mean);
                    ctx.beginPath();
                    ctx.moveTo(x - 8, meanY);
                    ctx.lineTo(x + 8, meanY);
                    ctx.moveTo(x, meanY - 8);
                    ctx.lineTo(x, meanY + 8);
                    ctx.stroke();
                });
                
                // Add legend for mean marker
                ctx.fillStyle = '#333';
                ctx.font = '11px Arial';
                ctx.textAlign = 'left';
                
                // Position the mean legend properly
                const meanLegendX = chartArea.right + 10;
                const meanLegendY = chartArea.top + 40;
                
                // Draw the mean symbol (red cross)
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(meanLegendX, meanLegendY - 3);
                ctx.lineTo(meanLegendX + 8, meanLegendY - 3);
                ctx.moveTo(meanLegendX + 4, meanLegendY - 7);
                ctx.lineTo(meanLegendX + 4, meanLegendY + 1);
                ctx.stroke();
                
                // Draw the text "Mean" next to the symbol
                ctx.fillStyle = '#333';
                ctx.fillText('Mean', meanLegendX + 12, meanLegendY);
            }
        }]
    });
    
    // Add custom tooltip functionality
    let tooltip = document.getElementById('boxplot-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'boxplot-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            display: none;
            z-index: 1000;
            max-width: 200px;
            line-height: 1.4;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(tooltip);
    }
    
    // Remove existing listeners to avoid duplicates
    ctx.canvas.removeEventListener('mousemove', ctx.canvas._boxPlotMouseMove);
    ctx.canvas.removeEventListener('mouseleave', ctx.canvas._boxPlotMouseLeave);
    
    ctx.canvas._boxPlotMouseMove = function(e) {
        const rect = ctx.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const chartArea = chart.chartArea;
        const visibleData = boxPlotData.filter(d => d.visible);
        
        if (visibleData.length === 0) {
            tooltip.style.display = 'none';
            return;
        }
        
        const boxSpacing = (chartArea.right - chartArea.left) / visibleData.length;
        
        // Check which box the mouse is over
        for (let i = 0; i < visibleData.length; i++) {
            const boxX = chartArea.left + (i + 0.5) * boxSpacing;
            if (x >= boxX - boxSpacing/2 && x <= boxX + boxSpacing/2 && 
                y >= chartArea.top && y <= chartArea.bottom) {
                const stats = visibleData[i].data;
                tooltip.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 4px;">${visibleData[i].label}</div>
                    <div>Max: ${stats.max.toFixed(1)}</div>
                    <div>Q3: ${stats.q3.toFixed(1)}</div>
                    <div>Median: ${stats.median.toFixed(1)}</div>
                    <div>Mean: ${stats.mean.toFixed(1)}</div>
                    <div>Q1: ${stats.q1.toFixed(1)}</div>
                    <div>Min: ${stats.min.toFixed(1)}</div>
                    <div>Count: ${stats.count}</div>
                    ${stats.outliers.length > 0 ? `<div>Outliers: ${stats.outliers.length}</div>` : ''}
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = e.pageX + 10 + 'px';
                tooltip.style.top = e.pageY - 10 + 'px';
                return;
            }
        }
        
        tooltip.style.display = 'none';
    };
    
    ctx.canvas._boxPlotMouseLeave = function() {
        tooltip.style.display = 'none';
    };
    
    ctx.canvas.addEventListener('mousemove', ctx.canvas._boxPlotMouseMove);
    ctx.canvas.addEventListener('mouseleave', ctx.canvas._boxPlotMouseLeave);
}

function calculateBoxPlotStats(data) {
    if (!data || data.length === 0) {
        return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, outliers: [], count: 0 };
    }
    
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate quartiles
    const q1Index = Math.floor(n * 0.25);
    const medianIndex = Math.floor(n * 0.5);
    const q3Index = Math.floor(n * 0.75);
    
    const q1 = n > 1 ? (sorted[q1Index] + sorted[Math.min(q1Index + 1, n - 1)]) / 2 : sorted[0];
    const median = n > 1 ? (sorted[medianIndex] + sorted[Math.min(medianIndex + 1, n - 1)]) / 2 : sorted[0];
    const q3 = n > 1 ? (sorted[q3Index] + sorted[Math.min(q3Index + 1, n - 1)]) / 2 : sorted[0];
    
    // Calculate IQR and outlier boundaries
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Find outliers and whisker limits
    const outliers = [];
    let min = q1;
    let max = q3;
    
    for (const value of sorted) {
        if (value < lowerBound || value > upperBound) {
            outliers.push(value);
        } else {
            if (value < min) min = value;
            if (value > max) max = value;
        }
    }
    
    // If no non-outlier values found, use actual min/max
    if (min === q1 && max === q3) {
        min = sorted[0];
        max = sorted[n - 1];
    }
    
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    return {
        min,
        q1,
        median,
        q3,
        max,
        mean,
        outliers,
        count: n
    };
}
