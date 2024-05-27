var NotRegularPages = ['quickAssessment','subTopics'];
LogTimeSpendOnPage();

async function SendParticipantDataToServer() {
    try {
        document.getElementsByClassName("finish")[0].disabled = true;

        const tempArr = JSON.parse(sessionStorage.getItem("VideoArr"));
        if (tempArr !== null) {
            sessionStorage.setItem('InterventionEndTime', new Date().toISOString().slice(0, 19).replace('T', ' '));
        }

        const response = await fetch('/submitData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
            body: JSON.stringify(sessionStorage)
        });

        const data = await response.text();
        console.log(data);
        return response
    } catch (error) {
        console.error('Error:', error);
    }
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
                    LogSubTopicsModulesVisited(Page);
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

function LogSubTopicsModulesVisited(Page){
    if(Page === "subTopics"){
        sessionStorage.setItem("NumberOfModulesInteracted", parseInt(sessionStorage.getItem("NumberOfModulesInteracted")) + 1)
    }
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