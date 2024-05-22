// Get the dropdown button and dropdown content elements
var dropdownButton = document.getElementById('dropbtn');
var dropdownContent = document.getElementById('dropdown-content');
var moduleName = "";

// Add a click event listener to the dropdown button
dropdownButton.addEventListener('click', function () {
    // Toggle the display property of the dropdown content
    if (dropdownContent.style.display === 'none' || dropdownContent.style.display === '') {
        dropdownContent.style.display = 'block';
    } else {
        dropdownContent.style.display = 'none';
    }
});

function UpdateDropdown(ModuleString, activeTrigger = null) {
    moduleName = ModuleString;
    dropdownButton.innerText = moduleName + ' ▾';
    UpdateVideo(VideoArray[PageName][ModuleString].VideoURL)
    LoadCheckBoxValue();
    dropdownContent.style.display = 'none';
    if (moduleName === "Overview - The waiting list" || moduleName === "Talking to your doctor") {
        nextButton.style.display = "none";
    }
    else {
        nextButton.style.display = "block";
    }
    if (moduleName !== "Overview - The waiting list") {
        document.getElementsByClassName('overview-buttons')[0].style.display = 'none'
    }
    ChangeCheckboxText(moduleName);
    logActiveTriggerOrNot(PageName, moduleName, activeTrigger);
}

// Add a blur event listener to hide the dropdown content when the button loses focus
dropdownButton.addEventListener('blur', function () {
    // Delay the execution of blur event slightly to allow the click event to be handled first
    setTimeout(() => {
        dropdownContent.style.display = 'none';
    }, 200); // Delay in milliseconds
});

function ChangeCheckboxText(moduleName){
    var labels = document.getElementsByTagName('label');
    for (var i = 0; i < labels.length; i++) {
        if (labels[i].htmlFor === 'checkboxItem') {
            // Update the text content of the label
            labels[i].innerHTML = `Check the box and I'll send you details about <strong> ${moduleName} </strong> later.`;
            break;
        }
    }
}