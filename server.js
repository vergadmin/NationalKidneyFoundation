const express = require('express')
const session = require('express-session');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

const app = express()
const CryptoJS = require("crypto-js");

require('dotenv').config()
// console.log(process.env)

const { OpenAI } = require("openai");

const { ElevenLabsClient } = require("elevenlabs");

const openai = new OpenAI({
  // replace your-api-key with your API key from ChatGPT
  apiKey: process.env.OPENAI_API_KEY
})

const assistantId = process.env.OPENAI_ASSISTANT_ID;


const elevenLabs = new ElevenLabsClient({ 
  apiKey: process.env.ELEVENLABS_API_KEY
});

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

app.get('/', (req, res) => {
    id = req.params.id
    res.render('pages/index',{id: id})
})

app.get('/favicon.ico', (req, res) => res.status(204));

// Virtual Human Types
const EducationalComponentRouter = require('./routes/EducationalComponent');
app.use('/EducationalComponent', function(req,res,next) {
    req.id = id;
    //req.type = type
    req.userInfo = userInfo
    next();
}, EducationalComponentRouter)

const downloadRouter = require('./routes/DataDownloadComponent');
app.use('/download', downloadRouter);


async function UploadToDatabase(data) {

    await connectToDatabase() ;

    console.log(data.ConversationLog);

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
        ConversationLog: data.ConversationLog
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
    const { ParticipantID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse, ConversationLog} = data;
  
    const getNextVisitIDQuery = `SELECT COUNT(*) AS visitCount FROM ParticipantVisits WHERE ParticipantID = @ParticipantID`;
  
    try {
      const request = new sql.Request();
      request.input('ParticipantID', sql.VarChar, ParticipantID);
      
      const result = await request.query(getNextVisitIDQuery);
      const VisitID = result.recordset[0].visitCount + 1;
  
      const insertQuery = `
        INSERT INTO ParticipantVisits 
        (ParticipantID, VisitID, Platform, OperatingSystem, Browser, CharacterSelected, InterventionStartTime, InterventionEndTime, TotalTimeSpentOnIntervention, NumberOfModulesInteracted, KidneyTransplantResponse, OverviewUsefulnessCheckinResponse, ConversationLog) 
        VALUES (@ParticipantID, @VisitID, @Platform, @OperatingSystem, @Browser, @CharacterSelected, @InterventionStartTime, @InterventionEndTime, @TotalTimeSpentOnIntervention, @NumberOfModulesInteracted, @KidneyTransplantResponse, @OverviewUsefulnessCheckinResponse, @ConversationLog)`;
  
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
      request.input('ConversationLog',sql.VarChar, ConversationLog || null);
  
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



app.post('/OpenAIRedactedText', async (req, res)=> {
    try {
        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_MODEL,
          messages: [
              { role: "system", 
                content: 
                `
                You are a text processing assistant. Your task is to redact any personally identifiable information (PII) that belongs to the user who wrote the message, and then return the processed text in JSON format. Specifically:
  
                What to Redact: Remove (replace with "[redacted]") any PII belonging to the user, including:
  
                The user’s own name, email address, phone number, physical address and location, State Codes like MN , FL etc or any other contact details.
                The user’s government ID numbers (such as passport or Social Security).
                The user’s financial information (credit card numbers, bank account information, etc.).
                What NOT to Redact: Do NOT remove references to other people or other names that are not the user’s. For example, if the text says “Hey John,” and “John” is not the user, do not redact it.
  
                Output Format:
  
                Return a JSON object with two keys:
                "redacted_text": the input text but with the user’s PII replaced by "[redacted]".
                "is_redacted": a boolean that is true if any user PII was redacted, and false otherwise.

                Examples:
  
                If the input is "Hi, my name is Danish.", then the output JSON should be: { "redacted_text": "Hi, my name is [redacted].", "is_redacted": true }
                If the input is "Hey John, how have you been?", then the output JSON should be: { "redacted_text": "Hey John, how have you been?", "is_redacted": false }
                If the input is "Here’s my phone number: 123-456-7890.", then the output JSON should be: { "redacted_text": "Here’s my phone number: [redacted].", "is_redacted": true }
                If the input is "Contact me at testemail@gmail.com.", then the output JSON should be: { "redacted_text": "Contact me at [redacted].", "is_redacted": true }
                `
               },
              {
                  role: "user",
                  content: req.body.TextToBeRedacted,
              },
          ],
          response_format:{ "type": "json_object" },
      });      
  
      res.status(200).json({message: completion.choices[0].message.content})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })

  app.post('/OpenAIChatNephrologist', async (req, res)=> {
    try {
        contentMessage = 
        `
        `

        // contentMessage = `ALWAYS reply with query / citations. From here on out whatever question is asked, answer using /query only kidney.org, nih.gov, cdc.gov and kidneyfund.org.
        // If its not present just don't answer except saying along the lines of you can't help with that topic but are glad to answer any questions related to kidney and ckd, 
        // don't talk about the source of like "Kidney.org doesn’t specifically talk about this" etc. Feel free to rephrase to make it sound like a nephrologist speaking.`

        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_WEB_SEARCH_MODEL,
          web_search_options: {
            search_context_size: "high",
          },
          messages: [
              { role: "system", 
                content: contentMessage,
               },
              {
                  role: "user",
                  content: `
                  ${contentMessage}

                  Conversation History:
                  ${req.body.conversationHistorySoFar}
                `
              },
          ],
          // response_format:{ "type": "json_object" },
      });      

      // console.log(completion.choices[0].message.content)

      var jsonData = {
        answer: completion.choices[0].message.content,
        annotations: completion.choices[0].message.annotations,
        sources: "",
        follow_up_questions: ""
      };
  
      res.status(200).json({message: JSON.stringify(jsonData)})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })


  app.post('/OpenAIChatCheckTopic', async (req, res)=> {
    try {
          contentMessage = 
          `
          You are in a chat with:

          - userMessage (the patient), who has Chronic Kidney Disease (CKD).  
          - You (Dr. Alex, the Nephrologist), who works at a local hospital.

          Instructions:
          - Write in a casual, chat-like tone (like iMessage or WhatsApp), but still sound professional as a nephrologist.  
          - Use the **entire conversation history** to understand context, especially the most recent userMessage.  
          - If the most recent message is vague (e.g., “tell me more”, “how long is that?”, “sweet”), use earlier context to interpret it.
          - Avoid giving **opinion-based advice** on serious or ethical decisions (e.g., organ donation suitability, major life decisions). Instead, encourage the patient to speak with their in-person doctor.

          Return a JSON object with two keys:
          1. "isRelated": 
            - "Yes" if the userMessage is related to CKD, kidneys, dialysis, transplants, medications, kidney diet, general health/fitness advice, etc.
            - "No" if unrelated (e.g., asking about your day, sports, unrelated life events).

          2. "reply": 
            - If isRelated is "Yes", give a helpful, casually professional response.
            - If isRelated is "No", politely say you can only answer kidney/CKD-related questions.
            - If it's a greeting or small talk, reply warmly like a professional nephrologist might.
            - If it's an ethically sensitive question (like asking if a family member should donate a kidney), say you can’t give personal advice on that and recommend they speak with their doctor.

          EXAMPLES (Few-shot learning):

          ---

          Most recent userMessage: How long have you been doing this?

          {
            "isRelated": "No",
            "reply": "Haha, good question! I’ve been in nephrology for quite a few years now. But I’m here to help you with anything kidney-related—feel free to ask!"
          }

          ---

          Most recent userMessage: Yeah, I’ve also been more short of breath.

          {
            "isRelated": "Yes",
            "reply": "Thanks for sharing that—shortness of breath can happen with CKD, especially if fluid builds up. Definitely worth bringing up to your care team if it keeps happening."
          }

          ---

          Most recent userMessage: Should I ask my daughter to donate a kidney to me?

          {
            "isRelated": "No",
            "reply": "That’s such an important and personal decision, and I can’t really give advice on family donor choices. I’d strongly recommend talking this over with your nephrologist and the transplant team—they can guide you properly."
          }

          ---

          Most recent userMessage: What do you think about the Warriors game last night?

          {
            "isRelated": "No",
            "reply": "I try to keep up with sports when I can, but I mostly stick to kidneys. Let me know if you have any CKD or health-related questions!"
          }

          ---

          Now use the full conversation to generate your JSON response.
              `;

        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_MODEL,
          messages: [
              { role: "system", 
                content: contentMessage,
               },
              {
                  role: "user",
                  content: req.body.conversationHistorySoFar,
              },
          ],
          response_format:{ "type": "json_object" },
      });      
  
      res.status(200).json({message: completion.choices[0].message.content})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })



  app.post('/OpenAINephrologistFormattedMessage', async (req, res)=> {
    try {
          contentMessage = 
          `
          You are in a chat with:
  
          userMessage (the patient), who has Chronic Kidney Disease (CKD).
          You (Dr. Alex, the Nephrologist), who works at a local hospital.

          Your instructions:
          Take in the current content and rewrite it to sound like a casual, chat-like tone (like on iMessage or WhatsApp), but still sound professional enough for your role as a nephrologist. NO Emojis.
          Provide a concise, accurate answer (under 150 words) as a nephrologist would. Rewrite keeping the citations.
          Keep your “answer” field under 150 words.
          Return it in the same HTML format like the input was.
          Do not start EVERY sentence with "So" or other words like it which may sound repetitive.

          Return a JSON object:
          formattedNephrologistResponse: The valid HTML with rewritten text.
          Keep the hyperlinks text as is (DO not change inner text), Also do not make any corrections in the link itself!
          Make sure the spacing makes sense, not too many <br> or \\n  (new line) where there already is padding or margin, stuff like that.
          IF there is ANY Recent Advances or news section remove it.
          `

        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_MODEL,
          messages: [
              { role: "system", 
                content: contentMessage,
               },
              {
                  role: "user",
                  content: req.body.conversationHistorySoFar,
              },
          ],
          response_format:{ "type": "json_object" },
      });      
  
      res.status(200).json({message: completion.choices[0].message.content})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })


  app.post('/OpenAIPuncatuateText', async (req, res)=> {
    try {
        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_MODEL,
          messages: [
              { role: "system", 
                content: 
                `
                You are a text-processing assistant. Your role is to take the text the user provides, add or correct any punctuation as needed, and then return the result in JSON format. Specifically:
  
                Punctuation Rules:
  
                Preserve the original meaning, wording, and structure of the text.
                Only add, remove, or adjust punctuation (for example, periods, commas, question marks, exclamation marks) to ensure the text is properly punctuated.
                Do not modify the text’s content beyond punctuation changes (i.e., do not add or remove words unless punctuation rules require minor spacing changes).
                Output Format:
  
                Return a JSON object with two fields:
                "punctuated_text": the text after adding or correcting punctuation.
                "is_punctuated": a boolean that is true if the text required any punctuation changes, and false otherwise.
                Examples:
  
                Example 1:
                Input: "Tell me something about kidney transplant"
                Output JSON: { "punctuated_text": "Tell me something about kidney transplant.", "is_punctuated": true }
                Example 2:
                Input: "Hello! How are you doing?"
                Output JSON: { "punctuated_text": "Hello! How are you doing?", "is_punctuated": false }
                `
               },
              {
                  role: "user",
                  content: req.body.TextToBePunctuated,
              },
          ],
          response_format:{ "type": "json_object" },
      });      
  
      res.status(200).json({message: completion.choices[0].message.content})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })


  app.get("/OpenAIVoiceNephrologistStream", async (req, res) => {
    const message = req.query.Message; // Get the message from the query parameter
  
    if (!message) {
      return res.status(400).send("Missing 'Message' parameter");
    }
  
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "ash",
        input: message,
        // instructions: `Voice Affect: Confident, professional, and approachable; convey trustworthiness and competence while maintaining warmth and relatability.\n\nTone: Warm and engaging, yet authoritative. Use a tone that inspires confidence while remaining friendly and personable.\n\nPacing: Balanced and measured—slightly steady, allowing for clarity in complex medical explanations, while still maintaining a human connection.\n\nEmotion: Empathetic and compassionate, especially when discussing sensitive health matters; convey care and attentiveness in every word.\n\nPronunciation: Clear and direct, with a smooth cadence. Ensure medical terms are pronounced accurately, but with a tone that is welcoming and easy to understand.\n\nPauses: Well-timed pauses, particularly when explaining important medical concepts or giving patients a moment to absorb information, ensuring they feel heard and understood.`,
        format: "opus",
      });
  
      res.writeHead(200, {
        "Content-Type": "audio/ogg",
        "Transfer-Encoding": "chunked",
      });
  
      const readableStream = response.body;
      readableStream.pipe(res);
  
      readableStream.on("end", () => {
        // console.log("Stream ended.");
        res.end();
      });
  
      readableStream.on("error", (e) => {
        console.error("Error streaming TTS:", e);
        res.end();
      });
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).send("Error processing request");
    }
  });


  app.get("/ElevenLabsVoiceNephrologistStream", async (req, res) => {
    const message = req.query.Message;
  
    if (!message) {
      return res.status(400).send("Missing 'Message' parameter");
    }
  
    try {
      const stream = await elevenLabs.textToSpeech.convertAsStream("K8Xci0GnZUSchP20TdtO", {
        text: message,
        output_format: "mp3_44100_128",
        model_id: "eleven_flash_v2_5",
      });
  
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      });
  
      stream.pipe(res);
  
      stream.on("end", () => {
        res.end();
      });
  
      stream.on("error", (err) => {
        console.error("Streaming error:", err);
        res.end();
      });
    } catch (error) {
      console.error("Error generating ElevenLabs speech:", error);
      res.status(500).send("Error processing request");
    }
  });

  app.post('/OpenAIBoldQuestions', async (req, res)=> {
    try {
        const completion = await openai.chat.completions.create({
          model: process.env.COMPLETIONS_MODEL,
          messages: [
              { role: "system", 
                content: 
                `
                You are a transformation assistant. Your goal is to:
  
                Take an array of questions (strings).
                For each question:
                Identify the core terms or phrases that should be emphasized in bold (using <strong>...</strong>).
                Wrap the entire question in a <p>...</p> element.
                Return your result as valid JSON with a top-level key "questions", whose value is an array of these HTML-formatted strings.
                Example:
  
                Input (array of questions):
                [ "What are the signs of fluid overload?", "How much fluid can I safely drink daily?", "What role does diet play in fluid management?" ]
  
                Output:
                { "questions": [ "<p>What are the signs of <strong>fluid overload</strong>?</p>", "<p>How much <strong>fluid</strong> can I <strong>safely drink</strong> daily?</p>", "<p>What role does <strong>diet</strong> play in <strong>fluid management</strong>?</p>" ] }
  
                Only bold the key terms (e.g., “fluid,” “overload,” “safely drink,” “diet,” etc.). If no key terms need emphasis, just wrap the question in <p> tags without adding bold tags. Ensure the returned JSON is valid and properly structured.
                `
               },
              {
                  role: "user",
                  content: req.body.QuestionsArray,
              },
          ],
          response_format:{ "type": "json_object" },
      });      
  
      res.status(200).json({message: completion.choices[0].message.content})
    } catch(e) {
        res.status(400).json({message: e.message})
    }
  })

  app.post('/CreateChatGPTAssistantThread', async (req, res) => {
    try {
      const thread = await openai.beta.threads.create();
      res.json({ threadId: thread.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Failed to create thread.' });
    }
  });

  app.post('/ChatGPTAssistantResponse', async (req, res) => {
    const { threadId, userMessage } = req.body;
  
    if (!threadId || !userMessage) {
      return res.status(400).json({ error: 'threadId and userMessage are required.' });
    }
  
    try {
      // 1. Add user message to existing thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage,
      });
  
      // 2. Run assistant with forced retrieval
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        tool_choice: { type: 'file_search' },
      });
  
      // 3. Poll until run completes
      let runStatus;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      } while (runStatus.status !== 'completed');
  
      // 4. Return full assistant messages (with citations, annotations, etc.)
      const messagesResponse = await openai.beta.threads.messages.list(threadId);
      res.json({ messages: messagesResponse.data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Assistant failed to respond.' });
    }
  });
  
  app.get('/api/files/:fileId/name', async (req, res) => {
    try {
      const { fileId } = req.params;
      const file = await openai.files.retrieve(fileId);
      res.json({ fileName: file.filename });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get file name', details: err.message });
    }
  });

app.listen(process.env.PORT || 3000);