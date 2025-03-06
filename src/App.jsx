import React, { useState, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './styles.css';
import { jsPDF } from 'jspdf';
import RecordingIndicator from './RecordingIndicator';

function App() {
  const [conversation, setConversation] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [briefSummary, setBriefSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1: Upload, 2: Transcribe, 3: Summary
  const [speakerCount, setSpeakerCount] = useState(2); // Default to 2 speakers
  const [useAutomaticSpeakerDetection, setUseAutomaticSpeakerDetection] = useState(true); // For upload feature

  // Indicates which operation is loading: 'transcribing', 'executive', 'brief', or null.
  const [loadingOperation, setLoadingOperation] = useState(null);

  // Recording state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    setFileName(file ? file.name : '');
  };

  const startRecording = async () => {
    if (speakerCount < 1) {
      alert('Please enter a valid number of speakers (minimum 1)');
      return;
    }
    
    // When recording, we'll always use the manually specified speaker count
    setUseAutomaticSpeakerDetection(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
        setAudioFile(file);
        setFileName(file.name);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      alert('Please select or record an audio file to transcribe.');
      return;
    }
    setLoadingOperation('transcribing');
    const formData = new FormData();
    formData.append('file', audioFile);
    
    // Send the speaker count only if automatic detection is not enabled
    if (!useAutomaticSpeakerDetection) {
      formData.append('speakerCount', speakerCount.toString());
    }

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setConversation(data.transcript);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingOperation(null);
    }
  };

  const handleSummarize = async (summaryType) => {
    setLoadingOperation(summaryType === 'executive' ? 'executive' : 'brief');

    try {
      const response = await fetch('http://localhost:7071/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation, summaryType }),
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.text();
      if (summaryType === 'executive') {
        setExecutiveSummary(data);
      } else {
        setBriefSummary(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingOperation(null);
    }
  };

  const downloadPDF = (summaryContent) => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    
    // Split the summary text into wrapped lines
    const textLines = doc.splitTextToSize(summaryContent, maxWidth);
    doc.text(textLines, margin, margin);
    doc.save('summary.pdf');
  };

  // Navigation functions
  const goToUpload = () => setCurrentPage(1);
  const goToTranscribe = () => {
    if (audioFile) {
      setCurrentPage(2);
    } else {
      alert('Please select or record an audio file first.');
    }
  };
  const goToSummary = () => {
    if (conversation) {
      setCurrentPage(3);
    } else {
      alert('Please transcribe the audio first.');
    }
  };

  // Handle speaker count change
  const handleSpeakerCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count > 0) {
      setSpeakerCount(count);
    }
  };

  // Toggle automatic speaker detection
  const toggleSpeakerDetection = (e) => {
    setUseAutomaticSpeakerDetection(e.target.checked);
  };

  return (
    <div className="app">
      {/* Top Header - Present on all pages */}
      <header className="app-header">
        <div className="logo-container">
          <img src="/echoscribelogo2.jpeg" alt="EchoScribe Logo" className="logo" />
        </div>
        
        {/* Navigation Tabs */}
        <nav className="main-nav">
          <button 
            className={`nav-tab ${currentPage === 1 ? 'active' : ''}`} 
            onClick={goToUpload}
          >
            1. Upload
          </button>
          <button 
            className={`nav-tab ${currentPage === 2 ? 'active' : ''}`} 
            onClick={goToTranscribe}
            disabled={!audioFile}
          >
            2. Transcribe
          </button>
          <button 
            className={`nav-tab ${currentPage === 3 ? 'active' : ''}`} 
            onClick={goToSummary}
            disabled={!conversation}
          >
            3. Summarize
          </button>
        </nav>
      </header>

      <main className="app-content">
        {/* PAGE 1: UPLOAD */}
        {currentPage === 1 && (
          <div className="page upload-page">
            <h2>Upload or Record Audio</h2>
            <p className="page-description">
              Start by uploading an audio file or recording directly within the application
            </p>
            
            <div className="upload-options">
              {/* UPLOAD CARD - Restructured */}
              <div className="upload-card">
                <div className="upload-card-content">
                  <div className="card-icon">
                    <span className="material-icon">📁</span>
                  </div>
                  <h3>Upload Audio File</h3>
                  <p>Select an audio file from your device</p>
                </div>
                
                <div className="upload-card-actions">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    id="fileInput"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fileInput" className="button browse-button">
                    Select File
                  </label>
                  {fileName && (
                    <div className="selected-file">
                      <span className="file-label">Selected:</span>
                      <span className="file-name-display">{fileName}</span>
                    </div>
                  )}
                  
                  {/* Speaker detection checkbox for uploaded files */}
                  {fileName && (
                    <div className="speaker-detection-option">
                      <input
                        id="automaticDetection"
                        type="checkbox"
                        checked={useAutomaticSpeakerDetection}
                        onChange={toggleSpeakerDetection}
                      />
                      <label htmlFor="automaticDetection">
                        Use automatic speaker detection
                      </label>
                    </div>
                  )}
                  
                  {/* Show speaker count input if automatic detection is disabled */}
                  {fileName && !useAutomaticSpeakerDetection && (
                    <div className="speaker-count-container">
                      <label htmlFor="uploadSpeakerCount" className="speaker-count-label">
                        Number of Speakers:
                      </label>
                      <input
                        id="uploadSpeakerCount"
                        type="number"
                        min="1"
                        value={speakerCount}
                        onChange={handleSpeakerCountChange}
                        className="speaker-count-input"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              {/* RECORD CARD - Restructured */}
              <div className="upload-card">
                <div className="upload-card-content">
                  <div className="card-icon">
                    <span className="material-icon">🎙️</span>
                  </div>
                  <h3>Record Audio</h3>
                  <p>Record audio directly using your microphone</p>
                </div>
                
                <div className="upload-card-actions">
                  {/* Speaker count input */}
                  <div className="speaker-count-container">
                    <label htmlFor="speakerCount" className="speaker-count-label">
                      Number of Speakers:
                    </label>
                    <input
                      id="speakerCount"
                      type="number"
                      min="1"
                      value={speakerCount}
                      onChange={handleSpeakerCountChange}
                      className="speaker-count-input"
                    />
                  </div>
                  
                  {!recording ? (
                    <button className="button record-button" onClick={startRecording}>
                      Start Recording
                    </button>
                  ) : (
                    <button className="button record-button" onClick={stopRecording}>
                      Stop Recording
                    </button>
                  )}
                  
                  {/* Recording indicator */}
                  <RecordingIndicator isRecording={recording} />
                </div>
              </div>
            </div>
            
            <div className="page-actions">
              <button 
                className="button action-button next-button"
                onClick={goToTranscribe}
                disabled={!audioFile}
              >
                Continue to Transcription
              </button>
            </div>
          </div>
        )}
        
        {/* PAGE 2: TRANSCRIBE */}
        {currentPage === 2 && (
          <div className="page transcribe-page">
            <h2>Transcribe Audio</h2>
            <p className="page-description">
              Convert your audio into text with our advanced transcription engine
            </p>
            
            <div className="file-info">
              <span className="file-info-label">Selected file:</span>
              <span className="file-info-name">{fileName}</span>
              {!useAutomaticSpeakerDetection && (
                <span className="speaker-info">
                  {" | "} Speakers: {speakerCount}
                </span>
              )}
              {useAutomaticSpeakerDetection && (
                <span className="speaker-info">
                  {" | "} Using automatic speaker detection
                </span>
              )}
            </div>
            
            <div className="transcription-container">
              <div className="transcription-controls">
                <button className="button transcribe-button" onClick={handleTranscribe}>
                  Start Transcription
                </button>
              </div>
              
              <div className="transcription-output">
                {loadingOperation === 'transcribing' ? (
                  <div className="loading-container">
                    <CircularProgress style={{ color: 'var(--primary-color)' }} />
                    <p className="loading-text">Transcribing audio...</p>
                  </div>
                ) : (
                  <textarea
                    placeholder="Transcribed text will appear here..."
                    value={conversation}
                    onChange={(e) => setConversation(e.target.value)}
                  />
                )}
              </div>
            </div>
            
            <div className="page-actions">
              <button className="button action-button back-button" onClick={goToUpload}>
                Back to Upload
              </button>
              <button 
                className="button action-button next-button"
                onClick={goToSummary}
                disabled={!conversation}
              >
                Continue to Summary
              </button>
            </div>
          </div>
        )}
        
        {/* PAGE 3: SUMMARIZE */}
        {currentPage === 3 && (
          <div className="page summary-page">
            <h2>Generate Summaries</h2>
            <p className="page-description">
              Create concise summaries from your transcribed text
            </p>
            
            <div className="summary-options">
              <div className="summary-controls">
                <button 
                  className="button summary-button"
                  onClick={() => handleSummarize('executive')}
                >
                  Generate Executive Summary
                </button>
                <button 
                  className="button summary-button"
                  onClick={() => handleSummarize('brief')}
                >
                  Generate Brief Summary
                </button>
              </div>
              
              <div className="summary-results">
                <div className="summary-card">
                  <h3>Executive Summary</h3>
                  <div className="summary-content">
                    {loadingOperation === 'executive' ? (
                      <div className="loading-container">
                        <CircularProgress style={{ color: 'var(--primary-color)' }} />
                        <p className="loading-text">Generating executive summary...</p>
                      </div>
                    ) : (
                      <p className="summary-text">{executiveSummary || "No executive summary generated yet."}</p>
                    )}
                  </div>
                  {executiveSummary && (
                    <button 
                      className="button download-button"
                      onClick={() => downloadPDF(executiveSummary)}
                    >
                      Download PDF
                    </button>
                  )}
                </div>
                
                <div className="summary-card">
                  <h3>Brief Summary</h3>
                  <div className="summary-content">
                    {loadingOperation === 'brief' ? (
                      <div className="loading-container">
                        <CircularProgress style={{ color: 'var(--primary-color)' }} />
                        <p className="loading-text">Generating brief summary...</p>
                      </div>
                    ) : (
                      <p className="summary-text">{briefSummary || "No brief summary generated yet."}</p>
                    )}
                  </div>
                  {briefSummary && (
                    <button 
                      className="button download-button"
                      onClick={() => downloadPDF(briefSummary)}
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="page-actions">
              <button className="button action-button back-button" onClick={goToTranscribe}>
                Back to Transcription
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Present on all pages */}
      <footer className="app-footer">
        <div className="footer-logo">
          <img src="/echoscribelogo2.jpeg" alt="EchoScribe Logo" className="logo" />
        </div>
        <div className="footer-links">
          <a href="#">Contact Info</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}

export default App;