// Retrieve the object from sessionStorage
additionalInformationTopics = JSON.parse(sessionStorage.getItem('additionalInformationTopics'));

// Select the HTML element where you want to add the checkboxes
var container = document.getElementById('selected-topics');

// Loop through each key-value pair in the object and create a checkbox for each
for (const [key, value] of Object.entries(additionalInformationTopics)) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = value; // Set the 'checked' attribute based on the value
  checkbox.value = key; // Set the 'value' attribute to the key

  const label = document.createElement('label');
  label.textContent = key;

  const checkboxdiv = document.createElement('div')
  checkboxdiv.classList.add('checkboxdiv')
  checkboxdiv.appendChild(checkbox);
  checkboxdiv.appendChild(label);
  container.appendChild(checkboxdiv);
}