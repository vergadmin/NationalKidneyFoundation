document.getElementById('dashboardForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const button = document.getElementById('nextButton');
    const result = document.getElementById('result');
    
    button.disabled = true;
    button.textContent = 'Processing...';
    result.style.display = 'none';
    
    try {
        const formData = new FormData(this);
        const sourceValue = formData.get('source');
        const data = {
            source: sourceValue === '' ? null : sourceValue, // Convert empty string to null
            participantIds: formData.get('participantIds')
        };
        
        const response = await fetch('/dashboard/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
            // Store the validation data and redirect to validation page
            sessionStorage.setItem('dashboardValidation', JSON.stringify(responseData));
            window.location.href = '/dashboard/validation';
        } else {
            throw new Error(responseData.error || 'Unknown error');
        }
    } catch (error) {
        result.className = 'result error';
        result.innerHTML = `<strong>Error:</strong> ${error.message}`;
        result.style.display = 'block';
    } finally {
        button.disabled = false;
        button.textContent = 'Next';
    }
});