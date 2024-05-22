// Retrieve the object from sessionStorage
additionalInformationTopics = JSON.parse(sessionStorage.getItem('additionalInformationTopics'));

var checkbox = document.getElementById("checkboxItem");
// console.log(checkbox.value);
// console.log(additionalInformationTopics[checkbox.value]);

function UpdateCheckbox() {
   // this.checked = !VideoArr[PageName][ModuleString].NeedMoreInformation;
   checkbox.checked = !additionalInformationTopics[moduleName];
   additionalInformationTopics[moduleName] = checkbox.checked;
   sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));
   // console.log(additionalInformationTopics);
}

function LoadCheckBoxValue() {
   checkbox.checked = additionalInformationTopics[moduleName];
}

function UpdateSpecificCheckBox() {
   this.checked = !additionalInformationTopics[this.parentNode.querySelector('label').textContent];
   additionalInformationTopics[this.parentNode.querySelector('label').textContent] = this.checked;
   sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));
}

// checkbox.addEventListener('click', function() {

//    console.log(checkbox.value)

//    console.log(checkbox.checked)

//    // Add items to the object
// additionalInformationTopics[checkbox.value] = checkbox.checked;

// console.log(additionalInformationTopics);

// // Update the object in sessionStorage
// sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));


// })








