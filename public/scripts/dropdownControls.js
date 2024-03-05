// Get the dropdown button and dropdown content elements
var dropdownButton = document.getElementById('dropbtn');
var dropdownContent = document.getElementById('dropdown-content');
console.log(dropdownButton,dropdownContent);
// Add a click event listener to the dropdown button
dropdownButton.addEventListener('click', function() {
    // Toggle the display property of the dropdown content
    if (dropdownContent.style.display === 'none' || dropdownContent.style.display === '') {
        dropdownContent.style.display = 'block';
    } else {
        dropdownContent.style.display = 'none';
    }
});