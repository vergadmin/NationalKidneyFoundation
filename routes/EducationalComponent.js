const express = require('express')
const router = express.Router()
var sql = require("mssql");
const app = express();

var id = ''
var vh = ''
var type = ''

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

router.get('/:type/Introduction', getInfo, (req, res) => { // displays  the text "Introduction" in the URL
    type=req.params.type
    res.render("pages/type/EducationalComponent/introduction", {id: id, type: type, nextPageURL: 'quickAssessment', url: 'Introduction'})
})

function getInfo(req, res, next) {
    // console.log("IN MIDDLEWARE OF EDUCATIONAL COMPONENT - REQUEST PARAMS:")
    id = req.id
    userInfo = req.userInfo
    // console.log("type is " + type);
    next()
}

// async function connectToDatabase() {
//     try {
//         await sql.connect(config);
//         console.log('Connected to the database.');
//     } catch (err) {
//         console.error('Database connection failed: ', err);
//     }
// }

// async function addParticipantVisit(data) {
//     const { ParticipantID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse } = data;

//     const getNextVisitIDQuery = `SELECT COUNT(*) AS visitCount FROM ParticipantVisits WHERE ParticipantID = @ParticipantID`;

//     try {
//         const request = new sql.Request();
//         request.input('ParticipantID', sql.VarChar, ParticipantID);
        
//         const result = await request.query(getNextVisitIDQuery);
//         const VisitID = result.recordset[0].visitCount + 1;

//         const insertQuery = `
//         INSERT INTO ParticipantVisits 
//         (ParticipantID, VisitID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse) 
//         VALUES (@ParticipantID, @VisitID, @Platform, @OperatingSystem, @Browser, @CharacterSelected, @InterventionStartTime, @InterventionEndTime, @TotalTimeSpentOnIntervention, @NumberOfModulesInteracted, @KidneyTransplantResponse, @OverviewUsefulnessCheckinResponse)`;

//         request.input('VisitID', sql.Int, VisitID);
//         request.input('Platform', sql.VarChar, Platform);
//         request.input('OperatingSystem', sql.VarChar, OperatingSystem);
//         request.input('Browser', sql.VarChar, Browser);
//         request.input('CharacterSelected', sql.VarChar, CharacterSelected);
//         request.input('InterventionStartTime', sql.DateTime, InterventionStartTime);
//         request.input('InterventionEndTime', sql.DateTime, InterventionEndTime);
//         request.input('TotalTimeSpentOnIntervention', sql.Int, TotalTimeSpentOnIntervention);
//         request.input('NumberOfModulesInteracted', sql.Int, NumberOfModulesInteracted);
//         request.input('KidneyTransplantResponse', sql.Int, KidneyTransplantResponse);
//         request.input('OverviewUsefulnessCheckinResponse', sql.VarChar, OverviewUsefulnessCheckinResponse);

//         await request.query(insertQuery);
//         return VisitID;
//     } catch (err) {
//         console.error('Error inserting participant visit data: ', err);
//         throw err;
//     }
// }

module.exports = router
// app.listen(process.env.PORT || 3000);