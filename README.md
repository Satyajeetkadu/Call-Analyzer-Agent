# CallAnalyze

A web application for analyzing call recordings, providing insights, transcriptions, and filler word analytics.

## Features

- Audio file upload with real-time progress tracking
- Dynamic multi-stage process visualization (Uploading → Transcribing → Analyzing)
- Speaker identification and conversation segregation
- Detailed call metrics and insights:
  - Overall performance score
  - Compliance evaluation
  - Talk to listen ratio analysis
  - Filler word detection and frequency analysis
  - Speaking pace measurement
- Interactive UI for reviewing transcripts and insights

## Tech Stack

- **Frontend:** React.js with modern hooks and context
- **Backend:** Node.js with Express
- **APIs:** OpenAI integration for transcription and analysis
- **Styling:** Custom CSS with responsive design

## Setup

### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env

# Edit .env with your API keys
# Open .env and add your OpenAI API key

# Start the server
npm start
```

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at: http://localhost:3000

## Deployment

This application can be deployed on Render.com:

1. Deploy the backend as a Web Service
2. Deploy the frontend as a Static Site
3. Set the appropriate environment variables:
   - Backend: `OPENAI_API_KEY`
   - Frontend: `REACT_APP_API_URL` (pointing to your backend URL)

## Project Structure

```
CallAnalyze/
├── backend/              # Node.js backend
│   ├── index.js          # Main server file
│   ├── uploads/          # Temporary audio storage
│   └── package.json      # Backend dependencies
├── frontend/             # React frontend
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── Home.js       # Upload and call listing
│   │   ├── Insights.js   # Call analysis dashboard
│   │   └── assets/       # Images and icons
│   └── package.json      # Frontend dependencies
└── README.md             # Project documentation
``` 