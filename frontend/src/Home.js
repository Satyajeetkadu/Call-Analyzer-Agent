import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import './Home.css';
import SuperLogo from './assets/SupervityLogoNew.png';
import { Link } from 'react-router-dom';
import { FaHome, FaChartBar, FaCalendar, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState(""); // "uploading", "transcribing", "analyzing", "completed"
  const [animateStage, setAnimateStage] = useState(false);
  const [calls, setCalls] = useState([]);
  const navigate = useNavigate();
  const prevStageRef = useRef("");

  // Effect to trigger animation when stage changes
  useEffect(() => {
    if (processingStage && processingStage !== prevStageRef.current) {
      setAnimateStage(true);
      const timer = setTimeout(() => {
        setAnimateStage(false);
      }, 1000);
      
      prevStageRef.current = processingStage;
      return () => clearTimeout(timer);
    }
  }, [processingStage]);

  // Function to format duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m${remainingSeconds}s`;
  };

  // Function to get audio duration
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      });
    });
  };

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const handleDeleteCall = (callId) => {
    setCalls(prevCalls => prevCalls.filter(call => call.id !== callId));
  };

  const handleRefreshCall = (callId) => {
    console.log("Refresh call:", callId);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setProcessingStage("uploading");

    try {
      const duration = await getAudioDuration(file);
      const formattedDuration = formatDuration(duration);

      const formData = new FormData();
      formData.append("file", file);

      // Stage 1: Uploading (0-30%)
      const API_URL = process.env.REACT_APP_API_URL || "https://call-analyzer-agent.onrender.com";
      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Map file upload progress to 0-30% of total progress
          setUploadProgress(Math.min(Math.floor(percentCompleted * 0.3), 30));
        }
      });

      // Stage 2: Transcribing (30-60%)
      setProcessingStage("transcribing");
      // Simulate transcription progress
      for (let i = 31; i <= 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(i);
      }

      // Stage 3: Analyzing (60-90%)
      setProcessingStage("analyzing");
      // Simulate analysis progress
      for (let i = 61; i <= 90; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(i);
      }

      // Stage 4: Completed (100%)
      setProcessingStage("completed");
      setUploadProgress(100);
      
      console.log("Backend Response:", response.data);

      const newCall = {
        id: file.name,
        duration: formattedDuration,
        score: response.data.metrics ? `${response.data.metrics.overallScore.score}%` : "N/A",
        date: new Date().toLocaleString(),
        status: "Completed",
        transcriptionData: response.data.structured,
        metrics: response.data.metrics
      };
      
      console.log("New Call Object:", newCall);
      
      setCalls(prevCalls => [newCall, ...prevCalls]);
      setFile(null);

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      // Keep the completed state visible for a moment
      setTimeout(() => {
        setLoading(false);
        setProcessingStage("");
      }, 1500);
    }
  };

  // Function to get the current stage text
  const getStageText = () => {
    switch (processingStage) {
      case "uploading":
        return "Uploading...";
      case "transcribing":
        return "Transcribing...";
      case "analyzing":
        return "Extracting Insights...";
      case "completed":
        return "100% Completed";
      default:
        return "Processing...";
    }
  };

  const handleCallClick = (call) => {
    console.log("Call clicked:", call);
    console.log("Transcription data:", call.transcriptionData);
    console.log("Metrics data:", call.metrics);
    
    navigate('/insights', { 
      state: { 
        transcription: call.transcriptionData,
        metrics: call.metrics,
        duration: call.duration
      }
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'] // Accept only audio files
    }
  });

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo-container">
          <img src={SuperLogo} alt="Supervity" className="logo" />
        </div>
        
        <div className="nav-items">
          <Link to="/" className="nav-item active">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to="/insights" className="nav-item">
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

      <div className="main-content">
        <h1 className="greeting">Hello Jay,</h1>

        <div className="upload-container">
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <div className="dropzone-text">
              <p>Drag your file(s) or</p>
              <p>Max 10 MB files are allowed</p>
            </div>
          </div>

          {file && <p className="selected-file">Selected file: {file.name}</p>}
          <button onClick={uploadFile} className="upload-btn" disabled={!file || loading}>
            {loading ? 'Processing...' : 'Upload Audio'}
          </button>

          {loading && (
            <div className="progress-container">
              <div className="circle-progress-container">
                <svg className="circle-progress" viewBox="0 0 100 100">
                  <circle className="circle-bg" cx="50" cy="50" r="45"></circle>
                  <circle 
                    className="circle-fill" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    style={{ 
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - uploadProgress / 100)}`
                    }}
                  ></circle>
                </svg>
                <div className="progress-percentage">{uploadProgress}%</div>
              </div>
              <div 
                className={`progress-stage ${processingStage} ${animateStage ? 'animate' : ''} glow`}
              >
                {getStageText()}
              </div>
            </div>
          )}
        </div>

        <div className="calls-section">
          <h2>Calls</h2>
          
          <div className="table-container">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Call File</th>
                  <th>Call Duration</th>
                  <th>Overall Score</th>
                  <th>Date | Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-calls">
                      No calls uploaded yet
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call.id} onClick={() => handleCallClick(call)}>
                      <td className="call-id">{call.id}</td>
                      <td>{call.duration}</td>
                      <td>{call.score}</td>
                      <td>{call.date}</td>
                      <td>
                        <span className={`status-badge ${call.status.toLowerCase()}`}>
                          {call.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" onClick={e => e.stopPropagation()}>
                          <button 
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshCall(call.id);
                            }}
                          >↻</button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCall(call.id);
                            }}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
