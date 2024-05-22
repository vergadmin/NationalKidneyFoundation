var myVideo = document.getElementById("myvideo");
var id = document.body.getAttribute("id-variable");
var type = document.body.getAttribute("type-variable");
var nextPage = document.body.getAttribute("next-page-variable");
var playButton = document.getElementById("playButton");
var VideoArrayIndex = 1;

ifInvalidSessionTaketoHomePage();

// if(sessionStorage.getItem("VideoArrIndex") === null){
//   var VideoArrayIndex = 1;
//   sessionStorage.setItem("VideoArrIndex", VideoArrayIndex);
// }
// else{
//   var VideoArrayIndex = sessionStorage.getItem("VideoArrIndex");
// }

//Format is, pageName, Video URL, Whether Page Visited, Whether More information requested (Where applicable)
var VideoArrNames = ["Homepage", "Introduction", "quickAssessment", "subTopics", "summary",]

var PageName = VideoArrNames[VideoArrayIndex];

VideoArray = JSON.parse(sessionStorage.getItem("VideoArr"));


// Get the button element by its ID
var rewindButton = document.getElementById("rewind");
var pauseButton = document.getElementById("pause");
var nextButton = document.querySelector(".next");

if ((PageName != "quickAssessment") && (PageName != "overviewTransplantWaitingList")) {
  nextButton.style.display = "block";
  if (document.getElementsByClassName('slider-container').length > 0) {
    document.getElementsByClassName('slider-container')[0].style.display = "none";
  }
}

// Add a click event listener to the button
pauseButton.addEventListener("click", function () {
  // Toggle between pausing and playing the video
  if (myVideo.paused) {
    myVideo.play();
    pauseButton.textContent = "Pause";
    if (PageName === "Introduction") {
      playButton.style.display = "none";
      playButton.parentElement.style.backgroundColor = "transparent";
    }
  } else {
    myVideo.pause();
    pauseButton.textContent = "Play";
    if (PageName === "Introduction") {
      playButton.style.display = "flex";
      playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    }
  }
});

//Rewinds the Video by 10seconds for the User.
rewindButton.addEventListener("click", function () {
  myVideo.currentTime -= 10;
  if (myVideo.paused) {
    myVideo.play();
    pauseButton.textContent = "Pause";
  }
});

//OnEnded Function for autoplay video sequence
myVideo.onended = function (e) {
  if (PageName === "subTopics") {
    if (moduleName === "Talking to your doctor") {
      if (myVideo.getElementsByTagName("source")[0].getAttribute('src') !==
        `https://national-kidney-foundation.s3.amazonaws.com/${type}/talkingToYourDoctor.mp4`) {
        PreviousNextButtonFunction(1, false);
      }
      else {
        var sliderValueForEndPage = parseInt(sessionStorage.getItem("sliderResponse"))
        if (sliderValueForEndPage >= 70) {
          UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/endOfMeetingResponse1.mp4`)
        }
        else {
          UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/endOfMeetingResponse2.mp4`)
        }
        nextButton.style.display = "block";
      }

    }
    else if (moduleName === "Overview - The waiting list" && myVideo.getElementsByTagName("source")[0].getAttribute('src') ===
      `https://national-kidney-foundation.s3.amazonaws.com/${type}/overviewTransplantWaitingList.mp4`) {
      document.getElementsByClassName('overview-buttons')[0].style.display = "block";
    }
    else {
      SwitchSubTopicVideo(1,false);
    }
  }
  else if (PageName === "quickAssessment") {
    nextButton.style.display = "block";
  }
  else if (PageName === "Introduction") {
    PreviousNextButtonFunction(1,false);
    document.getElementsByClassName('slider-container')[0].style.display = "flex";
  }
  else if (PageName.startsWith("quickAssessmentResponse")) {
    PreviousNextButtonFunction(1,false);
    document.getElementsByClassName('slider-container')[0].style.display = "none";
  }
  pauseButton.textContent = "Play";
  // if(PageName === "Introduction"){
  //   playButton.style.display = "flex";
  //   playButton.parentElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  // }
}

//Updates the play/pause button.
myVideo.onplaying = function (e) {
  pauseButton.textContent = "Pause";
  playButton.style.display = "none";
  playButton.parentElement.style.backgroundColor = "transparent";
}

//Updates the play/pause button.
myVideo.onpause = function (e) {
  pauseButton.textContent = "Play";
}


playButton.addEventListener("click", function () {
  if (myVideo.paused) {
    myVideo.play();
    playButton.style.display = "none";
    playButton.parentElement.style.backgroundColor = "transparent";
  }
});

//VideoUpdater Function / Autoplay Video
function UpdateVideo(videoUrl) {
  myVideo.getElementsByTagName("source")[0].setAttribute('src', videoUrl);
  // myVideo.getElementsByTagName("track")[0].setAttribute('src', videoUrl.substr(0, videoUrl.lastIndexOf('.')) + ".vtt")
  myVideo.load();
  myVideo.play().catch(function() {
    //Ignore the Uncaught (in promise) error.
});;
}

//Master Function for the buttons.
function PreviousNextButtonFunction(action, activeTrigger = null) {
  if (PageName === 'quickAssessment' && action === 1 && moduleName === "main") {
    var slider = document.getElementById("slider");
    if (slider.value <= 50) {
      UpdateVideo(VideoArray[PageName]["quickAssessmentResponse1"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse1`)
      moduleName = 'quickAssessmentResponse1';
    }
    else if (slider.value <= 89) {
      UpdateVideo(VideoArray[PageName]["quickAssessmentResponse2"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse2`)
      moduleName = 'quickAssessmentResponse2';

    }
    else {
      UpdateVideo(VideoArray[PageName]["quickAssessmentResponse3"].VideURL)
      //window.history.pushState(PageName, PageName, `/${id}/EducationalComponent/${type}/quickAssessmentResponse3`)
      moduleName = 'quickAssessmentResponse3';

    }
    document.getElementsByClassName('slider-container')[0].style.display = "none";
  }
  // else if (PageName === "subTopics" && action === 1 && moduleName !== "Talking to your doctor") {
  //   SwitchSubTopicVideo(1,activeTrigger);
  // }
  // //TBD Function
  // else if (PageName === "subTopics" && action === -1 && moduleName !== "Benefits of kidney transplant") {
  //   SwitchSubTopicVideo(-1,activeTrigger);
  // }
  else {
    if (VideoArrayIndex + action < 0) {
      VideoArrayIndex = 0;
    }
    else if (VideoArrayIndex + action > Object.keys(VideoArray).length - 1) {
      VideoArrayIndex = Object.keys(VideoArray).length - 1;
    }
    else {
      VideoArrayIndex = VideoArrayIndex + action;
    }

    PageName = VideoArrNames[VideoArrayIndex]

    if (PageName === "Homepage") {
      logActiveTriggerOrNot(PageName, moduleName = null, activeTrigger = true);
      window.location.href = `/${id}/`
    }
    else if (PageName === "quickAssessment") {
      UpdateVideo(VideoArray[PageName]['main'].VideURL)
      moduleName = "main";
      
    }
    else if (PageName === "subTopics" && action === 1) {
      //UpdateVideo(VideoArray[PageName]['Benefits of kidney transplant'].VideURL)
      moduleName = 'Benefits of kidney transplant';
      UpdateDropdown(moduleName, activeTrigger);
    }
    else if (PageName === "subTopics" && action === -1) {
      //UpdateVideo(VideoArray[PageName]['Benefits of kidney transplant'].VideURL)
      moduleName = 'Benefits of kidney transplant';
      UpdateDropdown(moduleName,activeTrigger)
    }
    else {
      UpdateVideo(VideoArray[PageName].VideURL)
    }

    if (PageName === "Introduction") {
      UpdateTitle("Goals of our Meeting");
    }

    if (PageName === "quickAssessment") {
      nextButton.style.display = "none";
      document.getElementsByClassName('slider-container')[0].style.display = "flex";
      UpdateTitle("Quick Assessment");
    }
    else {
      nextButton.style.display = "block";
      document.getElementsByClassName('slider-container')[0].style.display = "none";
    }

    if (PageName === "subTopics") {
      document.getElementsByClassName('title')[0].style.display = "none";
      document.getElementsByClassName('dropdown')[0].style.display = "block";
      document.getElementsByClassName('checkbox-area')[0].style.display = "flex";
    }
    else {
      document.getElementsByClassName('title')[0].style.display = "block";
      document.getElementsByClassName('dropdown')[0].style.display = "none";
      document.getElementsByClassName('checkbox-area')[0].style.display = "none";
    }

    if(PageName !== "subTopics" && PageName !=="quickAssessment"){
      moduleName = "";
    }

    if (PageName === 'subTopics' && moduleName === "Talking to your doctor") {
      nextButton.style.display = "none";
    }

    if (PageName === "summary") {
      document.getElementsByClassName('container')[0].style.display = "none";
      document.getElementsByClassName('end-container')[0].style.display = "flex";
      UpdateTitle("Selected Topics")

      var container = document.getElementById('selected-topics');

      // Loop through each key-value pair in the object and create a checkbox for each
      for (const [key, value] of Object.entries(additionalInformationTopics)) {
        if (!container.querySelector(`input[type="checkbox"][value="${key}"]`)) {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = value; // Set the 'checked' attribute based on the value
          checkbox.value = key; // Set the 'value' attribute to the key
          checkbox.onchange = UpdateSpecificCheckBox;

          const label = document.createElement('label');
          label.textContent = key;

          const checkboxdiv = document.createElement('div');
          checkboxdiv.classList.add('checkboxdiv');
          checkboxdiv.appendChild(checkbox);
          checkboxdiv.appendChild(label);
          container.appendChild(checkboxdiv);
        }
        else {
          container.querySelector(`input[type="checkbox"][value="${key}"]`).checked = additionalInformationTopics[key];
        }
      }
      nextButton.style.display = "none";
    }
    else {
      document.getElementsByClassName('container')[0].style.display = "block";
      document.getElementsByClassName('end-container')[0].style.display = "none";
    }

    // //Needs to be changed.
    // VideoArray[PageName].PageVisited = true;
    // sessionStorage.setItem("VideoArr", JSON.stringify(VideoArray))
  }
  if(PageName === 'subTopics'){
    //do Nothing
  }
  else{
    logActiveTriggerOrNot(PageName, moduleName , activeTrigger)
  }
}

function UpdateTitle(TitleString) {
  if (document.getElementsByClassName('title').length > 0) {
    document.getElementsByClassName('title')[0].innerHTML = TitleString;
  }
}

function SwitchSubTopicVideo(prevOrNext, activeTrigger = null) {
  const tempArr = ["Benefits of kidney transplant",
    "Who can get a kidney transplant",
    "The transplant work-up",
    "Overview - The waiting list",
    "Living donor transplant",
    "Getting a transplant sooner",
    "How long do kidney transplants last",
    "The risks of kidney transplant",
    "Choosing a transplant center",
    "Who can be a living kidney donor",
    "Talking to your doctor"]
  if (tempArr.indexOf(moduleName) <= tempArr.length - 1) {
    UpdateDropdown(tempArr[tempArr.indexOf(moduleName) + prevOrNext], activeTrigger)
  }
}

async function ResetSession() {
  sessionStorage.setItem("EndTime", Date.now())
  var response = await SendParticipantDataToServer(JSON.parse(sessionStorage.getItem("VideoArr")))

  if(response){
    console.log("Now Exit",Date.now());
    sessionStorage.clear();
    window.location.href = `https://wharton.qualtrics.com/jfe/form/SV_ah5rKWqpP5xIn78?ID=${id}`;
  }
}

function OverviewResponse(responseString) {
  document.getElementsByClassName('overview-buttons')[0].style.display = "none";
  if (responseString === "Not really") {
    UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/waitingListUsefulnessCheckinResponse1.mp4`)

  }
  else if (responseString === "Somewhat useful") {
    UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/waitingListUsefulnessCheckinResponse2.mp4`)
  }
  else {
    UpdateVideo(`https://national-kidney-foundation.s3.amazonaws.com/${type}/waitingListUsefulnessCheckinResponse3.mp4`)
  }
  sessionStorage.setItem("OverviewUsefulnessCheckInResponse", responseString)
  nextButton.style.display = "block";
}

function TakeToSummaryPage(){
  while(PageName !== 'summary'){
    PreviousNextButtonFunction(1);
  }
  logActiveTriggerOrNot(PageName, moduleName = null, activeTrigger = true)
}

function TakeToHomePage(){
  logActiveTriggerOrNot('Homepage', moduleName = null, activeTrigger = true)
  window.location.href = `/${id}/`

}

function ifInvalidSessionTaketoHomePage(hours = 5){
  var now = new Date().getTime();
  var setupTime = sessionStorage.getItem('setupTime');
  if (setupTime === null || (now-setupTime > hours*60*60*1000)) {
    window.location.href = `/${id}/`;
  } 
}