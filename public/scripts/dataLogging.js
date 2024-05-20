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
                LogPageFirstVisitTime(tempArr[Page]);
            }
            LogPageLastVisitedTime(tempArr[Page]);
            LogNumberOfTimesPageVisited(tempArr[Page])
        }
        else if((Page === 'subTopics' || PageName ==='quickAssessment') && moduleName !== null){
            if(tempArr[Page][moduleName].ActiveOrPassiveRedirectionToPage === null){
                if(activeTrigger){
                    tempArr[Page][moduleName].ActiveOrPassiveRedirectionToPage = "active";
                }
                else{
                    tempArr[Page][moduleName].ActiveOrPassiveRedirectionToPage = "passive";
                }
                LogPageFirstVisitTime(tempArr[Page][moduleName]);
            }
            LogPageLastVisitedTime(tempArr[Page][moduleName]);
            LogNumberOfTimesPageVisited(tempArr[Page][moduleName])
        }
        UpdateStorageArray(tempArr)
        console.log(GetStorageArray())
    }
}

function GetStorageArray(){
    return JSON.parse(sessionStorage.getItem("VideoArr"));
}

function UpdateStorageArray(tempArr){
    sessionStorage.setItem("VideoArr", JSON.stringify(tempArr));
}

function LogNumberOfTimesPageVisited(DataArray){
    DataArray.NumberOfTimesPageVisited +=1
}

function LogPageFirstVisitTime(DataArray){
    DataArray.PageFirstVisitedTimeStamp = Date.now();
    DataArray.PageVisited = true;
}

function LogPageLastVisitedTime(DataArray){
    DataArray.PageLastVisitedTimeStamp = Date.now();
}