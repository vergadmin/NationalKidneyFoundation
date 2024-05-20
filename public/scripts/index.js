window.addEventListener("load", () => {
    // console.log("SAVING SESSION INFO LOCALLY")
    // console.log(document.URL)

    let browserInfo = ""
    let dateTime = ""
    // var type = document.URL.split('/').reverse()[0]
    // var id = document.URL.split('/').reverse()[1]

    // sessionStorage.clear()
    // sessionStorage.setItem("id", id)
    // sessionStorage.setItem("type", type)

    // additionalInformationTopics = {
    //     "Benefits of kidney transplant": false,
    //     "Who can get a kidney transplant": false,
    //     "The transplant work-up": false,
    //     "Overview - The waiting list": false,
    //     "Living donor transplant": false,
    //     "Getting a transplant sooner": false,
    //     "How long do kidney transplants last": false,
    //     "The risks of kidney transplant": false,
    //     "Choosing a transplant center": false,
    //     "Who can be a living kidney donor": false,
    //     "Talking to your doctor": false
    // };
    // sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));

    // // (B1) PARSE USER AGENT
    // browserInfo = navigator.userAgent;
    // // console.log(browserInfo)

    // // console.log("TIME")
    // dateTime = new Date().toLocaleString() + " " + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // sessionStorage.setItem('startTime', Date.now());

    // sessionStorage.setItem('TotalTimeSpentOnIntervention', 0)

    // console.log(dateTime)
   // sendGeneralData(browserInfo, dateTime)
});

async function sendGeneralData(browserInfo, dateTime) {
    // console.log("IN SEND TO SERVER GENERAL DATA")

    let url = '/updateDatabase';
    let data = {
        'DateTime': dateTime,
        'BrowserInfo': browserInfo,
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        let ret = await res.json();
        return JSON.parse(ret.data);

    } else {
        return `HTTP error: ${res.status}`;
    }
}

// function SessionStorageValidity(){
//     var hours = 0.001; // to clear the localStorage after 1 hour
//     // (if someone want to clear after 8hrs simply change hours=8)
//     var now = new Date().getTime();
//     var setupTime = sessionStorage.getItem('setupTime');
//     if (setupTime == null) {
//     sessionStorage.setItem('setupTime', now)
//     } else {
//     if(now-setupTime > hours*60*60*1000) {
//     sessionStorage.clear()
//     sessionStorage.setItem('setupTime', now);
//     window.location.href=`/${id}/`
//     }
//     }
//     console.log("Session Reset!")
// }

function ContinueOrResetSession(character){
    console.log(character !== sessionStorage.getItem("type"))
    if(character !== sessionStorage.getItem("type")){
        var type = document.URL.split('/').reverse()[0]
        var id = document.URL.split('/').reverse()[1]
    
        sessionStorage.clear()
        sessionStorage.setItem("id", id)
        sessionStorage.setItem("type", character)
    
        additionalInformationTopics = {
            "Benefits of kidney transplant": false,
            "Who can get a kidney transplant": false,
            "The transplant work-up": false,
            "Overview - The waiting list": false,
            "Living donor transplant": false,
            "Getting a transplant sooner": false,
            "How long do kidney transplants last": false,
            "The risks of kidney transplant": false,
            "Choosing a transplant center": false,
            "Who can be a living kidney donor": false,
            "Talking to your doctor": false
        };
        sessionStorage.setItem('additionalInformationTopics', JSON.stringify(additionalInformationTopics));

        // (B1) PARSE USER AGENT
        browserInfo = navigator.userAgent;
        // console.log(browserInfo)

        // console.log("TIME")
        dateTime = new Date().toLocaleString() + " " + Intl.DateTimeFormat().resolvedOptions().timeZone;
        sessionStorage.setItem('startTime', Date.now());

        sessionStorage.setItem('TotalTimeSpentOnIntervention', 0)
    }
    CreateVideoDataArray();
    logActiveTriggerOrNot('Introduction', moduleName = null, activeTrigger = true)
    window.location.href=`/${id}/EducationalComponent/${character}/Introduction`
}

function CreateVideoDataArray(){

    var type = sessionStorage.getItem("type")

    //Remove this line later, just for timebeing when chnages to VideoArray Format are still being made.
    if (sessionStorage.getItem("VideoArr") === null) {
    var VideoArray = {
        'Homepage': {
        "VideURL": null,
        "PageVisited": true,
        "PageFirstVisitedTimeStamp": Date.now(),
        "PageLastVisitedTimeStamp": Date.now(),
        "NumberOfTimesPageVisited": 1,
        "TimeSpentOnPage": null,
        "ActiveOrPassiveRedirectionToPage": "active",
        },
        'Introduction': {
        "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/Introduction.mp4`,
        "PageVisited": false,
        "PageFirstVisitedTimeStamp": null,
        "PageLastVisitedTimeStamp": null,
        "NumberOfTimesPageVisited": 0,
        "TimeSpentOnPage": null,
        "ActiveOrPassiveRedirectionToPage": null,
        },
        'quickAssessment': {
        "main": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessment.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse1": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse1.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse2": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse2.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse3": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse3.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        }
        },
        "subTopics": {
        "Benefits of kidney transplant": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantBenefits.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Who can get a kidney transplant": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/donorEligibility.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "The transplant work-up": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantWorkup.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Overview - The waiting list": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/overviewTransplantWaitingList.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Living donor transplant": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/livingDonorTransplant.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Getting a transplant sooner": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantSooner.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "How long do kidney transplants last": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantLifeSpan.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "The risks of kidney transplant": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantRisks.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Choosing a transplant center": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/choosingTransplantCenter.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Who can be a living kidney donor": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantLifeSpan.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Talking to your doctor": {
            "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/talkingToYourDoctor.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        },
        "summary": {
        "VideURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/closingMessage.mp4`,
        "PageVisited": false,
        "PageFirstVisitedTimeStamp": null,
        "PageLastVisitedTimeStamp": null,
        "NumberOfTimesPageVisited": 0,
        "TimeSpentOnPage": null,
        "ActiveOrPassiveRedirectionToPage": null,
        }
    }
    sessionStorage.setItem("VideoArr", JSON.stringify(VideoArray))
    }
    else {
    VideoArray = JSON.parse(sessionStorage.getItem("VideoArr"))
    }
}