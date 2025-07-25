// Get the slider element
var slider = document.getElementById("slider");
// Get the span element that will display the slider value
var sliderNumber = document.getElementById("slider-number");
var sliderValue;

// Initialize slider value - use stored value if exists, otherwise default to 50
if (sessionStorage.getItem("sliderResponse")) {
  sliderValue = parseInt(sessionStorage.getItem("sliderResponse"));
  slider.value = sliderValue;
} else {
  // Set default value to 50 and store it in session storage
  sliderValue = 50;
  slider.value = sliderValue;
  sessionStorage.setItem("sliderResponse", sliderValue);
}

// Update the display with the current value
UpdateSliderValue();

// Update the slider value display when the slider is moved
function UpdateSliderValue() {
  sliderValue = slider.value;
  if (sliderValue < 20) {
    sliderNumber.innerText = "I really need information";
  }
  else if (sliderValue >= 20 && sliderValue < 40) {
    sliderNumber.innerText = "I think I need information";
  }
  else if (sliderValue >= 40 && sliderValue < 60) {
    sliderNumber.innerText = "I don't know if I need information or not";
  }
  else if (sliderValue >= 60 && sliderValue <= 80) {
    sliderNumber.innerText = "I think I know a lot";
  }
  else if (sliderValue >= 80 && sliderValue <= 100) {
    sliderNumber.innerText = "I know a lot";
  }
  sessionStorage.setItem("sliderResponse", sliderValue);
};


// function redirectBasedOnSliderValue(id,type){
//     if(sliderValue<=59){
//       window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse1`
//     }

//     else if (sliderValue<=89){
//       window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse2`
//     }

//     else{
//       window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse3`
//     }
// }

// function redirectBasedOnSliderValueForEndPage(id,type){
//   var sliderValue = parseInt(sessionStorage.getItem("sliderResponse"));
//   console.log("it is: ",sliderValue)
//   console.log(typeof sliderValue)
//   if(sliderValue>=70){
//     window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse1`
//   }
//   else{
//       window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse2`
//   }
// }