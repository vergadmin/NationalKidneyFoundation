var myVideo = document.getElementById("myvideo");
var id=document.body.getAttribute("id-variable");
var type=document.body.getAttribute("type-variable");
var nextPage=document.body.getAttribute("next-page-variable");
var playButton = document.getElementById("playButton");
var VideoArrayIndex = 1;

// if(sessionStorage.getItem("VideoArrIndex") === null){
//   var VideoArrayIndex = 1;
//   sessionStorage.setItem("VideoArrIndex", VideoArrayIndex);
// }
// else{
//   var VideoArrayIndex = sessionStorage.getItem("VideoArrIndex");
// }

//Remove this line later, just for timebeing when chnages to VideoArray Format are still being made.
sessionStorage.removeItem("VideoArr")

if(sessionStorage.getItem("VideoArr") === null){
//Format is, pageName, Video URL, Whether Page Visited, Whether More information requested (Where applicable)
var VideoArrNames = ["Homepage", "Introduction", "quickAssessment", "subTopics", "summary", ]

var PageName = VideoArrNames[VideoArrayIndex];

var VideoArray = {
  'Homepage' : {
    "VideURL" : null, 
    "PageVisited" : false,
    "PageFirstVisitedTimeStamp" : null,
    "PageFirstExitedTimeStamp": null,
    "PageLastVisitedTimeStamp":null,
    "NumberOfTimesPageVisited": 0,
    "TimeSpentOnPage": null,
    "ActiveOrPassiveRedirectionToPage": null,
    },
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
  'quickAssessment' :   {"main" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessment.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "response1" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse1.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "response2" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse2.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "response3" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse3.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    }
  },
  "subTopics" : { "Benefits of kidney transplant" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantBenefits.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Who can get a kidney transplant" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/donorEligibility.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "The transplant work-up" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantWorkup.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Overview - The waiting list" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/overviewTransplantWaitingList.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Living donor transplant" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/livingDonorTransplant.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Getting a transplant sooner" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantSooner.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "How long do kidney transplants last" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantLifeSpan.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "The risks of kidney transplant" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantRisks.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Choosing a transplant center" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/choosingTransplantCenter.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Who can be a living kidney donor" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantLifeSpan.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
    "Talking to your doctor" : {
      "VideURL" : `https://national-kidney-foundation.s3.amazonaws.com/${type}/talkingToYourDoctor.mp4`, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    },
  },
    "summary" : { "response3" : {
      "VideURL" : ``, 
      "PageVisited" : false,
      "PageFirstVisitedTimeStamp" : null,
      "PageFirstExitedTimeStamp": null,
      "PageLastVisitedTimeStamp":null,
      "NumberOfTimesPageVisited": 0,
      "TimeSpentOnPage": null,
      "ActiveOrPassiveRedirectionToPage": null,
    }
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
  if((PageName!="quickAssessment")&&(PageName!="overviewTransplantWaitingList")){
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
  if(PageName==="talkingToYourDoctor")
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
  else if(PageName==="quickAssessment"){
    nextButton.style.display="block";
  }  
  else if(PageName === "Introduction"){
    PreviousNextButtonFunction(1);
    document.getElementsByClassName('slider-container')[0].style.display="flex";
  }
  else if(PageName.startsWith("quickAssessmentResponse")){
    PreviousNextButtonFunction(1);
    document.getElementsByClassName('slider-container')[0].style.display="none";
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
  if(PageName === 'quickAssessment' && action === 1) {
    var slider = document.getElementById("slider");
    if(slider.value<=59){
      UpdateVideo(VideoArray[PageName]["response1"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse1`)
      PageName = 'quickAssessmentResponse1';
    }
    else if (slider.value<=89){
      UpdateVideo(VideoArray[PageName]["response2"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse2`)
      PageName = 'quickAssessmentResponse2';

    }
    else{
      UpdateVideo(VideoArray[PageName]["response3"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse3`)
      PageName = 'quickAssessmentResponse3';

    }
    document.getElementsByClassName('slider-container')[0].style.display="none";
  }
  else if(PageName === "subTopics" && action === 1){
    //Code Later
  }
  else{
    if(VideoArrayIndex + action < 0){
      VideoArrayIndex = 0;
    }
    else if(VideoArrayIndex + action > Object.keys(VideoArray).length -1){
      VideoArrayIndex = Object.keys(VideoArray).length - 1;
    }
    else{
      VideoArrayIndex = VideoArrayIndex + action;
    }

    PageName = VideoArrNames[VideoArrayIndex]

    if(PageName === "Homepage"){
      window.location.href=`/${id}/`
    }
    else if(PageName.startsWith("SubTopic")){
      //CodeHere
    }
    else if(PageName === "quickAssessment"){
      UpdateVideo(VideoArray[PageName]['main'].VideURL)
    }
    else if(PageName === "subTopics"){
      UpdateVideo(VideoArray[PageName]['Benefits of kidney transplant'].VideURL)
    }
    else{
      UpdateVideo(VideoArray[PageName].VideURL)
    }

    if(PageName === "Introduction"){
      UpdateTitle("Goals of our Meeting");
    }

    if(PageName === "quickAssessment"){
      nextButton.style.display="none";
      document.getElementsByClassName('slider-container')[0].style.display="flex";
      UpdateTitle("Quick Assessment");
    }
    else{
      nextButton.style.display="block";
      document.getElementsByClassName('slider-container')[0].style.display="none";
    }

    if(PageName === "subTopics"){
      document.getElementsByClassName('title')[0].style.display = "none";
      document.getElementsByClassName('dropdown')[0].style.display = "block";
    }
    else{
      document.getElementsByClassName('title')[0].style.display = "block";
      document.getElementsByClassName('dropdown')[0].style.display = "none";

    }

    if(PageName === "Homepage"){
      //window.history.pushState(PageName, PageName, `/${id}/`)
    }
    else{
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/${PageName}`)
    }
    VideoArray[PageName].PageVisited = true;
    sessionStorage.setItem("VideoArr", JSON.stringify(VideoArray))
    }
}

function UpdateTitle(TitleString){
  if(document.getElementsByClassName('title').length>0){
    document.getElementsByClassName('title')[0].innerHTML=TitleString;
  }
}