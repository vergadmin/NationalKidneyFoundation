const express = require('express')
const router = express.Router()
const { getPool, sql } = require('../database');
const app = express();
const ExcelJS = require('exceljs');

router.get('/downloadParticipantVisitsData', async (req, res) => {
    try {
        console.log("Processing ParticipantVisits data...");
        const source = req.query.Source;
        await handleExportDataRequest(res, 'ParticipantVisits', 'ParticipantVisits.xlsx', source);
    } catch (err) {
        console.error('Error processing ParticipantVisits request:', err);
        res.status(500).send('Error processing ParticipantVisits request.');
    }
});

router.get('/downloadPageVisitsData', async (req, res) => {
    try {
        console.log("Processing PageVisits data...");
        const source = req.query.Source;
        await handleExportDataRequest(res, 'PageVisits', 'PageVisits.xlsx', source);
    } catch (err) {
        console.error('Error processing PageVisits request:', err);
        res.status(500).send('Error processing PageVisits request.');
    }
});

async function handleExportDataRequest(res, tableName, fileName, source) {
    try {
        const pool = getPool();

        // Build the query string with optional filtering by 'source'
        let queryString = `SELECT * FROM ${tableName}`;
        if (source) {
            queryString += ` WHERE Source = @source`;
        }

        const request = pool.request();

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

    } catch (err) {
        console.error(`Error exporting data for ${tableName}:`, err.message);
        res.status(500).send(`Error generating Excel file for ${tableName}: ${err.message}`);
    }
}

module.exports = router