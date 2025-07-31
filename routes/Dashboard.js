const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');
const ExcelJS = require('exceljs');

// Module video lengths (in seconds)
const moduleVideoLengths = {
    'Benefits of kidney transplant': 55.0,
    'Who can get a kidney transplant': 49.0,
    'The transplant work-up': 55.0,
    'Overview - The waiting list': 65.0,
    'Living donor transplant': 60.0,
    'Getting a transplant sooner': 54.0,
    'How long do kidney transplants last': 60.0,
    'The risks of kidney transplant': 65.0,
    'Choosing a transplant center': 92.0,
    'Who can be a living kidney donor': 56.0,
    'Talking to your doctor': 50.0
};

router.get('/', (req, res) => {
    res.render('pages/dashboard/index');
});

router.get('/results', (req, res) => {
    res.render('pages/dashboard/results');
});

router.get('/validation', (req, res) => {
    res.render('pages/dashboard/validation');
});

router.post('/process', async (req, res) => {
    try {
        const { source, participantIds } = req.body;

        // Parse participant IDs
        let participantIdList = [];
        if (participantIds && participantIds.trim()) {
            participantIdList = participantIds
                .split(/[\n,\s]+/)
                .map(id => id.trim())
                .filter(id => id.length > 0);
        }

        const validation = await validateParticipants(source, participantIdList);

        res.json({
            success: true,
            message: 'Validation completed',
            source: source || 'All Sources',
            participantIds: participantIdList,
            validation: validation
        });

    } catch (error) {
        console.error('Error processing dashboard request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/generate-analytics', async (req, res) => {
    try {
        const { source, selectedVisits } = req.body;

        const analytics = await generateAnalyticsFromVisits(source, selectedVisits);

        res.json({
            success: true,
            message: 'Analytics generated successfully',
            source: source || 'All Sources',
            selectedVisits: selectedVisits,
            analytics: analytics
        });

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/download-excel', async (req, res) => {
    try {
        const { source, selectedVisits } = req.body;

        if (!selectedVisits || selectedVisits.length === 0) {
            return res.status(400).json({ error: 'No visits provided' });
        }

        const workbook = await generateExcelReport(source, selectedVisits);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=nkf-analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/visualization-data', async (req, res) => {
    try {
        const { source, selectedVisits } = req.body;

        if (!selectedVisits || selectedVisits.length === 0) {
            return res.status(400).json({ error: 'No visits provided' });
        }

        const analytics = await generateAnalyticsFromVisits(source, selectedVisits);
        const timeSeriesData = await getTimeSeriesData(selectedVisits, source);
        const detailedModuleData = await getDetailedModuleData(selectedVisits, source);

        res.json({
            success: true,
            analytics: analytics,
            timeSeries: timeSeriesData,
            detailedModules: detailedModuleData
        });

    } catch (error) {
        console.error('Error generating visualization data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

async function validateParticipants(source, participantIds) {
    const pool = getPool();
    const request = pool.request();

    // Build WHERE clause for source filter
    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    let query;
    if (participantIds && participantIds.length > 0) {
        // Validate specific participant IDs
        const participantPlaceholders = participantIds.map((_, index) => `@participant${index}`);
        participantIds.forEach((id, index) => {
            request.input(`participant${index}`, sql.VarChar, id);
        });

        query = `
            SELECT ParticipantID, VisitID, Source, Platform, OperatingSystem, Browser, 
                   CharacterSelected, InterventionStartTime, InterventionEndTime, 
                   TotalTimeSpentOnIntervention, NumberOfModulesInteracted, 
                   KidneyTransplantResponse, OverviewUsefulnessCheckinResponse
            FROM ParticipantVisits 
            WHERE ParticipantID IN (${participantPlaceholders.join(', ')})${sourceClause}
            ORDER BY ParticipantID, VisitID
        `;
    } else {
        // Get all participants if no specific IDs provided
        query = `
            SELECT ParticipantID, VisitID, Source, Platform, OperatingSystem, Browser, 
                   CharacterSelected, InterventionStartTime, InterventionEndTime, 
                   TotalTimeSpentOnIntervention, NumberOfModulesInteracted, 
                   KidneyTransplantResponse, OverviewUsefulnessCheckinResponse
            FROM ParticipantVisits 
            WHERE 1=1${sourceClause}
            ORDER BY ParticipantID, VisitID
        `;
    }

    const result = await request.query(query);
    const foundParticipants = result.recordset;

    // Categorize participants
    const validParticipants = [];
    const duplicateParticipants = {};
    const missingParticipants = [];

    // Group by participant ID
    const participantGroups = {};
    foundParticipants.forEach(participant => {
        if (!participantGroups[participant.ParticipantID]) {
            participantGroups[participant.ParticipantID] = [];
        }
        participantGroups[participant.ParticipantID].push(participant);
    });

    // Categorize participants
    Object.keys(participantGroups).forEach(participantId => {
        const visits = participantGroups[participantId];
        if (visits.length === 1) {
            validParticipants.push(visits[0]);
        } else {
            duplicateParticipants[participantId] = visits;
        }
    });

    // Find missing participants (only if specific IDs were provided)
    if (participantIds && participantIds.length > 0) {
        const foundIds = Object.keys(participantGroups);
        participantIds.forEach(id => {
            if (!foundIds.includes(id)) {
                missingParticipants.push(id);
            }
        });
    }

    return {
        validParticipants,
        duplicateParticipants,
        missingParticipants
    };
}

async function generateAnalyticsFromVisits(source, selectedVisits) {
    if (!selectedVisits || selectedVisits.length === 0) {
        throw new Error('No visits provided for analytics generation');
    }

    // console.log('Generating analytics for visits:', selectedVisits);

    const overallStats = await getOverallStatsForVisits(selectedVisits, source);
    const characterStats = await getCharacterStatsForVisits(selectedVisits, source);
    const moduleStats = await getModuleStatsForVisits(selectedVisits, source);
    const knowledgeRating = await getKnowledgeRatingForVisits(selectedVisits, source);
    const usefulnessStats = await getUsefulnessStatsForVisits(selectedVisits, source);
    const completionStats = await getCompletionStatsForVisits(selectedVisits, source);
    const rawParticipantData = await getRawParticipantDataForVisits(selectedVisits, source);

    return {
        overall: overallStats,
        characters: characterStats,
        modules: moduleStats,
        knowledgeRating: knowledgeRating,
        usefulness: usefulnessStats,
        completion: completionStats,
        rawData: rawParticipantData
    };
}

async function getRawParticipantDataForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT 
            ParticipantID,
            CharacterSelected,
            TotalTimeSpentOnIntervention,
            NumberOfModulesInteracted,
            KidneyTransplantResponse
        FROM ParticipantVisits 
        ${whereClause}
        ORDER BY CharacterSelected, ParticipantID
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getOverallStatsForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    // Build visit conditions
    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        WITH Stats AS (
            SELECT 
                AVG(CAST(NumberOfModulesInteracted AS FLOAT)) as avgModules,
                AVG(CAST(TotalTimeSpentOnIntervention AS FLOAT)) as avgTime,
                AVG(CAST(KidneyTransplantResponse AS FLOAT)) as avgKnowledge,
                COUNT(*) as totalParticipants
            FROM ParticipantVisits 
            ${whereClause}
        ),
        Medians AS (
            SELECT 
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NumberOfModulesInteracted) OVER() as medianModules,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TotalTimeSpentOnIntervention) OVER() as medianTime,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY KidneyTransplantResponse) OVER() as medianKnowledge
            FROM ParticipantVisits 
            ${whereClause}
        )
        SELECT 
            s.avgModules,
            s.avgTime,
            s.avgKnowledge,
            s.totalParticipants,
            (SELECT TOP 1 medianModules FROM Medians) as medianModules,
            (SELECT TOP 1 medianTime FROM Medians) as medianTime,
            (SELECT TOP 1 medianKnowledge FROM Medians) as medianKnowledge
        FROM Stats s
    `;

    const result = await request.query(query);
    return result.recordset[0];
}

async function getCharacterStatsForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        WITH CharacterAggregates AS (
            SELECT 
                CharacterSelected,
                COUNT(*) as count,
                AVG(CAST(NumberOfModulesInteracted AS FLOAT)) as avgModules,
                AVG(CAST(TotalTimeSpentOnIntervention AS FLOAT)) as avgTime,
                AVG(CAST(KidneyTransplantResponse AS FLOAT)) as avgKnowledge
            FROM ParticipantVisits 
            ${whereClause}
            GROUP BY CharacterSelected
        ),
        CharacterMedians AS (
            SELECT 
                CharacterSelected,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY NumberOfModulesInteracted) OVER(PARTITION BY CharacterSelected) as medianModules,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TotalTimeSpentOnIntervention) OVER(PARTITION BY CharacterSelected) as medianTime,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY KidneyTransplantResponse) OVER(PARTITION BY CharacterSelected) as medianKnowledge,
                ROW_NUMBER() OVER(PARTITION BY CharacterSelected ORDER BY ParticipantID) as rn
            FROM ParticipantVisits 
            ${whereClause}
        )
        SELECT 
            ca.CharacterSelected,
            ca.count,
            ca.avgModules,
            ca.avgTime,
            ca.avgKnowledge,
            cm.medianModules,
            cm.medianTime,
            cm.medianKnowledge
        FROM CharacterAggregates ca
        LEFT JOIN CharacterMedians cm ON ca.CharacterSelected = cm.CharacterSelected AND cm.rn = 1
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getModuleStatsForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(pv.ParticipantID = @participantId${index} AND pv.VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND pv.Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT 
            pg.PageName,
            AVG(CAST(pg.TimeSpentOnPage AS FLOAT)) as avgTimeSpent,
            AVG(CAST(pg.NumberOfTimesPageVisited AS FLOAT)) as avgVisits,
            SUM(CASE WHEN pg.MoreInformationRequested = 1 THEN 1 ELSE 0 END) as moreInfoRequested,
            COUNT(*) as totalVisitors,
            SUM(CASE WHEN pg.PageVisited = 1 THEN 1 ELSE 0 END) as actualVisitors,
            SUM(CASE WHEN pg.ActiveOrPassiveRedirectionToPage = 'Active' THEN 1 ELSE 0 END) as activeVisits,
            SUM(CASE WHEN pg.ActiveOrPassiveRedirectionToPage = 'Passive' THEN 1 ELSE 0 END) as passiveVisits,
            pv.CharacterSelected
        FROM PageVisits pg
        JOIN ParticipantVisits pv ON pg.ParticipantID = pv.ParticipantID AND pg.VisitID = pv.VisitID
        ${whereClause}
        GROUP BY pg.PageName, pv.CharacterSelected
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getKnowledgeRatingForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause} AND KidneyTransplantResponse IS NOT NULL`;

    const query = `
        SELECT 
            CASE 
                WHEN KidneyTransplantResponse >= 0 AND KidneyTransplantResponse <= 20 THEN 'I really need Information'
                WHEN KidneyTransplantResponse >= 21 AND KidneyTransplantResponse <= 40 THEN 'I think I need information'
                WHEN KidneyTransplantResponse >= 41 AND KidneyTransplantResponse <= 60 THEN 'I don''t know if I need information or not'
                WHEN KidneyTransplantResponse >= 61 AND KidneyTransplantResponse <= 80 THEN 'I think I know a lot'
                WHEN KidneyTransplantResponse >= 81 AND KidneyTransplantResponse <= 100 THEN 'I know a lot'
            END as KnowledgeCategory,
            COUNT(*) as count,
            CharacterSelected
        FROM ParticipantVisits 
        ${whereClause}
        GROUP BY 
            CASE 
                WHEN KidneyTransplantResponse >= 0 AND KidneyTransplantResponse <= 20 THEN 'I really need Information'
                WHEN KidneyTransplantResponse >= 21 AND KidneyTransplantResponse <= 40 THEN 'I think I need information'
                WHEN KidneyTransplantResponse >= 41 AND KidneyTransplantResponse <= 60 THEN 'I don''t know if I need information or not'
                WHEN KidneyTransplantResponse >= 61 AND KidneyTransplantResponse <= 80 THEN 'I think I know a lot'
                WHEN KidneyTransplantResponse >= 81 AND KidneyTransplantResponse <= 100 THEN 'I know a lot'
            END,
            CharacterSelected
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getUsefulnessStatsForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause} AND OverviewUsefulnessCheckinResponse IS NOT NULL AND OverviewUsefulnessCheckinResponse != ''`;

    const query = `
        SELECT 
            OverviewUsefulnessCheckinResponse as UsefulnessResponse,
            COUNT(*) as count,
            CharacterSelected
        FROM ParticipantVisits 
        ${whereClause}
        GROUP BY OverviewUsefulnessCheckinResponse, CharacterSelected
        ORDER BY OverviewUsefulnessCheckinResponse, CharacterSelected
    `;

    // console.log('Usefulness query:', query); // Debug log
    const result = await request.query(query);
    // console.log('Usefulness results:', result.recordset); // Debug log
    return result.recordset;
}

async function getCompletionStatsForVisits(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT 
            CharacterSelected,
            COUNT(*) as totalParticipants,
            SUM(CASE WHEN InterventionEndTime IS NOT NULL THEN 1 ELSE 0 END) as completedParticipants
        FROM ParticipantVisits 
        ${whereClause}
        GROUP BY CharacterSelected
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function generateExcelReport(source, selectedVisits) {
    const workbook = new ExcelJS.Workbook();

    // Generate analytics data
    const analytics = await generateAnalyticsFromVisits(source, selectedVisits);

    // Get raw data for export
    const participantData = await getParticipantData(selectedVisits, source);
    const pageVisitData = await getPageVisitData(selectedVisits, source);

    // Create Analysis sheet
    await createAnalysisSheet(workbook, analytics, source);

    // Create ParticipantVisits sheet
    await createParticipantVisitsSheet(workbook, participantData);

    // Create PageVisits sheet
    await createPageVisitsSheet(workbook, pageVisitData);

    return workbook;
}

async function createAnalysisSheet(workbook, analytics, source) {
    const worksheet = workbook.addWorksheet('Analysis');

    // Set column widths
    worksheet.columns = [
        { header: 'Metric', key: 'metric', width: 50 },
        { header: 'Overall', key: 'overall', width: 15 },
        { header: 'Unit', key: 'unit', width: 15 },
        { header: 'Character_a', key: 'char_a', width: 15 },
        { header: 'Character_b', key: 'char_b', width: 15 },
        { header: 'Character_c', key: 'char_c', width: 15 },
        { header: 'Character_d', key: 'char_d', width: 15 }
    ];

    // Add header row with styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };

    // Add overall statistics
    const overallStats = analytics.overall;
    const characterStats = analytics.characters;

    const getCharacterValue = (characters, charName, field) => {
        const char = characters.find(c => c.CharacterSelected === charName);
        return char ? (char[field] || 0).toFixed(1) : 0;
    };

    const statsRows = [
        {
            metric: 'Median Number of Topics/Modules Reviewed',
            overall: (overallStats.medianModules || 0).toFixed(1),
            unit: 'modules',
            char_a: getCharacterValue(characterStats, 'Character_a', 'medianModules'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'medianModules'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'medianModules'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'medianModules')
        },
        {
            metric: 'Average Number of Topics/Modules Reviewed',
            overall: (overallStats.avgModules || 0).toFixed(1),
            unit: 'modules',
            char_a: getCharacterValue(characterStats, 'Character_a', 'avgModules'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'avgModules'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'avgModules'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'avgModules')
        },
        {
            metric: 'Average Time spent in Intervention',
            overall: (overallStats.avgTime || 0).toFixed(0),
            unit: 'seconds',
            char_a: getCharacterValue(characterStats, 'Character_a', 'avgTime'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'avgTime'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'avgTime'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'avgTime')
        },
        {
            metric: 'Average Time spent in Intervention',
            overall: ((overallStats.avgTime || 0) / 60).toFixed(1),
            unit: 'minutes',
            char_a: ((getCharacterValue(characterStats, 'Character_a', 'avgTime') || 0) / 60).toFixed(1),
            char_b: ((getCharacterValue(characterStats, 'Character_b', 'avgTime') || 0) / 60).toFixed(1),
            char_c: ((getCharacterValue(characterStats, 'Character_c', 'avgTime') || 0) / 60).toFixed(1),
            char_d: ((getCharacterValue(characterStats, 'Character_d', 'avgTime') || 0) / 60).toFixed(1)
        },
        {
            metric: 'Median Time spent in Intervention',
            overall: (overallStats.medianTime || 0).toFixed(0),
            unit: 'seconds',
            char_a: getCharacterValue(characterStats, 'Character_a', 'medianTime'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'medianTime'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'medianTime'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'medianTime')
        },
        {
            metric: 'Median Time spent in Intervention',
            overall: ((overallStats.medianTime || 0) / 60).toFixed(1),
            unit: 'minutes',
            char_a: ((getCharacterValue(characterStats, 'Character_a', 'medianTime') || 0) / 60).toFixed(1),
            char_b: ((getCharacterValue(characterStats, 'Character_b', 'medianTime') || 0) / 60).toFixed(1),
            char_c: ((getCharacterValue(characterStats, 'Character_c', 'medianTime') || 0) / 60).toFixed(1),
            char_d: ((getCharacterValue(characterStats, 'Character_d', 'medianTime') || 0) / 60).toFixed(1)
        },
        {
            metric: 'Average Self rating of Knowledge at start of intervention (out of 100)',
            overall: (overallStats.avgKnowledge || 0).toFixed(1),
            unit: '',
            char_a: getCharacterValue(characterStats, 'Character_a', 'avgKnowledge'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'avgKnowledge'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'avgKnowledge'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'avgKnowledge')
        },
        {
            metric: 'Median Self rating of Knowledge at start of intervention (out of 100)',
            overall: (overallStats.medianKnowledge || 0).toFixed(1),
            unit: '',
            char_a: getCharacterValue(characterStats, 'Character_a', 'medianKnowledge'),
            char_b: getCharacterValue(characterStats, 'Character_b', 'medianKnowledge'),
            char_c: getCharacterValue(characterStats, 'Character_c', 'medianKnowledge'),
            char_d: getCharacterValue(characterStats, 'Character_d', 'medianKnowledge')
        }
    ];

    worksheet.addRows(statsRows);

    // Add Knowledge Rating Distribution
    worksheet.addRow([]); // Empty row
    const knowledgeHeader = worksheet.addRow(['Knowledge Rating Distribution', 'Count', '', 'Character_a', 'Character_b', 'Character_c', 'Character_d']);
    knowledgeHeader.font = { bold: true };
    knowledgeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } };

    const knowledgeCategories = [
        'I really need Information',
        'I think I need information',
        `I don't know if I need information or not`,
        'I think I know a lot',
        'I know a lot'
    ];

    const knowledgeRating = analytics.knowledgeRating;

    knowledgeCategories.forEach(category => {
        const categoryRatings = knowledgeRating.filter(r => r.KnowledgeCategory === category);
        const total = categoryRatings.reduce((sum, r) => sum + r.count, 0);

        const charCounts = {
            'Character_a': categoryRatings.find(r => r.CharacterSelected === 'Character_a')?.count || 0,
            'Character_b': categoryRatings.find(r => r.CharacterSelected === 'Character_b')?.count || 0,
            'Character_c': categoryRatings.find(r => r.CharacterSelected === 'Character_c')?.count || 0,
            'Character_d': categoryRatings.find(r => r.CharacterSelected === 'Character_d')?.count || 0
        };

        worksheet.addRow([
            category,
            total,
            '',
            charCounts['Character_a'],
            charCounts['Character_b'],
            charCounts['Character_c'],
            charCounts['Character_d']
        ]);
    });

    // Add character selection data
    worksheet.addRow([]); // Empty row
    const charSelectionHeader = worksheet.addRow(['Character Selection', 'Number of participants', 'Percentage', '', '', '', '']);
    charSelectionHeader.font = { bold: true };
    charSelectionHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };

    const total = characterStats.reduce((sum, char) => sum + char.count, 0);
    characterStats.forEach(char => {
        const percentage = total > 0 ? ((char.count / total) * 100).toFixed(1) : 0;
        worksheet.addRow([char.CharacterSelected, char.count, `${percentage}%`, '', '', '', '']);
    });

    // Add overall module breakdown
    worksheet.addRow([]); // Empty row
    const moduleHeader = worksheet.addRow(['All Characters - Module Wise Breakdown', 'Avg Time (sec)', 'Video Length', 'Watch Ratio', 'Avg Visits', 'More Info Req', '% More Info', 'Visitors', '% Visited', 'Active Visits', 'Passive Visits']);
    moduleHeader.font = { bold: true };
    moduleHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };

    const moduleStats = analytics.modules;

    // Group modules by page name for overall stats
    const groupedModules = {};
    moduleStats.forEach(module => {
        if (!groupedModules[module.PageName]) {
            groupedModules[module.PageName] = [];
        }
        groupedModules[module.PageName].push(module);
    });

    Object.keys(groupedModules).forEach(pageName => {
        const pageModules = groupedModules[pageName];
        const avgTimeSpent = pageModules.reduce((sum, m) => sum + (m.avgTimeSpent || 0), 0) / pageModules.length;
        const avgVisits = pageModules.reduce((sum, m) => sum + (m.avgVisits || 0), 0) / pageModules.length;
        const totalMoreInfo = pageModules.reduce((sum, m) => sum + (m.moreInfoRequested || 0), 0);
        const totalVisitors = pageModules.reduce((sum, m) => sum + (m.totalVisitors || 0), 0);
        const actualVisitors = pageModules.reduce((sum, m) => sum + (m.actualVisitors || 0), 0);
        const activeVisits = pageModules.reduce((sum, m) => sum + (m.activeVisits || 0), 0);
        const passiveVisits = pageModules.reduce((sum, m) => sum + (m.passiveVisits || 0), 0);

        const videoLength = moduleVideoLengths[pageName] || 0;
        const watchRatio = videoLength > 0 ? (avgTimeSpent / videoLength) : 0;
        const moreInfoPercentage = totalVisitors > 0 ? ((totalMoreInfo / totalVisitors) * 100) : 0;
        const visitedPercentage = totalVisitors > 0 ? ((actualVisitors / totalVisitors) * 100) : 0;

        worksheet.addRow([
            pageName,
            avgTimeSpent.toFixed(1),
            videoLength,
            watchRatio.toFixed(2),
            avgVisits.toFixed(1),
            totalMoreInfo,
            moreInfoPercentage.toFixed(1) + '%',
            totalVisitors,
            visitedPercentage.toFixed(1) + '%',
            activeVisits,
            passiveVisits
        ]);
    });

    // Add character-specific module breakdowns
    ['Character_a', 'Character_b', 'Character_c', 'Character_d'].forEach(character => {
        const characterModules = moduleStats.filter(m => m.CharacterSelected === character);

        if (characterModules.length > 0) {
            worksheet.addRow([]); // Empty row
            const charModuleHeader = worksheet.addRow([`${character} - Module Wise Breakdown`, 'Avg Time (sec)', 'Video Length', 'Watch Ratio', 'Avg Visits', 'More Info Req', '% More Info', 'Visitors', '% Visited', 'Active Visits', 'Passive Visits']);
            charModuleHeader.font = { bold: true };
            charModuleHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };

            const characterGroupedModules = {};
            characterModules.forEach(module => {
                if (!characterGroupedModules[module.PageName]) {
                    characterGroupedModules[module.PageName] = [];
                }
                characterGroupedModules[module.PageName].push(module);
            });

            Object.keys(characterGroupedModules).forEach(pageName => {
                const pageModules = characterGroupedModules[pageName];
                const avgTimeSpent = pageModules.reduce((sum, m) => sum + (m.avgTimeSpent || 0), 0) / pageModules.length;
                const avgVisits = pageModules.reduce((sum, m) => sum + (m.avgVisits || 0), 0) / pageModules.length;
                const totalMoreInfo = pageModules.reduce((sum, m) => sum + (m.moreInfoRequested || 0), 0);
                const totalVisitors = pageModules.reduce((sum, m) => sum + (m.totalVisitors || 0), 0);
                const actualVisitors = pageModules.reduce((sum, m) => sum + (m.actualVisitors || 0), 0);
                const activeVisits = pageModules.reduce((sum, m) => sum + (m.activeVisits || 0), 0);
                const passiveVisits = pageModules.reduce((sum, m) => sum + (m.passiveVisits || 0), 0);

                const videoLength = moduleVideoLengths[pageName] || 0;
                const watchRatio = videoLength > 0 ? (avgTimeSpent / videoLength) : 0;
                const moreInfoPercentage = totalVisitors > 0 ? ((totalMoreInfo / totalVisitors) * 100) : 0;
                const visitedPercentage = totalVisitors > 0 ? ((actualVisitors / totalVisitors) * 100) : 0;

                worksheet.addRow([
                    pageName,
                    avgTimeSpent.toFixed(1),
                    videoLength,
                    watchRatio.toFixed(2),
                    avgVisits.toFixed(1),
                    totalMoreInfo,
                    moreInfoPercentage.toFixed(1) + '%',
                    totalVisitors,
                    visitedPercentage.toFixed(1) + '%',
                    activeVisits,
                    passiveVisits
                ]);
            });
        }
    });

    // Add completion statistics
    worksheet.addRow([]); // Empty row
    const completionHeader = worksheet.addRow(['Completion Statistics', 'Total', 'Character_a', 'Character_b', 'Character_c', 'Character_d']);
    completionHeader.font = { bold: true };
    completionHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } };

    const completionStats = analytics.completion || [];
    const getCharacterCompletion = (charName) => {
        const char = completionStats.find(c => c.CharacterSelected === charName);
        return char ? { total: char.totalParticipants, completed: char.completedParticipants } : { total: 0, completed: 0 };
    };

    const totalAll = completionStats.reduce((sum, stat) => sum + stat.totalParticipants, 0);
    const completedAll = completionStats.reduce((sum, stat) => sum + stat.completedParticipants, 0);

    worksheet.addRow([
        'Number of Participants that completed Intervention',
        completedAll,
        getCharacterCompletion('Character_a').completed,
        getCharacterCompletion('Character_b').completed,
        getCharacterCompletion('Character_c').completed,
        getCharacterCompletion('Character_d').completed
    ]);

    worksheet.addRow([
        'Percentage of Participants that completed Intervention',
        totalAll > 0 ? ((completedAll / totalAll) * 100).toFixed(1) + '%' : '0%',
        getCharacterCompletion('Character_a').total > 0 ? ((getCharacterCompletion('Character_a').completed / getCharacterCompletion('Character_a').total) * 100).toFixed(1) + '%' : '0%',
        getCharacterCompletion('Character_b').total > 0 ? ((getCharacterCompletion('Character_b').completed / getCharacterCompletion('Character_b').total) * 100).toFixed(1) + '%' : '0%',
        getCharacterCompletion('Character_c').total > 0 ? ((getCharacterCompletion('Character_c').completed / getCharacterCompletion('Character_c').total) * 100).toFixed(1) + '%' : '0%',
        getCharacterCompletion('Character_d').total > 0 ? ((getCharacterCompletion('Character_d').completed / getCharacterCompletion('Character_d').total) * 100).toFixed(1) + '%' : '0%'
    ]);

    // Add transplant waiting list module usefulness section
    worksheet.addRow([]); // Empty row
    const usefulnessHeader = worksheet.addRow(['Transplant Waiting List Module Usefulness', 'Count', 'Percentage (%)', 'Character_a', 'Character_b', 'Character_c', 'Character_d']);
    usefulnessHeader.font = { bold: true };
    usefulnessHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } };

    // Calculate usefulness response statistics
    const usefulnessStats = analytics.usefulness || [];
    const totalUsefulnessResponses = usefulnessStats.reduce((sum, stat) => sum + stat.count, 0);

    // Get actual usefulness levels from the data instead of hardcoded ones
    const usefulnessLevels = [...new Set(usefulnessStats.map(s => s.UsefulnessResponse))].sort();

    if (usefulnessLevels.length === 0) {
        worksheet.addRow(['No usefulness response data available', '', '', '', '', '', '']);
    } else {
        usefulnessLevels.forEach(level => {
            const levelResponses = usefulnessStats.filter(s => s.UsefulnessResponse === level);
            const totalCount = levelResponses.reduce((sum, r) => sum + r.count, 0);
            const percentage = totalUsefulnessResponses > 0 ? ((totalCount / totalUsefulnessResponses) * 100).toFixed(1) : '0.0';

            const charCounts = {
                'Character_a': levelResponses.find(r => r.CharacterSelected === 'Character_a')?.count || 0,
                'Character_b': levelResponses.find(r => r.CharacterSelected === 'Character_b')?.count || 0,
                'Character_c': levelResponses.find(r => r.CharacterSelected === 'Character_c')?.count || 0,
                'Character_d': levelResponses.find(r => r.CharacterSelected === 'Character_d')?.count || 0
            };

            worksheet.addRow([
                level,
                totalCount,
                percentage + '%',
                charCounts['Character_a'],
                charCounts['Character_b'],
                charCounts['Character_c'],
                charCounts['Character_d']
            ]);
        });

        if (totalUsefulnessResponses > 0) {
            worksheet.addRow([
                'Total participants that answered question',
                totalUsefulnessResponses,
                '100.0%',
                usefulnessStats.filter(s => s.CharacterSelected === 'Character_a').reduce((sum, s) => sum + s.count, 0),
                usefulnessStats.filter(s => s.CharacterSelected === 'Character_b').reduce((sum, s) => sum + s.count, 0),
                usefulnessStats.filter(s => s.CharacterSelected === 'Character_c').reduce((sum, s) => sum + s.count, 0),
                usefulnessStats.filter(s => s.CharacterSelected === 'Character_d').reduce((sum, s) => sum + s.count, 0)
            ]);
        }
    }

    worksheet.addRow([
        'Total participants',
        total,
        '',
        getCharacterCompletion('Character_a').total,
        getCharacterCompletion('Character_b').total,
        getCharacterCompletion('Character_c').total,
        getCharacterCompletion('Character_d').total
    ]);
}

async function createParticipantVisitsSheet(workbook, participantData) {
    const worksheet = workbook.addWorksheet('ParticipantVisits');

    if (participantData.length === 0) {
        worksheet.addRow(['No participant data found']);
        return;
    }

    // Set columns based on data structure
    const columns = Object.keys(participantData[0]).map(key => ({
        header: key,
        key: key,
        width: 20
    }));
    worksheet.columns = columns;

    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };

    // Add data rows
    participantData.forEach(participant => {
        worksheet.addRow(participant);
    });
}

async function createPageVisitsSheet(workbook, pageVisitData) {
    const worksheet = workbook.addWorksheet('PageVisits');

    if (pageVisitData.length === 0) {
        worksheet.addRow(['No page visit data found']);
        return;
    }

    // Set columns based on data structure
    const columns = Object.keys(pageVisitData[0]).map(key => ({
        header: key,
        key: key,
        width: 20
    }));
    worksheet.columns = columns;

    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };

    // Add data rows
    pageVisitData.forEach(pageVisit => {
        worksheet.addRow(pageVisit);
    });
}

async function getParticipantData(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT * FROM ParticipantVisits 
        ${whereClause}
        ORDER BY ParticipantID, VisitID
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getPageVisitData(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT * FROM PageVisits 
        ${whereClause}
        ORDER BY ParticipantID, VisitID, PageName
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getTimeSeriesData(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(ParticipantID = @participantId${index} AND VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT 
            CAST(InterventionStartTime AS DATE) as StartDate,
            COUNT(*) as ParticipantCount,
            AVG(CAST(TotalTimeSpentOnIntervention AS FLOAT)) as AvgTime,
            AVG(CAST(NumberOfModulesInteracted AS FLOAT)) as AvgModules
        FROM ParticipantVisits 
        ${whereClause}
        AND InterventionStartTime IS NOT NULL
        GROUP BY CAST(InterventionStartTime AS DATE)
        ORDER BY StartDate
    `;

    const result = await request.query(query);
    return result.recordset;
}

async function getDetailedModuleData(selectedVisits, source) {
    const pool = getPool();
    const request = pool.request();

    // Add input parameters for selected visits
    selectedVisits.forEach((visit, index) => {
        request.input(`participantId${index}`, sql.VarChar, visit.ParticipantID);
        request.input(`visitId${index}`, sql.Int, visit.VisitID);
    });

    const visitConditions = selectedVisits.map((visit, index) => {
        return `(pv.ParticipantID = @participantId${index} AND pv.VisitID = @visitId${index})`;
    });

    let sourceClause = "";
    if (source && source !== "All Sources" && source.trim() !== "") {
        request.input('source', sql.VarChar, source);
        sourceClause = " AND pv.Source = @source";
    }

    const whereClause = `WHERE (${visitConditions.join(' OR ')})${sourceClause}`;

    const query = `
        SELECT 
            pg.PageName,
            pv.CharacterSelected,
            AVG(CAST(pg.TimeSpentOnPage AS FLOAT)) as avgTimeSpent,
            AVG(CAST(pg.NumberOfTimesPageVisited AS FLOAT)) as avgVisits,
            COUNT(*) as totalVisitors,
            SUM(CASE WHEN pg.PageVisited = 1 THEN 1 ELSE 0 END) as actualVisitors,
            SUM(CASE WHEN pg.MoreInformationRequested = 1 THEN 1 ELSE 0 END) as moreInfoRequested,
            SUM(CASE WHEN pg.ActiveOrPassiveRedirectionToPage = 'Active' THEN 1 ELSE 0 END) as activeVisits,
            SUM(CASE WHEN pg.ActiveOrPassiveRedirectionToPage = 'Passive' THEN 1 ELSE 0 END) as passiveVisits
        FROM PageVisits pg
        JOIN ParticipantVisits pv ON pg.ParticipantID = pv.ParticipantID AND pg.VisitID = pv.VisitID
        ${whereClause}
        GROUP BY pg.PageName, pv.CharacterSelected
        ORDER BY pg.PageName, pv.CharacterSelected
    `;

    const result = await request.query(query);
    return result.recordset;
}

module.exports = router;