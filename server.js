const express = require('express')
const session = require('express-session');
const stringSimilarity = require('string-similarity');

const app = express()
const CryptoJS = require("crypto-js");

require('dotenv').config()
// console.log(process.env)

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json())
var sql = require("mssql");

var vh = ''
var type = ''
var visitNum = -1;

const columnNames = ['diseases', 'synonym1', 'synonym2', 'synonym3', 'synonym4', 'synonym5', 'synonym6', 'synonym7', 'synonym8', 'synonym9', 'synonym10', 'synonym11', 'synonym12', 'synonym13', 'synonym14', 'synonym15', 'synonym16', 'synonym17', 'synonym18', 'synonym19', 'synonym20', 'synonym21', 'synonym22', 'synonym23', 'synonym24', 'synonym25', 'synonym26', 'synonym27', 'synonym28', 'synonym29', 'synonym30', 'synonym31', 'synonym32', 'synonym33', 'synonym34', 'synonym35', 'synonym36', 'synonym37', 'synonym38', 'synonym39', 'synonym40', 'synonym41', 'synonym42', 'synonym43', 'synonym44', 'synonym45', 'synonym46', 'synonym47', 'synonym48', 'synonym49', 'synonym50', 'synonym51'];
const vhTypes = ["bfe", "bme", "wfe", "wme", "hfe", "hme", "hfs", "hms"];
// Modify based on Miriam/Emma's Qualtrics:
const orderOfInfo =  ["I", "G", "E", "R"];
const columnsInAG = 369
const columnsInHO = 305
const columnsInPZ = 355

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

app.post('/updateDatabase', async (req, res) => {
    let setList = ''
    console.log(userInfo)
    console.log(req.session.visitedIndex);
    for (const [key, value] of Object.entries(req.body)) {
        if (key==="VHType") {
            vh = value
        }
        setList += key + `='` + value + `', `
    }
    setList = setList.slice(0, -2); 
    // console.log(setList);

    // BEGIN DATABSAE STUFF:SENDING VERSION (R24 OR U01) AND ID TO DATABASE
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        let queryString = `
        UPDATE R24
        SET ` + setList + 
        ` WHERE ID = '` + userInfo.ID + `' 
        AND VisitNum = '` + userInfo.visitNum + `'`;
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err) 

            res.send("Updated.");
        }); 
    
    });
    // END DATABASE STUFF
})

app.post("/:id/:type/RetrieveConditions", (req, res) => {
    let searchValue = (Object.entries(req.body)[0][1])
    // console.log(searchValue);
    const columnConditions = columnNames.map(column => `${column} LIKE '%${searchValue}%'`).join(' OR ')
    // const finalConditions = columnConditions.slice(0, -3);
    let queryString = `
    SELECT TOP 10 diseases FROM Diseases
    WHERE ${columnConditions}
    `;

    // console.log(queryString)

    sql.connect(config, function (err) {
        if (err) console.log(err)

        var request = new sql.Request();
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
            // send records as a response
            // console.log(recordset.recordset[0]);
            let conditions = recordset.recordset;
              // Sort items based on similarity score (higher score means more similar)
            const sortedItems = conditions.sort((a, b) => stringSimilarity.compareTwoStrings(searchValue, b.diseases) - stringSimilarity.compareTwoStrings(searchValue, a.diseases));
              
              // Get the top 10 most similar items
            res.json(sortedItems);    
        }); 
    })
})

app.get('/:id', checkPreviousVisit, addVisitToDatabase, (req, res) => {
    id = req.params.id
    res.render('pages/index',{id: id})
})


app.get('/:id/:type/Discover', (req, res) => {
    id = req.params.id
    type = req.params.type

    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        let queryString = `
        UPDATE R24
        SET Discover = 'clicked'
        WHERE ID = '` + userInfo.ID + `' 
        AND VisitNum = '` + userInfo.visitNum + `'`;
        
        // console.log(queryString)
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
            // send records as a response
            // console.log("UPDATED! IN R24 TABLE:")
            // console.log(recordset);
        }); 
    
    });

    res.render('pages/discover', {id: id, type: type})
})

function checkPreviousVisit(req, res, next) {
    if (req.session.visitedIndex) {
        next();
        return;
    }
    var visitN = -1;
    // console.log(userInfo);
    sql.connect(config, function (err) {
        var request = new sql.Request();
        
        // Query Check for Existing Entry In Table
        let checkString = `
        SELECT VisitNum FROM R24
        WHERE ID = '` + req.params.id + `'
        AND DateTime = (
                SELECT max(DateTime)
                FROM R24
                WHERE ID = '` + req.params.id + `' 
        )`
        request.query(checkString, function(err, recordset) {
            if (err) console.log(err);
            // console.log("HERE")
            // console.log(recordset.recordset);
            // console.log(recordset.recordset.length);
            if (recordset.recordset.length === 0) {
                visitN = 0;
            }
            else {
                visitN = recordset.recordset[0].VisitNum + 1;
            }
            visitNum = visitN;
            userInfo['visitNum'] = visitNum;
            next();
        })
    })

}

function addVisitToDatabase(req, res, next) {
    // After first time, we mark visitedIndex as true, and then we don't want to do it again.
    if (!req.session.visitedIndex) {
        req.session.visitedIndex = true;
    }
    else {
        next();
        return;
    }
    id = req.params.id
    type = req.params.type
    if (!userInfo["ID"])
        userInfo["ID"] = id;
    if (!userInfo["VHType"])
        userInfo["VHType"] = type;
    sql.connect(config, function (err) {
        var request = new sql.Request();
        let queryString = `INSERT INTO R24 (ID, VisitNum, VHType) VALUES ('` + userInfo.ID + `',` + userInfo.visitNum + `,'` + userInfo.VHType + `')`;
        // console.log(queryString);
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
        })
    })
    next()
}


// Potentially Deprecated
function setVHType(req, res, next) {
    if (req.session.visitedIndex) {
        next();
        return;
    }
    if (userInfo.P ===  'Text') {
        userInfo['VHType'] = 'text';
    }
    else {
        // Change Black/White to contains Black/White potentially (based on answers for Survey Item)
        if (userInfo.G === 'Female' && userInfo.R ==='Black') {
            userInfo['VHType'] = 'bfe'
        }
        else if (userInfo.G === 'Male' && userInfo.R ==='Black') {
            userInfo['VHType'] = 'bme'
        }
        else if (userInfo.G === 'Female' && userInfo.R ==='White') {
            userInfo['VHType'] = 'wfe'
        }
        else if (userInfo.G === 'Male' && userInfo.R ==='White') {
            userInfo['VHType'] = 'wme'
        } else {
            userInfo['VHType'] = 'bfe'
        }
    }
    next()
}
app.post('/:id/:type/RetrieveCities', (req, res) => {
    // console.log("REQUEST PARAMS:")
    // console.log(req.params)
    id = req.params.id
    type = req.params.type
    let stateVal = (Object.entries(req.body)[0][1])
    let cityVal =(Object.entries(req.body)[1][1])
    // console.log(stateVal)
    // console.log(cityVal)
    // console.log(Object.entries(req.body)[1])
    // console.log(searchValue);
    const code = cityVal.charCodeAt(0)
    let database = "StatesAndCitiesAG"
    if ((code >= 97 && code <= 103) || (code >= 65 && code <= 71)) {
        database = "StatesAndCitiesAG"
    }
    else if ((code >= 104 && code <= 111) || (code >= 72 && code <= 79)) {
        database = "StatesAndCitiesHO"
    }
    else {
        database = "StatesAndCitiesPZ"
    }
    
    const queryString = `
    SELECT * FROM ${database}
    WHERE State = '${stateVal}' 
    `;

    sql.connect(config, function (err) {
        if (err) console.log(err)

        var request = new sql.Request();
        request.query(queryString, function (err, recordset) {
            if (err) console.log(err)
            // send records as a response
            // console.log(recordset.recordset[0]);
            res.json(recordset.recordset);    
        }); 
    })
});


// Potentially Deprecated
function extractInformation(req, res, next) {
    if (req.session.visitedIndex) {
        next();
        return;
    }
    // fields is an array of objects formatted as such...
    // {"ID" : id, "Gender" : gender, ... "Pref" : video}
    var id = req.params.id;
    var bytes = CryptoJS.AES.decrypt(id, process.env.DECRYPTION_KEY);
    var fixedID = id.replaceAll("-","/");
    var bytes = CryptoJS.AES.decrypt(fixedID, process.env.DECRYPTION_KEY);
    var info = bytes.toString(CryptoJS.enc.Utf8);
    var fields = [];

    var numberOfStrings = 0;
    var previousLocation = 0;
    while (true) {
        // Find "_" -- 3 cases.
        let currentLocation = info.indexOf("_", previousLocation);
        // Case 1: We're at the end of the string, in that case insert
        // the remaining substring. This also accounts for if a user
        // did not answer the question.
        if (currentLocation === -1) {
            let item = info.substring(previousLocation);
            let field = orderOfInfo[numberOfStrings];
            fields[field] = item;
            break;
        }
        // Case 2: Two _'s next to each other -- the user skipped a question.
        // Simply insert the proper field and a blank ""        
        else if (currentLocation == previousLocation + 1) {
            let field = orderOfInfo[numberOfStrings];
            fields[field] = "";
            numberOfStrings++;
        }
        // Case 3: Base case. User properly entered an answer for the field
        // Grab the substring and insert into fields list.
        else {
            let item = info.substring(previousLocation, currentLocation);
            let field = orderOfInfo[numberOfStrings];
            fields[field] = item;
            numberOfStrings++;
        }
        previousLocation = currentLocation + 1;
    }
    userInfo = fields;
    userInfo['originalID'] = req.params.id
    next();
}

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/:id/EducationalComponent', function(req,res,next) {
    req.id = id;
    //req.type = type
    req.userInfo = userInfo
    next();
}, EducationalComponentRouter)



app.listen(process.env.PORT || 3000);