const express = require('express')
const session = require('express-session');
const cors = require('cors');
const stringSimilarity = require('string-similarity');
const { initializePool, getPool, sql } = require('./database');

const app = express()
const CryptoJS = require("crypto-js");

require('dotenv').config()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json())

var userInfo = []

// Initialize database pool
initializePool().catch(err => {
    console.error('Failed to initialize database pool:', err);
    process.exit(1);
});

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 15,
        secure: true,
    }
}))

app.get('/', (req, res) => {
    id = req.params.id
    res.render('pages/index',{id: id})
})

app.get('/favicon.ico', (req, res) => res.status(204));

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/EducationalComponent', function(req,res,next) {
    req.id = id;
    req.userInfo = userInfo
    next();
}, EducationalComponentRouter)

const downloadRouter = require('./routes/DataDownloadComponent');
app.use('/download', downloadRouter);

const dashboardRouter = require('./routes/Dashboard');
app.use('/dashboard', dashboardRouter);

async function UploadToDatabase(data) {
    const pool = getPool();
    
    var participantData = {
        ParticipantID: data.id,
        Source: data.Source,
        Platform: data.platform,
        OperatingSystem: data.operatingSystem,
        Browser: data.browser,
        CharacterSelected: data.type,
        InterventionStartTime: data.InterventionStartTime,
        InterventionEndTime: data.InterventionEndTime,
        TotalTimeSpentOnIntervention: data.TotalTimeSpentOnIntervention,
        NumberOfModulesInteracted: data.NumberOfModulesInteracted,
        KidneyTransplantResponse: data.sliderResponse,
        OverviewUsefulnessCheckinResponse: data.OverviewUsefulnessCheckInResponse,
    };
    
    try {
        var visitID = await addParticipantVisit(participantData, pool);
        console.log(participantData)
        console.log(`Participant visit inserted with VisitID: ${visitID}`);

        for (const [outerKey, outerValue] of Object.entries(JSON.parse(data.VideoArr))) {
            if(outerKey === "subTopics" || outerKey === "quickAssessment"){
                for(const [innerKey, innerValue] of Object.entries(outerValue)){
                    tempData = innerValue;
                    var pageVisitData = {
                        PageName: innerKey,
                        ParticipantID: data.id,
                        VisitID: visitID,
                        Source: data.Source,
                        PageVisited: tempData.PageVisited,
                        PageFirstVisitedTimeStamp: tempData.PageFirstVisitedTimeStamp,
                        PageLastVisitedTimeStamp: tempData.PageLastVisitedTimeStamp,
                        NumberOfTimesPageVisited: tempData.NumberOfTimesPageVisited,
                        TimeSpentOnPage: tempData.TimeSpentOnPage,
                        ActiveOrPassiveRedirectionToPage: tempData.ActiveOrPassiveRedirectionToPage,
                        };
                    if(outerKey === "subTopics"){
                        pageVisitData.MoreInformationRequested = JSON.parse(data.additionalInformationTopics)[innerKey];
                    }
                    await addPageVisit(pageVisitData, pool);
                }
            }
            else{
                tempData = outerValue;
                var pageVisitData = {
                    PageName: outerKey,
                    ParticipantID: data.id,
                    VisitID: visitID,
                    Source: data.Source,
                    PageVisited: tempData.PageVisited,
                    PageFirstVisitedTimeStamp: tempData.PageFirstVisitedTimeStamp,
                    PageLastVisitedTimeStamp: tempData.PageLastVisitedTimeStamp,
                    NumberOfTimesPageVisited: tempData.NumberOfTimesPageVisited,
                    TimeSpentOnPage: tempData.TimeSpentOnPage,
                    ActiveOrPassiveRedirectionToPage: tempData.ActiveOrPassiveRedirectionToPage,
                    };
                await addPageVisit(pageVisitData, pool);
            }
        }
        console.log('Page visit data inserted successfully.');
    } catch (err) {
        console.error('Error during data insertion: ', err);
        throw err;
    }
}

app.post('/submitData', async (req, res) => {
    try {
        const requestData = req.body;
        await UploadToDatabase(requestData);
        res.send('Function executed successfully');
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send('Error processing request');
    }
});

async function addParticipantVisit(data, pool) {
    const { ParticipantID, Source, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse } = data;
  
    const getNextVisitIDQuery = `SELECT COUNT(*) AS visitCount FROM ParticipantVisits WHERE ParticipantID = @ParticipantID`;
  
    try {
      const request = pool.request();
      request.input('ParticipantID', sql.VarChar, ParticipantID);
      
      const result = await request.query(getNextVisitIDQuery);
      const VisitID = result.recordset[0].visitCount + 1;
  
      const insertQuery = `
        INSERT INTO ParticipantVisits 
        (ParticipantID, VisitID, Source, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse) 
        VALUES (@ParticipantID, @VisitID, @Source, @Platform, @OperatingSystem, @Browser, @CharacterSelected, @InterventionStartTime, @InterventionEndTime, @TotalTimeSpentOnIntervention, @NumberOfModulesInteracted, @KidneyTransplantResponse, @OverviewUsefulnessCheckinResponse)`;
  
      request.input('VisitID', sql.Int, VisitID);
      request.input('Source', sql.VarChar, Source || null);
      request.input('Platform', sql.VarChar, Platform);
      request.input('OperatingSystem', sql.VarChar, OperatingSystem);
      request.input('Browser', sql.VarChar, Browser);
      request.input('CharacterSelected', sql.VarChar, CharacterSelected);
      request.input('InterventionStartTime', sql.DateTime, InterventionStartTime);
      request.input('InterventionEndTime', sql.DateTime, InterventionEndTime);
      request.input('TotalTimeSpentOnIntervention', sql.Int, TotalTimeSpentOnIntervention);
      request.input('NumberOfModulesInteracted', sql.Int, NumberOfModulesInteracted);
      request.input('KidneyTransplantResponse', sql.Int, KidneyTransplantResponse || null);
      request.input('OverviewUsefulnessCheckinResponse', sql.VarChar, OverviewUsefulnessCheckinResponse || null);
  
      await request.query(insertQuery);
      return VisitID;
    } catch (err) {
      console.error('Error inserting participant visit data: ', err);
      throw err;
    }
  }

async function addPageVisit(data, pool) {
    const { ParticipantID, VisitID, PageName, Source, PageVisited, PageFirstVisitedTimeStamp, PageLastVisitedTimeStamp, NumberOfTimesPageVisited, TimeSpentOnPage, ActiveOrPassiveRedirectionToPage, MoreInformationRequested } = data;

    const insertQuery = `
        INSERT INTO PageVisits 
        (ParticipantID, VisitID, PageName, Source, PageVisited, PageFirstVisitedTimeStamp, PageLastVisitedTimeStamp, NumberOfTimesPageVisited, TimeSpentOnPage, ActiveOrPassiveRedirectionToPage, MoreInformationRequested) 
        VALUES (@ParticipantID, @VisitID, @PageName, @Source, @PageVisited, @PageFirstVisitedTimeStamp, @PageLastVisitedTimeStamp, @NumberOfTimesPageVisited, @TimeSpentOnPage, @ActiveOrPassiveRedirectionToPage, @MoreInformationRequested)`;

    try {
        const request = pool.request();
        request.input('ParticipantID', sql.VarChar, ParticipantID);
        request.input('VisitID', sql.Int, VisitID);
        request.input('PageName', sql.VarChar, PageName);
        request.input('Source', sql.VarChar, Source || null);
        request.input('PageVisited', sql.Bit, PageVisited);
        request.input('PageFirstVisitedTimeStamp', sql.DateTime, PageFirstVisitedTimeStamp);
        request.input('PageLastVisitedTimeStamp', sql.DateTime, PageLastVisitedTimeStamp);
        request.input('NumberOfTimesPageVisited', sql.Int, NumberOfTimesPageVisited);
        request.input('TimeSpentOnPage', sql.Int, TimeSpentOnPage);
        request.input('ActiveOrPassiveRedirectionToPage', sql.VarChar, ActiveOrPassiveRedirectionToPage);
        request.input('MoreInformationRequested', sql.Bit, MoreInformationRequested || null);

        await request.query(insertQuery);
    } catch (err) {
        console.error('Error inserting page visit data: ', err);
        throw err;
    }
}

app.listen(process.env.PORT || 3000);