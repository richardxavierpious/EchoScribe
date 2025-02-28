import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './styles.css';
import { jsPDF } from 'jspdf';

function App() {
  const [conversation, setConversation] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [briefSummary, setBriefSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1: Upload, 2: Transcribe, 3: Summary

  // Indicates which operation is loading: 'transcribing', 'executive', 'brief', or null.
  const [loadingOperation, setLoadingOperation] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    setFileName(file ? file.name : '');
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      alert('Please select an audio file to transcribe.');
      return;
    }
    setLoadingOperation('transcribing');
    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setConversation(data.transcript);
      // Automatically move to the summary page after transcription
      setCurrentPage(3);
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
      alert('Please select an audio file first.');
    }
  };
  const goToSummary = () => {
    if (conversation) {
      setCurrentPage(3);
    } else {
      alert('Please transcribe the audio first.');
    }
  };

  return (
    <div className="app">
      {/* Top Header - Present on all pages */}
      <header className="app-header">
        <div className="logo-container">
        <img src="/echoscribelogo1.png" alt="EchoScribe Logo" className="logo" />
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
              <div className="upload-card">
                <div className="card-icon">
                  <span className="material-icon">📁</span>
                </div>
                <h3>Upload Audio File</h3>
                <p>Select an audio file from your device</p>
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
              </div>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="upload-card">
                <div className="card-icon">
                  <span className="material-icon">🎙️</span>
                </div>
                <h3>Record Audio</h3>
                <p>Record audio directly using your microphone</p>
                <button className="button record-button">
                  Start Recording
                </button>
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
        <img src="/echoscribelogo1.png" alt="EchoScribe Logo" className="logo" />
        
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