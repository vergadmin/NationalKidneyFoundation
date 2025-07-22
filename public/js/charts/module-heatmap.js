function generateModuleHeatmap(modules) {
    const canvas = document.getElementById('heatmapChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions explicitly
    canvas.width = 1024;
    canvas.height = 576;
    canvas.style.width = '100%';
    canvas.style.height = '576px';
    
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
    
    // Group modules by page name and character
    const heatmapData = [];
    const moduleNames = Object.keys(moduleVideoLengths);
    const characters = ['Character_a', 'Character_b', 'Character_c', 'Character_d'];
    
    characters.forEach((character, charIndex) => {
        moduleNames.forEach((moduleName, moduleIndex) => {
            const moduleData = modules.find(m => 
                m.PageName === moduleName && m.CharacterSelected === character
            );
            
            let watchRatio = 0;
            let timeSpent = 0;
            let visitors = 0;
            
            if (moduleData) {
                const videoLength = moduleVideoLengths[moduleName];
                timeSpent = moduleData.avgTimeSpent || 0;
                visitors = moduleData.totalVisitors || 0;
                watchRatio = videoLength > 0 ? Math.min(timeSpent / videoLength, 2) : 0;
            }
            
            heatmapData.push({
                moduleIndex: moduleIndex,
                charIndex: charIndex,
                watchRatio: watchRatio,
                moduleName: moduleName,
                character: character,
                timeSpent: timeSpent,
                videoLength: moduleVideoLengths[moduleName],
                visitors: visitors
            });
        });
    });
    
    // Function to get color based on watch ratio
    function getHeatmapColor(ratio) {
        const normalized = Math.min(ratio / 2, 1);
        
        if (normalized === 0) return '#f7fbff';
        if (normalized <= 0.125) return '#deebf7';
        if (normalized <= 0.25) return '#c6dbef';
        if (normalized <= 0.375) return '#9ecae1';
        if (normalized <= 0.5) return '#6baed6';
        if (normalized <= 0.625) return '#4292c6';
        if (normalized <= 0.75) return '#2171b5';
        if (normalized <= 0.875) return '#08519c';
        return '#08306b';
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions with proper scaling
    const padding = { top: 40, bottom: 120, left: 120, right: 100 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    const cellWidth = chartWidth / moduleNames.length;
    const cellHeight = chartHeight / characters.length;
    
    // Store cell data for tooltip handling
    const cellData = [];
    
    // Draw heatmap rectangles
    heatmapData.forEach(data => {
        const x = padding.left + (data.moduleIndex * cellWidth);
        const y = padding.top + (data.charIndex * cellHeight);
        
        ctx.fillStyle = getHeatmapColor(data.watchRatio);
        ctx.fillRect(x, y, cellWidth, cellHeight);
        
        // Draw cell border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        // Store for tooltip
        cellData.push({
            x: x,
            y: y,
            width: cellWidth,
            height: cellHeight,
            data: data
        });
    });
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    
    // Module names (X-axis) - rotated for better fit
    moduleNames.forEach((name, index) => {
        const x = padding.left + (index * cellWidth) + (cellWidth / 2);
        const y = padding.top + chartHeight + 15;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        const displayName = name.length > 18 ? name.substring(0, 18) + '...' : name;
        ctx.fillText(displayName, 0, 0);
        ctx.restore();
    });
    
    // Character names (Y-axis)
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    characters.forEach((char, index) => {
        const x = padding.left - 10;
        const y = padding.top + (index * cellHeight) + (cellHeight / 2) + 4;
        ctx.fillText(char, x, y);
    });
    
    // Draw axis titles
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    
    // X-axis title - moved further down
    ctx.fillText('Modules', padding.left + chartWidth / 2, canvas.height);
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Characters', 0, 0);
    ctx.restore();
    
    // Draw legend
    const legendX = padding.left + chartWidth + 10;
    const legendY = padding.top;
    const legendWidth = 15;
    const legendHeight = chartHeight;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(legendX, legendY + legendHeight, legendX, legendY);
    gradient.addColorStop(0, '#f7fbff');
    gradient.addColorStop(0.125, '#deebf7');
    gradient.addColorStop(0.25, '#c6dbef');
    gradient.addColorStop(0.375, '#9ecae1');
    gradient.addColorStop(0.5, '#6baed6');
    gradient.addColorStop(0.625, '#4292c6');
    gradient.addColorStop(0.75, '#2171b5');
    gradient.addColorStop(0.875, '#08519c');
    gradient.addColorStop(1, '#08306b');
    
    // Draw the gradient bar
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Draw border around gradient bar
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Draw legend labels
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    const labels = [
        { text: '200%', pos: 0 },
        { text: '150%', pos: 0.25 },
        { text: '100%', pos: 0.5 },
        { text: '50%', pos: 0.75 },
        { text: '0%', pos: 1 }
    ];
    
    labels.forEach(label => {
        const y = legendY + (label.pos * legendHeight);
        ctx.fillText(label.text, legendX + legendWidth + 3, y + 4);
    });
    
    // Draw legend title
    ctx.save();
    ctx.translate(legendX + legendWidth + 50, legendY + legendHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Watch Ratio', 0, 0);
    ctx.restore();
    
    // Add tooltip functionality
    let tooltip = document.getElementById('heatmap-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'heatmap-tooltip';
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
            max-width: 250px;
            line-height: 1.4;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(tooltip);
    }
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    function showTooltip(e, data) {
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${data.character} - ${data.moduleName}</div>
            <div>Watch Ratio: ${(data.watchRatio * 100).toFixed(1)}%</div>
            <div>Time Spent: ${data.timeSpent.toFixed(1)}s</div>
            <div>Video Length: ${data.videoLength}s</div>
            <div>Total Visitors: ${data.visitors}</div>
        `;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 10 + 'px';
    }
    
    function hideTooltip() {
        tooltip.style.display = 'none';
    }
    
    // Remove existing event listeners to avoid duplicates
    canvas.removeEventListener('mousemove', canvas._heatmapMouseMove);
    canvas.removeEventListener('mouseleave', canvas._heatmapMouseLeave);
    
    // Create event handler functions and store references
    canvas._heatmapMouseMove = function(e) {
        const mousePos = getMousePos(e);
        let found = false;
        
        for (let cell of cellData) {
            if (mousePos.x >= cell.x && mousePos.x <= cell.x + cell.width &&
                mousePos.y >= cell.y && mousePos.y <= cell.y + cell.height) {
                showTooltip(e, cell.data);
                canvas.style.cursor = 'pointer';
                found = true;
                break;
            }
        }
        
        if (!found) {
            hideTooltip();
            canvas.style.cursor = 'default';
        }
    };
    
    canvas._heatmapMouseLeave = function() {
        hideTooltip();
    };
    
    // Add event listeners
    canvas.addEventListener('mousemove', canvas._heatmapMouseMove);
    canvas.addEventListener('mouseleave', canvas._heatmapMouseLeave);
}
