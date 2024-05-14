// Get the dropdown button and dropdown content elements
var dropdownButton = document.getElementById('dropbtn');
var dropdownContent = document.getElementById('dropdown-content');
var moduleName = "";

// Add a click event listener to the dropdown button
dropdownButton.addEventListener('click', function() {
    // Toggle the display property of the dropdown content
    if (dropdownContent.style.display === 'none' || dropdownContent.style.display === '') {
        dropdownContent.style.display = 'block';
    } else {
        dropdownContent.style.display = 'none';
    }
});

function UpdateDropdown(ModuleString){
    moduleName = ModuleString;
    dropdownButton.innerText = moduleName + ' ▾';
    UpdateVideo(VideoArray[PageName][ModuleString].VideURL)
    LoadCheckBoxValue();
    dropdownContent.style.display = 'none';
    if(moduleName === "Overview - The waiting list"){
        nextButton.style.display= "none";
      }
      else{
        nextButton.style.display= "block";
      }
}