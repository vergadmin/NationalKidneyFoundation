const express = require('express')
const router = express.Router()
var sql = require("mssql");
const app = express();
const ExcelJS = require('exceljs');

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

router.get('/downloadParticipantVisitsData', async (req, res) => {
    try {
        console.log("Processing ParticipantVisits data...");
        const source = req.query.Source; // Get 'source' from query parameters
        await handleExportDataRequest(res, 'ParticipantVisits', 'ParticipantVisits.xlsx', source);
    } catch (err) {
        console.error('Error processing ParticipantVisits request:', err);
        res.status(500).send('Error processing ParticipantVisits request.');
    }
});

router.get('/downloadPageVisitsData', async (req, res) => {
    try {
        console.log("Processing PageVisits data...");
        const source = req.query.Source; // Get 'source' from query parameters
        await handleExportDataRequest(res, 'PageVisits', 'PageVisits.xlsx', source);
    } catch (err) {
        console.error('Error processing PageVisits request:', err);
        res.status(500).send('Error processing PageVisits request.');
    }
});

  
async function handleExportDataRequest(res, tableName, fileName, source) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Build the query string with optional filtering by 'source'
        let queryString = `SELECT * FROM ${tableName}`;
        if (source) {
            queryString += ` WHERE Source = @source`;
        }

        // Create a new request object
        const request = new sql.Request();

        // Add the 'source' parameter if provided
        if (source) {
            request.input('source', sql.VarChar, source);
        }

        // Execute the query
        const result = await request.query(queryString);

        if (!result.recordset || result.recordset.length === 0) {
            throw new Error(`No data found in the table: ${tableName}`);
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(tableName);

        // Add column headers based on the database column names
        worksheet.columns = Object.keys(result.recordset[0]).map(key => ({ header: key, key: key }));

        // Add rows from the result set
        result.recordset.forEach(row => {
            worksheet.addRow(row);
        });

        // Set the response headers to indicate a file attachment with an Excel MIME type
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Stream the workbook to the response
        await workbook.xlsx.write(res);

        console.log(`Data for ${tableName} streamed successfully to the client.`);

        // Close the database connection
        await closeDatabaseConnection();
    } catch (err) {
        console.error(`Error exporting data for ${tableName}:`, err.message);

        // Close the database connection on error
        try {
            await closeDatabaseConnection();
        } catch (closeErr) {
            console.error('Error closing database connection after failure:', closeErr.message);
        }

        // Send error response to client
        res.status(500).send(`Error generating Excel file for ${tableName}: ${err.message}`);
    }
}
  
async function connectToDatabase() {
    try {
        await sql.connect(config); // Ensure `config` contains your database connection details
        console.log('Connected to the database.');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        throw new Error('Unable to connect to the database');
    }
}
  
async function closeDatabaseConnection() {
    try {
        await sql.close();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error closing database connection:', err.message);
        // No need to throw here, as closing the database is secondary to the main task
    }
}


  module.exports = router