// Get the slider element
var slider = document.getElementById("slider");
// Get the span element that will display the slider value
var sliderNumber = document.getElementById("slider-number");

var sliderValue;
// Update the slider value display when the slider is moved
slider.oninput = function() {
  sliderValue=this.value;
  if(sliderValue<20){
    sliderNumber.innerText = "I really need information";
  }
  else if(sliderValue>=20 && sliderValue<40){
    sliderNumber.innerText = "I think i need information";
  }
  else if(sliderValue>=40 && sliderValue<60){
    sliderNumber.innerText = "I don't know if i need information or not";
  }
  else if(sliderValue>=60 && sliderValue<=80){
    sliderNumber.innerText = "I think i know a lot";
  }
  else if(sliderValue>=80 && sliderValue<=100){
    sliderNumber.innerText = "I know a lot";
  }
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