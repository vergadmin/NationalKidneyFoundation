// Retrieve the object from sessionStorage
additionalInformationTopics = JSON.parse(sessionStorage.getItem('additionalInformationTopics'));

console.log(additionalInformationTopics);
var checkbox=document.getElementById("checkboxItem");

checkbox.addEventListener('click', function() {

   console.log(checkbox.value)

   console.log(checkbox.checked)

   // Add items to the object
additionalInformationTopics[checkbox.value] = checkbox.checked;

console.log(additionalInformationTopics);

// Update the object in sessionStorage
sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));


})








