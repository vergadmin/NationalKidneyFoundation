window.addEventListener("load", () => {
    // console.log("SAVING SESSION INFO LOCALLY")
    // console.log(document.URL)

    let browserInfo = ""
    let dateTime = ""
    var type = document.URL.split('/').reverse()[0]
    var id = document.URL.split('/').reverse()[1]

    sessionStorage.clear()
    sessionStorage.setItem("id", id)
    sessionStorage.setItem("type", type)

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
    // console.log(dateTime)
    sendGeneralData(browserInfo, dateTime)


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