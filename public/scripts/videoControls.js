var myVideo = document.getElementById("myvideo");
var id=document.body.getAttribute("id-variable");
var type=document.body.getAttribute("type-variable");
var nextPage=document.body.getAttribute("next-page-variable");
var currentPage=document.body.getAttribute("url");
var playButton = document.getElementById("playButton");
console.log("WE ARE I VIDEO CONTROLS");
console.log(currentPage);

myVideo.onloadstart = function() {
  myVideo.play();
};

  // Get the button element by its ID
  var rewindButton = document.getElementById("rewind");
  var pauseButton = document.getElementById("pause");
    console.log("in videocomnt");
  var nextButton = document.querySelector(".next");
  if((currentPage!="quickAssessment")&&(currentPage!="overviewTransplantWaitingList")){
    nextButton.style.display= "block";
  }
  
  // Add a click event listener to the button
  pauseButton.addEventListener("click", function() {
    console.log("clicked");
    // Toggle between pausing and playing the video
    if (myVideo.paused) {
      myVideo.play();
      pauseButton.textContent = "| |";
      playButton.style.display = "none";
      playButton.parentElement.style.backgroundColor = "transparent";
    } else {
      myVideo.pause();
      pauseButton.textContent = "▶";
      playButton.style.display = "flex";
      playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }
  });

  rewindButton.addEventListener("click", function() {
    myVideo.currentTime -= 10;
    if (myVideo.paused) {
      myVideo.play();
      pauseButton.textContent = "| |";
    }
});

myVideo.onended=function(e){
  if(currentPage==="talkingToYourDoctor")
  {
    var sliderValueForEndPage = parseInt(sessionStorage.getItem("sliderResponse"))
    console.log("in talking to doc",sliderValueForEndPage )
    if(sliderValueForEndPage>=70){
      console.log('IS GREATER THAN 70')
      window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse1`
    }
  
    else{
      console.log('IS LESS THAN 70')
      window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse2`
    }
  } 
  

  else if(currentPage==="quickAssessment"){
    nextButton.style.display="block";
  }
    
  else{
    window.location.href="/"+id+"/EducationalComponent/"+type+"/"+nextPage;
  }

  pauseButton.textContent = "▶";
  playButton.style.display = "flex";
  playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}

myVideo.onplaying=function(e){
  pauseButton.textContent = "| |";
  playButton.style.display = "none";
  playButton.parentElement.style.backgroundColor = "transparent";
}


playButton.addEventListener("click", function() {
  if (myVideo.paused) {
      myVideo.play();
      playButton.style.display = "none";
      playButton.parentElement.style.backgroundColor = "transparent";
  }
});