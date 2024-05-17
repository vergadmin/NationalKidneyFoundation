var NotRegularPages = ['quickAssessment','subTopics'];

async function SendParticipantDataToServer() {
    var i = 0;
    while (i < 10) {
      await delay(100);  // Wait for 100 milliseconds
      console.log("hey", Date.now());
      i += 1;
    }
    return 1;
  }

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logActiveTriggerOrNot(Page, moduleName = null, activeTrigger = null){
    tempArr = JSON.parse(sessionStorage.getItem("VideoArr"));
    if(activeTrigger !== null){
        if(!NotRegularPages.includes(Page)){
            if(tempArr[Page].ActiveOrPassiveRedirectionToPage === null){
                if(activeTrigger){
                    tempArr[Page].ActiveOrPassiveRedirectionToPage = "active";
                }
                else{
                    tempArr[Page].ActiveOrPassiveRedirectionToPage = "passive";
                }
            }
        }
        else if(Page === 'subTopics' && moduleName !== null){
            if(activeTrigger){
                tempArr[Page][moduleName].ActiveOrPassiveRedirectionToPage = "active";
            }
            else{
                tempArr[Page][moduleName].ActiveOrPassiveRedirectionToPage = "passive";
            }
        }
        UpdateStorageArray(tempArr)
    }
}

function GetStorageArray(){
    return JSON.parse(sessionStorage.getItem("VideoArr"));
}

function UpdateStorageArray(tempArr){
    sessionStorage.setItem("VideoArr", JSON.stringify(tempArr));
}