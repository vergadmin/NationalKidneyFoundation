var myVideo = document.getElementById("myvideo");
var id=document.body.getAttribute("id-variable");
var type=document.body.getAttribute("type-variable");
var nextPage=document.body.getAttribute("next-page-variable");
var currentPage=document.body.getAttribute("url");
var previousPage = 'Introduction';
var playButton = document.getElementById("playButton");
console.log("WE ARE I VIDEO CONTROLS");
console.log(currentPage);

if(sessionStorage.getItem("VideoArrIndex") === null){
  var VideoArrayIndex = 0;
}
else{
  var VideoArrayIndex = sessionStorage.getItem("VideoArrIndex");
}

//Remove this line later, just for timebeing when chnages to VideoArray Format are still being made.
sessionStorage.removeItem("VideoArr")

if(sessionStorage.getItem("VideoArr") === null){
//Format is, pageName, Video URL, Whether Page Visited, Whether More information requested (Where applicable)
var VideoArrNames = ["Introduction", "quickAssessment", "SubTopicBenefitsOfKidneyTransplant"]

var VideoArray = {
  'Introduction' : {
  "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/Introduction.mp4`, 
  "PageVisited" : false,
  "PageFirstVisitedTimeStamp" : null,
  "PageFirstExitedTimeStamp": null,
  "PageLastVisitedTimeStamp":null,
  "NumberOfTimesPageVisited": 0,
  "TimeSpentOnPage": null,
  "ActiveOrPassiveRedirectionToPage": null,
  },
  'quickAssessment' : {
  "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessment.mp4`, 
  "PageVisited" : false,
  "PageFirstVisitedTimeStamp" : null,
  "PageFirstExitedTimeStamp": null,
  "PageLastVisitedTimeStamp":null,
  "NumberOfTimesPageVisited": 0,
  "TimeSpentOnPage": null,
  "ActiveOrPassiveRedirectionToPage": null,
  },
  "SubTopicBenefitsOfKidneyTransplant" : {
  "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantBenefits.mp4`, 
  "PageVisited" : false,
  "PageFirstVisitedTimeStamp" : null,
  "PageFirstExitedTimeStamp": null,
  "PageLastVisitedTimeStamp":null,
  "NumberOfTimesPageVisited": 0,
  "TimeSpentOnPage": null,
  "ActiveOrPassiveRedirectionToPage": null,
  },
}
sessionStorage.setItem("VideoArr", JSON.stringify(VideoArray))
}
else{
  VideoArray = JSON.parse(sessionStorage.getItem("VideoArr"))
}

  // Get the button element by its ID
  var rewindButton = document.getElementById("rewind");
  var pauseButton = document.getElementById("pause");


  var nextButton = document.querySelector(".next");
  if((currentPage!="quickAssessment")&&(currentPage!="overviewTransplantWaitingList")){
    nextButton.style.display= "block";
    if(document.getElementsByClassName('slider-container').length>0){
      document.getElementsByClassName('slider-container')[0].style.display="none";
    }
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
      playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    }
  });

//Rewinds the Video by 10seconds for the User.
  rewindButton.addEventListener("click", function() {
    myVideo.currentTime -= 10;
    if (myVideo.paused) {
      myVideo.play();
      pauseButton.textContent = "| |";
    }
});

//OnEnded Function for autoplay video sequence
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
  else if(currentPage === "Introduction"){
    window.history.replaceState('quickAssessment', "NKF", `/${id}/EducationalComponent/${type}/${nextPage}`);
    UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessment.mp4`);
    currentPage = "quickAssessment";
    previousPage = "Introduction";
    nextButton.style.display="none";
    document.getElementsByClassName('slider-container')[0].style.display="flex";
  }
  pauseButton.textContent = "▶";
  playButton.style.display = "flex";
  playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
}

//Updates the play/pause button.
myVideo.onplaying=function(e){
  pauseButton.textContent = "| |";
  playButton.style.display = "none";
  playButton.parentElement.style.backgroundColor = "transparent";
}

//Updates the play/pause button.
myVideo.onpause=function(e){
  pauseButton.textContent = "▶";
  playButton.style.display = "flex";
  playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
}


playButton.addEventListener("click", function() {
  if (myVideo.paused) {
      myVideo.play();
      playButton.style.display = "none";
      playButton.parentElement.style.backgroundColor = "transparent";
  }
});

//VideoUpdater Function / Autoplay Video
function UpdateVideo(videoUrl){
  myVideo.getElementsByTagName("source")[0].setAttribute('src', videoUrl);
  myVideo.load();
  myVideo.play();
}

//Master Function for the buttons.
function PreviousNextButtonFunction(action){
  if(VideoArrayIndex + action < 0){
    VideoArrayIndex = 0;
  }
  else if(VideoArrayIndex + action > Object.keys(VideoArray).length -1){
    VideoArrayIndex = Object.keys(VideoArray).length - 1;
  }
  else{
    VideoArrayIndex = VideoArrayIndex + action;
  }
  console.log(VideoArrayIndex)
}