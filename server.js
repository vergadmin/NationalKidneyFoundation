const express = require('express')
const session = require('express-session');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

const app = express()
const CryptoJS = require("crypto-js");

require('dotenv').config()
// console.log(process.env)

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json())
var sql = require("mssql");

var userInfo = []

const config = {
    user: 'VergAdmin',
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: parseInt(process.env.DBPORT, 10), 
    database: process.env.DATABASE,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

async function connectToDatabase() {
    try {
      await sql.connect(config);
      console.log('Connected to the database.');
    } catch (err) {
      console.error('Database connection failed: ', err);
    }
}
  
  async function closeDatabaseConnection() {
    try {
      await sql.close();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing database connection: ', err);
    }
}

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 15,
        secure: true, // switch to true
    }
}))

app.get('/:id', (req, res) => {
    id = req.params.id
    res.render('pages/index',{id: id})
})

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/:id/EducationalComponent', function(req,res,next) {
    req.id = id;
    //req.type = type
    req.userInfo = userInfo
    next();
}, EducationalComponentRouter)


async function UploadToDatabase(data) {

    await connectToDatabase() ;

    var participantData = {
        ParticipantID: data.id,
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
        var visitID = await addParticipantVisit(participantData);
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
                    await addPageVisit(pageVisitData);
                }
            }
            else{
                tempData = outerValue;
                var pageVisitData = {
                    PageName: outerKey,
                    ParticipantID: data.id,
                    VisitID: visitID,
                    PageVisited: tempData.PageVisited,
                    PageFirstVisitedTimeStamp: tempData.PageFirstVisitedTimeStamp,
                    PageLastVisitedTimeStamp: tempData.PageLastVisitedTimeStamp,
                    NumberOfTimesPageVisited: tempData.NumberOfTimesPageVisited,
                    TimeSpentOnPage: tempData.TimeSpentOnPage,
                    ActiveOrPassiveRedirectionToPage: tempData.ActiveOrPassiveRedirectionToPage,
                    };
                await addPageVisit(pageVisitData);
            }
        }
        console.log('Page visit data inserted successfully.');
    } catch (err) {
        console.error('Error during data insertion: ', err);
    } finally {
        await closeDatabaseConnection();
    }
}

// Set up an endpoint to trigger this function
app.post('/submitData', (req, res) => {
    try {
        const requestData = req.body; // Access the data sent from the client
        UploadToDatabase(requestData); // Pass the data to your function
        res.send('Function executed successfully');
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send('Error processing request');
    }
});

async function addParticipantVisit(data) {
    const { ParticipantID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse } = data;
  
    const getNextVisitIDQuery = `SELECT COUNT(*) AS visitCount FROM ParticipantVisits WHERE ParticipantID = @ParticipantID`;
  
    try {
      const request = new sql.Request();
      request.input('ParticipantID', sql.VarChar, ParticipantID);
      
      const result = await request.query(getNextVisitIDQuery);
      const VisitID = result.recordset[0].visitCount + 1;
  
      const insertQuery = `
        INSERT INTO ParticipantVisits 
        (ParticipantID, VisitID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse) 
        VALUES (@ParticipantID, @VisitID, @Platform, @OperatingSystem, @Browser, @CharacterSelected, @InterventionStartTime, @InterventionEndTime, @TotalTimeSpentOnIntervention, @NumberOfModulesInteracted, @KidneyTransplantResponse, @OverviewUsefulnessCheckinResponse)`;
  
      request.input('VisitID', sql.Int, VisitID);
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
  async function addPageVisit(data) {
    const { ParticipantID, VisitID, PageName, PageVisited, PageFirstVisitedTimeStamp, PageLastVisitedTimeStamp, NumberOfTimesPageVisited, TimeSpentOnPage, ActiveOrPassiveRedirectionToPage, MoreInformationRequested } = data;

    const insertQuery = `
        INSERT INTO PageVisits 
        (ParticipantID, VisitID, PageName, PageVisited, PageFirstVisitedTimeStamp, PageLastVisitedTimeStamp, NumberOfTimesPageVisited, TimeSpentOnPage, ActiveOrPassiveRedirectionToPage, MoreInformationRequested) 
        VALUES (@ParticipantID, @VisitID, @PageName, @PageVisited, @PageFirstVisitedTimeStamp, @PageLastVisitedTimeStamp, @NumberOfTimesPageVisited, @TimeSpentOnPage, @ActiveOrPassiveRedirectionToPage, @MoreInformationRequested)`;

    try {
        const request = new sql.Request();
        request.input('ParticipantID', sql.VarChar, ParticipantID);
        request.input('VisitID', sql.Int, VisitID);
        request.input('PageName', sql.VarChar, PageName);
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