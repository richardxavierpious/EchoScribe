import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './styles.css';

function App() {
  const [conversation, setConversation] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [briefSummary, setBriefSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState('');

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

  return (
    <div className="app">
      {/* Top Header */}
      <div className="header">
        <h1>ECHOSCRIBE</h1>
      </div>

      {/* Second bar with file input, record button, and file name */}
      <div className="top-bar">
        {/* Hidden file input */}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          id="fileInput"
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className="button browse-button">
          Upload File
        </label>

        <button className="button record-button">Record</button>

        <span className="file-name">
          {fileName ? fileName : '*file_name.mp3'}
        </span>
      </div>

      {/* Main content area: two columns */}
      <div className="content-container">
        {/* Left column: Transcription */}
        <div className="transcription-container">


          {/* Transcribe button (same width as summary buttons) */}
          <button className="button" onClick={handleTranscribe}>
            Transcribe
          </button>

          {/* Box that holds textarea (and spinner) */}
          <div className="transcription-output">
            <textarea
              placeholder="Transcribed text will appear here..."
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
            />
            {loadingOperation === 'transcribing' && (
              <CircularProgress style={{ margin: '10px auto 0' }} />
            )}
          </div>
        </div>

        {/* Right column: Summaries */}
        <div className="summary-container">
          <div className="buttons-row">
            <button
              className="button"
              onClick={() => handleSummarize('executive')}
            >
              Executive Summmary
            </button>
            <button
              className="button"
              onClick={() => handleSummarize('brief')}
            >
              Brief Summmary
            </button>
          </div>

          <div className="summary-output">
            <h4>Generated executive summary</h4>
            {loadingOperation === 'executive' && (
              <CircularProgress style={{ margin: '10px auto 0' }} />
            )}
            <p>{executiveSummary}</p>
          </div>

          <div className="summary-output">
            <h4>Generated brief summary</h4>
            {loadingOperation === 'brief' && (
              <CircularProgress style={{ margin: '10px auto 0' }} />
            )}
            <p>{briefSummary}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-links">
          <a href="#">Contact Info</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  );
}

export default App;
