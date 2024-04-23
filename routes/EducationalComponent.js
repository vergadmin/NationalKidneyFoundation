const express = require('express')
const router = express.Router()
var sql = require("mssql");

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

 /* let buttons = [
    {
        url: 'Introduction',
        text: "Introduction"
    },
    {
        url: '1',
        text: "What are research studies?"
    },
    {
        url: '2',
        text: "Why consider participating?"
    },
    {
        url: '3',
        text: "Are research studies safe?"
    },
    {
        url: '4',
        text: "How to participate in research and where to start?"
    }
] 
*/

router.get('/:type/Introduction', getInfo, updateDatabase, (req, res) => { // displays  the text "Introduction" in the URL
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/introduction", {id: id, type: type, nextPageURL: 'quickAssessment', url: 'Introduction'})
})


router.get('/:type/quickAssessment', getInfo, updateDatabase, (req, res) => {
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/quickAssessment", {id: id, type: type,  nextPageURL: 'transplantBenefits', url: 'quickAssessment'}) //remove next page url
})

router.get('/:type/quickAssessmentResponse1', getInfo, updateDatabase, (req, res) => {
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/quickAssessmentResponse1", {id: id, type: type,  nextPageURL: 'transplantBenefits', url: 'quickAssessmentResponse1'}) //remove next page url
})

router.get('/:type/quickAssessmentResponse2', getInfo, updateDatabase, (req, res) => {
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/quickAssessmentResponse2", {id: id, type: type,  nextPageURL: 'transplantBenefits', url: 'quickAssessmentResponse2'}) //remove next page url
})

router.get('/:type/quickAssessmentResponse3', getInfo, updateDatabase, (req, res) => {
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/quickAssessmentResponse3", {id: id, type: type,  nextPageURL: 'transplantBenefits', url: 'quickAssessmentResponse3'}) //remove next page url
})


//added by Roshan; these are the dropdown pages

router.get('/:type/transplantBenefits', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantBenefits", {id: id, type: type, nextPageURL: 'transplantEligibility', url: 'transplantBenefits', pageName: 'Benefits of kidney transplant'})
})

router.get('/:type/transplantEligibility', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantEligibility", {id: id, type: type, nextPageURL: 'transplantWorkup', url: 'transplantEligibility', pageName: 'Who can get a Kidney transplant'})
})

router.get('/:type/transplantWorkup', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantWorkup", {id: id, type: type, nextPageURL: 'overviewTransplantWaitingList', url: 'transplantWorkup', pageName: 'The transplant work-up'})
})

router.get('/:type/overviewTransplantWaitingList', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/overviewTransplantWaitingList", {id: id, type: type, nextPageURL: 'livingDonorTransplant', url: 'overviewTransplantWaitingList', pageName: 'Overwiew - the waiting list'}) //remove next page url
})

router.get('/:type/livingDonorTransplant', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/livingDonorTransplant", {id: id, type: type, nextPageURL: 'transplantSooner', url: 'livingDonorTransplant', pageName: 'Living donor transplant'})
})

router.get('/:type/transplantSooner', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantSooner", {id: id, type: type, nextPageURL: 'transplantLifeSpan', url: 'transplantSooner', pageName: 'Getting a transplant sooner'})
})

router.get('/:type/transplantLifeSpan', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantLifeSpan", {id: id, type: type, nextPageURL: 'transplantRisks', url: 'transplantLifeSpan', pageName: 'How long do kidney transplants last'})
})

router.get('/:type/transplantRisks', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/transplantRisks", {id: id, type: type, nextPageURL: 'choosingTransplantCenter', url: 'transplantRisks', pageName: 'The risks of kidney transplant'})
})

router.get('/:type/choosingTransplantCenter', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/choosingTransplantCenter", {id: id, type: type, nextPageURL: 'donorEligibility', url: 'choosingTransplantCenter', pageName: 'Choosing a transplant center'})
})

router.get('/:type/donorEligibility', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/donorEligibility", {id: id, type: type, nextPageURL: 'talkingToYourDoctor', url: 'donorEligibility', pageName: 'Who can be a living kidney donor'})
})

router.get('/:type/talkingToYourDoctor', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/talkingToYourDoctor", {id: id, type: type, nextPageURL: 'endOfMeetingResponse1', url: 'talkingToYourDoctor', pageName: 'Talking to your doctor'})  //remove next page url
})

router.get('/:type/endOfMeetingResponse2', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/endOfMeetingResponse2", {id: id, type: type, nextPageURL: 'summaryTopics', url: 'endOfMeetingResponse2'})  //remove next page url
})

router.get('/:type/endOfMeetingResponse1', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/endOfMeetingResponse1", {id: id, type: type, nextPageURL: 'summaryTopics', url: 'endOfMeetingResponse1'})  //remove next page url
})


router.get('/:type/summaryTopics', getInfo, updateDatabase, (req, res) => { 
    type=req.params.type
    console.log('Hiel: ',type)
    res.render("pages/type/EducationalComponent/summaryTopics", {id: id, type: type, url: 'summaryTopics'})  
})

function getInfo(req, res, next) {
    // console.log("IN MIDDLEWARE OF EDUCATIONAL COMPONENT - REQUEST PARAMS:")
    id = req.id
    userInfo = req.userInfo
    // console.log("type is " + type);
    next()
}

function updateDatabase(req, res, next) {
    // console.log("IN UPDATE DATABASE")
    // console.log(req.url)
    let dbEntry = req.url.slice(1)
    // console.log(dbEntry)
    userInfo = req.userInfo;
    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // let queryString = 'UPDATE R24 SET Educational_' + dbEntry + `='clicked' WHERE ID=` + `'` + userInfo.ID + `'`; // UNCOMMENT:`'AND TYPE ='` + type + `'`;
        let queryString = `
        UPDATE R24
        SET Educational_` + dbEntry + `= 'clicked'
        WHERE ID = '` + userInfo.ID + `' 
        AND VisitNum = '` + userInfo.visitNum + `'`;

        // console.log(queryString)
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
            // send records as a response
            /// console.log("UPDATED! IN R24U01 TABLE:")
            // console.log(recordset);
        }); 
        // res.send("Updated.");
    
    });
    // END DATABASE STUFF

    next();
}

module.exports = router