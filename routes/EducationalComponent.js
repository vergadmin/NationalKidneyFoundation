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


// router.get('/:type/Introduction', (req, res) => { // displays  the text "Introduction" in the URL
//     type=req.params.type
//     res.render("pages/type/EducationalComponent/introduction", {id: id, type: type, nextPageURL: 'quickAssessment', url: 'Introduction'})
// })

// function getInfo(req, res, next) {
//     // console.log("IN MIDDLEWARE OF EDUCATIONAL COMPONENT - REQUEST PARAMS:")
//     id = req.id
//     userInfo = req.userInfo
//     // console.log("type is " + type);
//     next()
// }

// function updateDatabase(req, res, next) {
//     // console.log("IN UPDATE DATABASE")
//     // console.log(req.url)
//     let dbEntry = req.url.slice(1)
//     // console.log(dbEntry)
//     userInfo = req.userInfo;
//     // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
//     sql.connect(config, function (err) {

//         if (err) console.log(err);

//         // create Request object
//         var request = new sql.Request();

//         // let queryString = 'UPDATE R24 SET Educational_' + dbEntry + `='clicked' WHERE ID=` + `'` + userInfo.ID + `'`; // UNCOMMENT:`'AND TYPE ='` + type + `'`;
//         let queryString = `
//         UPDATE R24
//         SET Educational_` + dbEntry + `= 'clicked'
//         WHERE ID = '` + userInfo.ID + `' 
//         AND VisitNum = '` + userInfo.visitNum + `'`;

//         // console.log(queryString)
//         request.query(queryString, function (err, recordset) {
//             if (err) console.log(err)
//             // send records as a response
//             /// console.log("UPDATED! IN R24U01 TABLE:")
//             // console.log(recordset);
//         }); 
//         // res.send("Updated.");
    
//     });
//     // END DATABASE STUFF

//     next();
// }

module.exports = router