let HomepageVisitTimeStamp = Date.now();
let PageName = "Homepage";



 window.addEventListener("load", async() => {
    await clearSessionStorageAfterXHours();
    // console.log("SAVING SESSION INFO LOCALLY")
    // console.log(document.URL)

    let browserInfo = ""
    let dateTime = ""
    // var type = document.URL.split('/').reverse()[0]
    // var id = document.URL.split('/').reverse()[1]
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

async function ContinueOrResetSession(character){
    console.log(character !== sessionStorage.getItem("type"))
    // var type = document.URL.split('/').reverse()[0]
    var id = document.URL.split('/').reverse()[1]
    if(character !== sessionStorage.getItem("type")){    
        if(sessionStorage.getItem('setupTime') !== null){
            sessionStorage.setItem('InterventionEndTime', new Date().toISOString().slice(0, 19).replace('T', ' '));
            await fetch('/submitData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Specify content type as JSON
                },
                body: JSON.stringify(sessionStorage)
            });
        }
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

        sessionStorage.setItem('TotalTimeSpentOnIntervention', 0);
        sessionStorage.setItem('InterventionStartTime', new Date(HomepageVisitTimeStamp).toISOString().slice(0, 19).replace('T', ' '))
        sessionStorage.setItem('NumberOfModulesInteracted', 0);
        setDeviceDetails();
        setSessionStorageSetupTime();
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
        "VideoURL": null,
        "PageVisited": true,
        "PageFirstVisitedTimeStamp": new Date(HomepageVisitTimeStamp).toISOString().slice(0, 19).replace('T', ' '),
        "PageLastVisitedTimeStamp": new Date(HomepageVisitTimeStamp).toISOString().slice(0, 19).replace('T', ' '),
        "NumberOfTimesPageVisited": 1,
        "TimeSpentOnPage":  Math.floor( (Date.now() - HomepageVisitTimeStamp)/1000),
        "ActiveOrPassiveRedirectionToPage": "active",
        },
        'Introduction': {
        "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/Introduction.mp4`,
        "PageVisited": false,
        "PageFirstVisitedTimeStamp": null,
        "PageLastVisitedTimeStamp": null,
        "NumberOfTimesPageVisited": 0,
        "TimeSpentOnPage": null,
        "ActiveOrPassiveRedirectionToPage": null,
        },
        'quickAssessment': {
        "main": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessment.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse1": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse1.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse2": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse2.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "quickAssessmentResponse3": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/quickAssessmentResponse3.mp4`,
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
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantBenefits.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Who can get a kidney transplant": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantEligibility.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "The transplant work-up": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantWorkup.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Overview - The waiting list": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/overviewTransplantWaitingList.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Living donor transplant": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/livingDonorTransplant.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Getting a transplant sooner": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantSooner.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "How long do kidney transplants last": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantLifeSpan.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "The risks of kidney transplant": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/transplantRisks.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Choosing a transplant center": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/choosingTransplantCenter.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Who can be a living kidney donor": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/donorEligibility.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        "Talking to your doctor": {
            "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/talkingToYourDoctor.mp4`,
            "PageVisited": false,
            "PageFirstVisitedTimeStamp": null,
            "PageLastVisitedTimeStamp": null,
            "NumberOfTimesPageVisited": 0,
            "TimeSpentOnPage": null,
            "ActiveOrPassiveRedirectionToPage": null,
        },
        },
        "summary": {
        "VideoURL": `https://national-kidney-foundation.s3.amazonaws.com/${type}/closingMessage.mp4`,
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

async function clearSessionStorageAfterXHours(hours = 5){
    var now = new Date().getTime();
    var setupTime = sessionStorage.getItem('setupTime');
    if (setupTime === null || (now-setupTime > hours*60*60*1000)) {
        if(setupTime !== null){
            sessionStorage.setItem('InterventionEndTime', new Date().toISOString().slice(0, 19).replace('T', ' '));
            const response = await fetch('/submitData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Specify content type as JSON
                },
                body: JSON.stringify(sessionStorage)
            });
            return response
        }
        sessionStorage.clear();
    } 
    return -1
}

function setSessionStorageSetupTime(){
    var now = new Date().getTime();
    sessionStorage.setItem('setupTime', now);
}

function LogTimeSpendOnPage(){
    console.log("hello")
}

function setDeviceDetails(){
    const userAgent = navigator.userAgent;
    const { platform, operatingSystem, browser } = parseUserAgent(userAgent);
    sessionStorage.setItem("platform", platform);
    sessionStorage.setItem("operatingSystem", operatingSystem);
    sessionStorage.setItem("browser", browser);
}