import React, { useState } from 'react';
import './Insights.css';
import SuperLogo from './assets/SupervityLogoNew.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaChartBar, FaCalendar, FaCog, FaInfoCircle } from 'react-icons/fa';

const Insights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transcriptionData = location.state?.transcription;
  const metricsData = location.state?.metrics;
  const duration = location.state?.duration;
  const [activeTab, setActiveTab] = useState('transcript');
  const [keyTopics, setKeyTopics] = useState(metricsData?.summary?.keyTopics || []);
  const [newTopic, setNewTopic] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState(metricsData?.insights?.followUpTasks || []);

  console.log("Location state:", location.state);
  console.log("Transcription data:", transcriptionData);
  console.log("Metrics data:", metricsData);

  // Only redirect if we came from uploading a file (check for state existence)
  React.useEffect(() => {
    if (location.state && !transcriptionData) {
      console.log("No transcription data after upload, redirecting to home");
      navigate('/');
    }
  }, [transcriptionData, navigate, location.state]);

  // Combine and sort messages to show in chronological order
  const getCombinedMessages = () => {
    if (!transcriptionData) {
      return [];
    }
    
    try {
      const { caller, receiver } = transcriptionData;
      const messages = [];
      
      // Assuming the lines arrays are of equal length or close to it
      const maxLength = Math.max(caller.lines.length, receiver.lines.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (caller.lines[i]) {
          messages.push({
            text: caller.lines[i],
            speaker: 'caller',
            name: caller.name
          });
        }
        if (receiver.lines[i]) {
          messages.push({
            text: receiver.lines[i],
            speaker: 'receiver',
            name: receiver.name
          });
        }
      }
      
      return messages;
    } catch (error) {
      console.error("Error processing messages:", error);
      return [];
    }
  };

  const messages = getCombinedMessages();

  // Add debug logging for messages
  console.log("Processed messages:", messages);

  // Replace the static insights data with the metrics
  const [insights] = useState({
    dateTime: {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    },
    duration: duration || '0m0s',
    overallScore: metricsData?.overallScore || {
      score: 0,
      change: 0,
      period: 'yesterday'
    },
    parameters: metricsData?.parameters || {
      en: 0,  // Engagement Score
      ef: 0,  // Effectiveness Score
      co: 0   // Confidence Score
    },
    complianceScore: metricsData?.complianceScore || {
      score: 0,
      change: 0,
      period: 'yesterday'
    },
    talkListenRatio: metricsData?.talkListenRatio || {
      ratio: '0:0',
      change: 0,
      period: 'yesterday'
    },
    fillerWords: metricsData?.fillerWords || {
      count: 0,
      unit: 'per min',
      change: 0,
      period: 'past week'
    },
    pace: metricsData?.pace || {
      speed: 0,
      unit: 'WPM',
      change: 0,
      period: 'past week'
    }
  });

  const renderChangeIndicator = (change, period) => {
    const isPositive = change > 0;
    return (
      <div className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)}% {period && `from ${period}`}
      </div>
    );
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      const newTopicItem = {
        id: String(keyTopics.length + 1),
        topic: newTopic
      };
      setKeyTopics([...keyTopics, newTopicItem]);
      setNewTopic('');
    }
  };

  // Add this function to handle task toggling
  const handleTaskToggle = (taskId) => {
    setFollowUpTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={SuperLogo} alt="Supervity" className="logo" />
        </div>
        
        <div className="nav-items">
          <Link to="/" className="nav-item">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to="/insights" className="nav-item active">
            <FaChartBar className="nav-icon" />
            <span>Insights</span>
          </Link>
          <Link to="/calendar" className="nav-item">
            <FaCalendar className="nav-icon" />
            <span>Calendar</span>
          </Link>
          <Link to="/settings" className="nav-item settings">
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="greeting">Hello Jay,</h1>

        {/* Sentiment Indicators */}
        <div className="sentiment-container">
          <div className="sentiment-item">
            <span>Agent Sentiment</span>
            <div className="sentiment-badge neutral">Neutral</div>
          </div>
          <div className="sentiment-item">
            <span>Customer Sentiment</span>
            <div className="sentiment-badge positive">Positive</div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="insights-grid">
          {/* Date & Time */}
          <div className="insight-card">
            <div className="insight-header">
              <h3>Date & Time</h3>
              <span className="icon">📅</span>
            </div>
            <div className="insight-content">
              <div className="large-text">{insights.dateTime.date}</div>
              <div className="sub-text">{insights.dateTime.time}</div>
            </div>
          </div>

          {/* Duration */}
          <div className="insight-card">
            <div className="insight-header">
              <h3>Duration</h3>
              <span className="icon">⏱️</span>
            </div>
            <div className="insight-content">
              <div className="large-text">{insights.duration}</div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Overall Score</h3>
                <div className="info-icon" title="Overall performance score based on engagement, effectiveness, and compliance metrics">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">📊</span>
            </div>
            <div className="insight-content">
              <div className="large-text">{insights.overallScore.score}%</div>
              {renderChangeIndicator(insights.overallScore.change, insights.overallScore.period)}
            </div>
          </div>

          {/* Compliance Score */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Compliance Score</h3>
                <div className="info-icon" title="Measures adherence to required protocols, disclosures, and regulatory requirements">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">✓</span>
            </div>
            <div className="insight-content">
              <div className="large-text">{insights.complianceScore.score}%</div>
              {renderChangeIndicator(insights.complianceScore.change, insights.complianceScore.period)}
            </div>
          </div>

          {/* Talk to Listen Ratio */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Talk to Listen Ratio</h3>
                <div className="info-icon" title="Ratio between agent speaking time and customer speaking time">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">🗣️</span>
            </div>
            <div className="insight-content">
              <div className="large-text">{insights.talkListenRatio.ratio}</div>
              {renderChangeIndicator(insights.talkListenRatio.change, insights.talkListenRatio.period)}
            </div>
          </div>

          {/* Filler Words */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Filler Words</h3>
                <div className="info-icon" title="Total count of filler words used (um, uh, like, etc.) with detailed breakdown">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">📝</span>
            </div>
            <div className="insight-content">
              <div className="large-text">
                {insights.fillerWords.count} total
              </div>
              {insights.fillerWords.details && (
                <div className="filler-details">
                  {Object.entries(insights.fillerWords.details)
                    .filter(([_, count]) => count > 0)
                    .map(([word, count]) => (
                      <div key={word} className="filler-item">
                        <span className="filler-word">{word}:</span>
                        <span className="filler-count">{count}</span>
                      </div>
                    ))
                  }
                </div>
              )}
              {renderChangeIndicator(insights.fillerWords.change, insights.fillerWords.period)}
            </div>
          </div>

          {/* Pace */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Pace</h3>
                <div className="info-icon" title="Speaking speed measured in words per minute (WPM)">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">⚡</span>
            </div>
            <div className="insight-content">
              <div className="large-text">
                {insights.pace.speed} WPM
              </div>
              {renderChangeIndicator(insights.pace.change, insights.pace.period)}
            </div>
          </div>

          {/* Parameters */}
          <div className="insight-card">
            <div className="insight-header">
              <div className="header-with-info">
                <h3>Call Parameters</h3>
                <div className="info-icon" title="Key performance indicators: Engagement (customer interaction), Effectiveness (problem resolution), and Confidence (communication clarity)">
                  <FaInfoCircle />
                </div>
              </div>
              <span className="icon">⚙️</span>
            </div>
            <div className="insight-content parameters">
              <div className="parameter-item">
                <span>{insights.parameters.en}</span>
                <label title="Engagement Score">Engagement</label>
              </div>
              <div className="parameter-item">
                <span>{insights.parameters.ef}</span>
                <label title="Effectiveness Score">Effectiveness</label>
              </div>
              <div className="parameter-item">
                <span>{insights.parameters.co}</span>
                <label title="Confidence Score">Confidence</label>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-section">
          <button 
            className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </button>
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Call Summary
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button 
            className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
        </div>

        {/* Show content based on active tab */}
        {activeTab === 'transcript' && (
          <div className="transcript-section">
            <div className="transcript-header">
              <h2>Call Transcript</h2>
              {transcriptionData && (
                <div className="participants">
                  <span className="participant caller">
                    {transcriptionData.caller.name}
                  </span>
                  <span className="participant-divider">and</span>
                  <span className="participant receiver">
                    {transcriptionData.receiver.name}
                  </span>
                </div>
              )}
            </div>

            <div className="messages-container">
              {location.state && !transcriptionData ? (
                <div className="no-transcript">
                  No transcription data available. Please select a call from the home page.
                </div>
              ) : !location.state ? (
                <div className="no-transcript">
                  Select a call from the home page to view its transcript.
                </div>
              ) : messages.length === 0 ? (
                <div className="no-transcript">
                  No messages found in the transcription.
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message-wrapper ${message.speaker}`}
                  >
                    <div className="message">
                      <div className="message-avatar">
                        {message.name[0]}
                      </div>
                      <div className="message-content">
                        <div className="message-sender">{message.name}</div>
                        <div className="message-bubble">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div className="summary-section">
            <div className="key-topics">
              <div className="topics-header">
                <h2>Key Topics</h2>
                <button className="add-topic-btn" onClick={handleAddTopic}>
                  Add new Topic
                </button>
              </div>
              
              {/* Add new topic input */}
              <div className="add-topic-input">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter new topic"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                />
              </div>

              {/* Topics list */}
              <div className="topics-list">
                {keyTopics.map(topic => (
                  <div key={topic.id} className="topic-container">
                    <span>{topic.topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="call-summary">
              <h2>Call Summary</h2>
              <div className="summary-content">
                {metricsData?.summary?.callSummary || 'No summary available'}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div className="insights-section">
            {/* Key Moments */}
            <div className="key-moments-section">
              <h2>Key Moments</h2>
              <div className="moments-list">
                {metricsData?.insights?.keyMoments.map((moment, index) => (
                  <div key={index} className="moment-item">
                    <div className="moment-timestamp">{moment.timestamp}</div>
                    <div className="moment-description">{moment.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missed Opportunities */}
            <div className="missed-opportunities-section">
              <h2>Missed Opportunities</h2>
              <div className="opportunities-list">
                {metricsData?.insights?.missedOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="opportunity-card">
                    <div className="opportunity-icon">📊</div>
                    <div className="opportunity-content">
                      <h3>{opportunity.title}</h3>
                      <p>{opportunity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div className="best-practices-section">
              <h2>Best Practices</h2>
              <div className="practices-list">
                {metricsData?.insights?.bestPractices.questions.map((item, index) => (
                  <div key={index} className="practice-item">
                    <div className="practice-question">{item.question}</div>
                    <div className={`practice-answer ${item.answer.toLowerCase()}`}>
                      {item.answer === 'yes' ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Tasks */}
            <div className="followup-section">
              <h2>Follow up Tasks</h2>
              <div className="tasks-list">
                {followUpTasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id)}
                    />
                    <span className={task.completed ? 'completed' : ''}>
                      {task.task}
                    </span>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
              <button className="push-crm-btn">Push to CRM</button>
            </div>
          </div>
        )}
        
        {activeTab === 'suggestions' && (
          <div className="suggestions-section">
            <h2>Personalised Coaching & Recommendations</h2>
            
            <div className="suggestions-grid">
              {/* AI Feedback Section */}
              <div className="suggestion-card">
                <div className="suggestion-header">
                  <h3>AI-Based Feedback & Learning Modules</h3>
                </div>
                <div className="suggestion-content">
                  {metricsData?.suggestions?.personalizedCoaching.feedback.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>

              {/* Training Materials Section */}
              <div className="suggestion-card">
                <div className="suggestion-header">
                  <h3>Suggested Training Materials</h3>
                </div>
                <div className="suggestion-content">
                  {metricsData?.suggestions?.trainingMaterials.materials.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights; 