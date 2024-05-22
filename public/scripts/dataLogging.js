var NotRegularPages = ['quickAssessment','subTopics'];

LogTimeSpendOnPage();

async function SendParticipantDataToServer() {
    document.getElementsByClassName("finish")[0].disabled = true;

    tempArr = JSON.parse(sessionStorage.getItem("VideoArr"));
    if(tempArr !== null){
        sessionStorage.setItem('InterventionEndTime', new Date().toISOString().slice(0, 19).replace('T', ' '));
    }
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
    if(tempArr !== null){
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
            else if((Page === 'subTopics' || Page ==='quickAssessment') && moduleName !== null){
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
    else{
        ifInvalidSessionTaketoHomePage();
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
    DataArray.PageFirstVisitedTimeStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    DataArray.PageVisited = true;
}

function LogPageLastVisitedTime(DataArray){
    DataArray.PageLastVisitedTimeStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
}

async function LogTimeSpendOnPage(){
    tempArr = JSON.parse(sessionStorage.getItem("VideoArr"));
    if(tempArr !== null){
        if(!NotRegularPages.includes(PageName)){
            if(tempArr[PageName].TimeSpentOnPage === null){
                tempArr[PageName].TimeSpentOnPage = 0
            }
            else{
            tempArr[PageName].TimeSpentOnPage += 1;
            }
        }
        else if((PageName === 'subTopics' || PageName ==='quickAssessment') && moduleName !== null){
            if(tempArr[PageName][moduleName].TimeSpentOnPage === null){
                tempArr[PageName][moduleName].TimeSpentOnPage = 0
            }
            else{
                tempArr[PageName][moduleName].TimeSpentOnPage += 1;
            }
        }
        UpdateTotalTimeSpentOnIntervention();
        UpdateStorageArray(tempArr);
        await delay(1000);
        LogTimeSpendOnPage();
    }
}

function UpdateTotalTimeSpentOnIntervention(){
    sessionStorage.setItem("TotalTimeSpentOnIntervention", parseInt(sessionStorage.getItem("TotalTimeSpentOnIntervention")) + 1);
}