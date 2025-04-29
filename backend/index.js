const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const OpenAI = require("openai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure to add this to your backend .env file
});

// Multer setup for handling file uploads
const upload = multer({ dest: "uploads/" });

// Function to process transcription with GPT
async function processTranscriptionWithGPT(transcriptionText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an advanced AI designed to analyze and structure conversations from call transcriptions.

Your task is to:
1. **Identify the two speakers**:
   - The **caller** (person initiating the call).
   - The **receiver** (person answering the call).
   
2. **Segregate the conversation** into a structured JSON format:
   - Identify which speaker said each line.
   - Format the conversation into separate sections for the caller and the receiver.
   - Exclude timestamps and return only the conversation lines.

### **Output Format:**
Return the conversation in the following JSON structure:
{
    "caller": {
        "name": "<Caller Name or 'Unknown'>",
        "lines": [
            "<caller's dialogue>",
            "<caller's dialogue>"
        ]
    },
    "receiver": {
        "name": "<Receiver Name or 'Unknown'>",
        "lines": [
            "<receiver's dialogue>",
            "<receiver's dialogue>"
        ]
    }
}`
        },
        {
          role: "user",
          content: transcriptionText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log("GPT Response:", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error processing with GPT:", error);
    throw error;
  }
}

// Add this new function to process metrics
async function calculateCallMetrics(transcriptionText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI call analyzer that evaluates sales/customer service calls. Analyze the conversation and provide metrics and insights in the following JSON format:

{
  "overallScore": {
    "score": <number between 0-100>,
    "reason": "<brief explanation>",
    "change": <number between -5 to 5 without plus sign>,
    "period": "yesterday"
  },
  "complianceScore": {
    "score": <number between 0-100>,
    "reason": "<brief explanation of compliance adherence>",
    "change": <number between -10 to 10 without plus sign>,
    "period": "yesterday"
  },
  "talkListenRatio": {
    "ratio": "<caller>:<receiver>",
    "analysis": "<brief explanation of talk time distribution>",
    "change": <number between -3 to 3 without plus sign>,
    "period": "yesterday"
  },
  "fillerWords": {
    "count": <total number of filler word occurrences>,
    "details": {
      "um": <number of times "um" was used>,
      "uh": <number of times "uh" was used>,
      "like": <number of times "like" was used as filler>,
      "you know": <number of times "you know" was used as filler>,
      // ... include other filler words found
    },
    "examples": ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"],
    "change": <number between -2 to 2 without plus sign>,
    "period": "past week"
  },
  "pace": {
    "speed": <words per minute>,
    "assessment": "<too fast/too slow/optimal>",
    "change": <number between -5 to 5 without plus sign>,
    "period": "past week"
  },
  "parameters": {
    "en": <number between 0-100>,  // Engagement Score based on customer interaction quality
    "ef": <number between 0-100>,  // Effectiveness Score based on problem resolution
    "co": <number between 0-100>   // Confidence Score based on agent's communication clarity
  },
  "summary": {
    "keyTopics": [
      {
        "id": "1",
        "topic": "<main topic discussed>",
        "starred": false,
        "completed": false
      },
      {
        "id": "2",
        "topic": "<second important topic>",
        "starred": false,
        "completed": false
      },
      {
        "id": "3",
        "topic": "<third important topic>",
        "starred": false,
        "completed": false
      }
      // Add more topics if identified
    ],
    "callSummary": "<detailed summary of the conversation>",
    "actionItems": [
      "<action item 1>",
      "<action item 2>"
    ]
  },
  "insights": {
    "keyMoments": [
      {
        "timestamp": "<MM:SS>",
        "description": "<brief description of key moment>"
      }
    ],
    "missedOpportunities": [
      {
        "id": "1",
        "title": "<opportunity title>",
        "description": "<detailed explanation>"
      }
      // At least 4 missed opportunities
    ],
    "bestPractices": {
      "questions": [
        {
          "question": "<question about agent's performance>",
          "answer": "yes/no",
          "explanation": "<brief explanation>"
        }
      ]
    },
    "followUpTasks": [
      {
        "id": "1",
        "task": "<task description>",
        "completed": false,
        "priority": "high/medium/low"
      }
    ]
  },
  "suggestions": {
    "personalizedCoaching": {
      "title": "AI-Based Feedback & Learning Modules",
      "feedback": [
        // Generate 4-5 specific feedback points based on:
        // 1. Identified missed opportunities
        // 2. Key moments that could be improved
        // 3. Areas where best practices weren't followed
        // 4. Compliance gaps identified
        // Each point should reference specific moments or examples from the call
      ]
    },
    "trainingMaterials": {
      "title": "Suggested Training Materials",
      "materials": [
        // Recommend 4-5 specific training resources that:
        // 1. Address the identified missed opportunities
        // 2. Help improve areas with low scores
        // 3. Support better handling of key moments
        // 4. Cover compliance and best practice gaps
      ]
    }
  }
}

For key topics, ALWAYS identify at least 3 main subjects discussed during the call. Common topics include:
- Product features or benefits discussed
- Customer concerns or pain points
- Pricing or payment discussions
- Process explanations
- Policy details
- Follow-up items
- Customer requests
- Compliance-related discussions

The call summary should be a concise paragraph summarizing the key points of the conversation.
Action items should list specific follow-up tasks or commitments made during the call.

For key moments:
- Identify significant points in the conversation with timestamps
- Include customer identity verification, key decisions, objections, resolutions

For missed opportunities:
- Identify at least 4 sales or service opportunities that were missed
- Include upsell/cross-sell opportunities
- Note moments where additional value could have been provided
- Highlight missed relationship-building opportunities

For best practices:
- Generate 5 relevant questions about the agent's performance
- Questions should cover compliance, customer service, and sales techniques
- Provide clear yes/no answers with explanations

For follow-up tasks:
- Create actionable follow-up items based on the conversation
- Include both immediate and long-term tasks
- Prioritize tasks based on urgency and importance

For suggestions:
- Analyze the missed opportunities identified earlier and provide specific training to address each one
- Reference the key moments where improvement was needed
- Use the best practices assessment to guide coaching recommendations
- Consider the agent's scores in different parameters (engagement, effectiveness, confidence)
- Provide actionable feedback tied to specific moments in the conversation
- Suggest training materials that directly address the biggest improvement areas
- Ensure recommendations are practical and focused on measurable improvements
- Link each suggestion to concrete business outcomes (sales, customer satisfaction, compliance)

Example feedback format:
- "At [timestamp], missed opportunity to [specific action]. Practice [specific technique] to handle similar situations."
- "Low engagement score during [specific part]. Review [specific module] to improve customer interaction."
- "Noticed [specific issue] at [timestamp]. Recommend [specific training] to enhance this skill."

Example training materials format:
- "Guide: [Specific topic] - Addresses missed opportunities in [specific area]"
- "Workshop: [Specific skill] - Focuses on improving [specific metric] score"
- "Module: [Specific technique] - Helps prevent [specific issue] observed at [timestamp]"

For filler words analysis:
1. Count EVERY occurrence of filler words, not just unique words
2. Example: If speaker says "Um" 3 times and "Ah" 2 times, total count should be 5
3. Track frequency of each filler word separately in the "details" object
4. Common filler words to look for: um, uh, like, you know, basically, actually, sort of, kind of, right, okay, so, well (when used as fillers)
5. Only count "like", "so", "right", "okay", "well" when they're used as fillers, not when used properly in sentences
6. The count should represent total filler word occurrences per minute (total occurrences divided by call duration in minutes)

IMPORTANT: Your response MUST be valid JSON. Do not use plus signs (+) before positive numbers. For example, use "change": 2 instead of "change": +2. All numbers should be written without any sign prefix unless they are negative.`
        },
        {
          role: "user",
          content: transcriptionText
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Clean the response to ensure valid JSON
    let responseContent = response.choices[0].message.content;
    
    // Replace any remaining +number with just number (removing the + sign)
    responseContent = responseContent.replace(/"\+(\d+)/g, '"$1');
    responseContent = responseContent.replace(/: \+(\d+)/g, ': $1');
    
    try {
      const metricsData = JSON.parse(responseContent);
      console.log("Metrics Response:", metricsData);
      return metricsData;
    } catch (parseError) {
      console.error("Error parsing metrics JSON:", parseError);
      console.error("Invalid JSON:", responseContent);
      // Return a default metrics object if parsing fails
      return {
        overallScore: { score: 50, reason: "Default score due to parsing error", change: 0, period: "yesterday" },
        complianceScore: { score: 50, reason: "Default score due to parsing error", change: 0, period: "yesterday" },
        talkListenRatio: { ratio: "50:50", analysis: "Default analysis due to parsing error", change: 0, period: "yesterday" },
        fillerWords: { count: 0, details: {}, examples: ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"], change: 0, period: "past week" },
        pace: { speed: 150, assessment: "optimal", change: 0, period: "past week" },
        parameters: { en: 50, ef: 50, co: 50 },
        summary: {
          keyTopics: [{ id: "1", topic: "Default topic due to parsing error", starred: false, completed: false }],
          callSummary: "Unable to generate summary due to parsing error",
          actionItems: ["Review call manually"]
        },
        insights: {
          keyMoments: [{ timestamp: "00:00", description: "Default moment due to parsing error" }],
          missedOpportunities: [{ id: "1", title: "Default opportunity", description: "Unable to analyze missed opportunities due to parsing error" }],
          bestPractices: { questions: [{ question: "Was the call handled properly?", answer: "yes", explanation: "Default answer due to parsing error" }] },
          followUpTasks: [{ id: "1", task: "Review call manually", completed: false, priority: "high" }]
        },
        suggestions: {
          personalizedCoaching: { title: "AI-Based Feedback & Learning Modules", feedback: ["Review call manually due to parsing error"] },
          trainingMaterials: { title: "Suggested Training Materials", materials: ["General call handling training"] }
        }
      };
    }
  } catch (error) {
    console.error("Error calculating metrics:", error);
    throw error;
  }
}

app.post("/transcribe", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Read the file from disk
        const fileStream = fs.createReadStream(req.file.path);

        // Prepare the form data correctly
        const formData = new FormData();
        formData.append("collectionName", "1582_Test1call");
        formData.append("usertype", "pro");
        formData.append("file", fileStream, req.file.originalname);
        formData.append("task", "transcribe");

        // Send request to Supervity API
        const response = await axios.post(
            "https://docser.supervity.ai/app/v2/NewTranscribeAPI",
            formData,
            {
                headers: {
                    "x-orgId": "1582",
                    "X-Api-Org": "1582",
                    "X-Api-Token": "a0f3e8ac8ae347b26644d6c4",
                    ...formData.getHeaders(),
                },
            }
        );

        // Process both transcription and metrics
        const transcriptionText = response.data.response?.transcribed_text || "";
        const [structuredData, metricsData] = await Promise.all([
            processTranscriptionWithGPT(transcriptionText),
            calculateCallMetrics(transcriptionText)
        ]);

        // Clean up temporary file
        fs.unlinkSync(req.file.path);

        // Send all data
        res.json({
            original: response.data,
            structured: JSON.parse(structuredData),
            metrics: metricsData
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Error processing the file" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});