// Get the slider element
var slider = document.getElementById("slider");
// Get the span element that will display the slider value
var sliderNumber = document.getElementById("slider-number");

var sliderValue;
// Update the slider value display when the slider is moved
slider.oninput = function() {
  sliderNumber.innerText = this.value;
  sliderValue=this.value;
sessionStorage.setItem("sliderResponse",this.value);

};


function redirectBasedOnSliderValue(id,type){
    if(sliderValue<=59){
      window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse1`
    }

    else if (sliderValue<=89){
      window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse2`
    }

    else{
      window.location.href=`/${id}/EducationalComponent/${type}/quickAssessmentResponse3`
    }
}