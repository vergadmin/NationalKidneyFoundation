document.addEventListener('DOMContentLoaded', function() {
    const validationData = JSON.parse(sessionStorage.getItem('dashboardValidation'));
    
    if (!validationData) {
        document.getElementById('validationContent').innerHTML = '<p>No validation data found. Please go back and try again.</p>';
        return;
    }

    renderValidationResults(validationData);
    setupProceedButton(validationData);
});

function renderValidationResults(data) {
    const container = document.getElementById('validationContent');
    let html = '';

    // Summary statistics
    html += `
        <div class="validation-section success-section">
            <h3>Validation Summary</h3>
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-number">${data.validation.validParticipants.length}</div>
                    <div class="stat-label">Valid Participants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.validation.missingParticipants.length}</div>
                    <div class="stat-label">Missing Participants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(data.validation.duplicateParticipants).length}</div>
                    <div class="stat-label">Participants with Multiple Entries</div>
                </div>
            </div>
        </div>
    `;

    // Missing participants section
    if (data.validation.missingParticipants.length > 0) {
        html += `
            <div class="validation-section error-section">
                <h3>Missing Participants (${data.validation.missingParticipants.length})</h3>
                <p>The following participant IDs were not found in the database:</p>
                <ul class="missing-participants">
        `;
        
        data.validation.missingParticipants.forEach(id => {
            html += `<li>${id}</li>`;
        });
        
        html += `
                </ul>
                <p><strong>These participants will be excluded from the analytics.</strong></p>
            </div>
        `;
    }

    // Duplicate participants section
    const duplicateKeys = Object.keys(data.validation.duplicateParticipants);
    if (duplicateKeys.length > 0) {
        html += `
            <div class="validation-section warning-section">
                <h3>Participants with Multiple Entries (${duplicateKeys.length})</h3>
                <p>The following participants have multiple visits. Please select which visit to include in the analytics:</p>
        `;

        duplicateKeys.forEach(participantId => {
            const visits = data.validation.duplicateParticipants[participantId];
            html += `
                <div style="margin-bottom: 20px;">
                    <h4>Participant: ${participantId}</h4>
                    <table class="duplicate-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Visit ID</th>
                                <th>Source</th>
                                <th>Platform</th>
                                <th>Operating System</th>
                                <th>Browser</th>
                                <th>Character</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Duration (min)</th>
                                <th>Modules</th>
                                <th>Knowledge Rating</th>
                                <th>Usefulness Response</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            visits.forEach((visit, index) => {
                const startDate = visit.InterventionStartTime ? new Date(visit.InterventionStartTime).toLocaleString() : 'N/A';
                const endDate = visit.InterventionEndTime ? new Date(visit.InterventionEndTime).toLocaleString() : 'N/A';
                const duration = Math.round((visit.TotalTimeSpentOnIntervention || 0) / 60);
                html += `
                    <tr>
                        <td>
                            <input type="radio" name="select_${participantId}" value="${visit.VisitID}" ${index === 0 ? 'checked' : ''} 
                                   data-participant="${participantId}" data-visit="${visit.VisitID}">
                        </td>
                        <td>${visit.VisitID}</td>
                        <td>${visit.Source || 'N/A'}</td>
                        <td>${visit.Platform || 'N/A'}</td>
                        <td>${visit.OperatingSystem || 'N/A'}</td>
                        <td>${visit.Browser || 'N/A'}</td>
                        <td>${visit.CharacterSelected || 'N/A'}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td>${duration}</td>
                        <td>${visit.NumberOfModulesInteracted || 0}</td>
                        <td>${visit.KidneyTransplantResponse || 'N/A'}</td>
                        <td>${visit.OverviewUsefulnessCheckinResponse || 'N/A'}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += '</div>';
    }

    // Valid participants section
    if (data.validation.validParticipants.length > 0) {
        html += `
            <div class="validation-section success-section">
                <h3>Valid Participants (${data.validation.validParticipants.length})</h3>
                <p>The following participants will be included in the analytics with their single visit:</p>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
        `;

        data.validation.validParticipants.forEach(participant => {
            html += `<span style="display: inline-block; background: rgba(255,255,255,0.7); padding: 4px 8px; margin: 2px; border-radius: 3px;">${participant.ParticipantID}</span>`;
        });

        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function setupProceedButton(data) {
    const proceedContainer = document.getElementById('proceedContainer');
    const proceedButton = document.getElementById('proceedButton');

    // Show proceed button if there are valid participants or duplicates to resolve
    if (data.validation.validParticipants.length > 0 || Object.keys(data.validation.duplicateParticipants).length > 0) {
        proceedContainer.style.display = 'block';
    }

    proceedButton.addEventListener('click', async function() {
        const selectedVisits = getSelectedVisits(data);
        
        // console.log('Selected visits for analytics:', selectedVisits); // Debug log
        
        if (selectedVisits.length === 0) {
            alert('No participants available for analytics.');
            return;
        }

        proceedButton.disabled = true;
        proceedButton.textContent = 'Processing...';

        try {
            const payload = {
                source: data.source,
                selectedVisits: selectedVisits
            };
            
            // console.log('Sending payload to analytics:', payload); // Debug log

            const response = await fetch('/dashboard/generate-analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            
            // console.log('Analytics response:', responseData); // Debug log

            if (responseData.success) {
                sessionStorage.setItem('dashboardAnalytics', JSON.stringify(responseData));
                window.location.href = '/dashboard/results';
            } else {
                throw new Error(responseData.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Analytics generation error:', error); // Debug log
            alert(`Error: ${error.message}`);
        } finally {
            proceedButton.disabled = false;
            proceedButton.textContent = 'Proceed to Analytics';
        }
    });
}

function getSelectedVisits(data) {
    const selectedVisits = [];

    // Add valid participants (single visits)
    data.validation.validParticipants.forEach(participant => {
        selectedVisits.push({
            ParticipantID: participant.ParticipantID,
            VisitID: participant.VisitID
        });
    });

    // Add selected visits from duplicates
    const duplicateKeys = Object.keys(data.validation.duplicateParticipants);
    duplicateKeys.forEach(participantId => {
        const radioButton = document.querySelector(`input[name="select_${participantId}"]:checked`);
        if (radioButton) {
            selectedVisits.push({
                ParticipantID: participantId,
                VisitID: parseInt(radioButton.value)
            });
        }
    });

    return selectedVisits;
}
