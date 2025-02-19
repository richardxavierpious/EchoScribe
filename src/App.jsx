import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const [conversation, setConversation] = useState('');
  const [summary, setSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSummarize = async (summaryType) => {
    setLoading(true);
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
      setSummary(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={styles.container}>
      <h1 style={styles.heading}>EchoScribe</h1>

      {/* File Input for Audio Upload */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={styles.fileInput}
        id="fileInput"
      />
      <label htmlFor="fileInput" style={styles.button}>
        Browse
      </label>

      {fileName && <p style={styles.fileName}>{fileName}</p>}

      {/* Generate Transcript Button */}
      <button style={styles.button} onClick={handleTranscribe}>
        Generate Transcript
      </button>

      {/* Loading Indicator */}
      {loading && <CircularProgress style={{ margin: '20px' }} />}

      {/* Text Area for Conversation Input */}
      <textarea
        style={styles.textArea}
        placeholder="Enter conversation here..."
        value={conversation}
        onChange={(e) => setConversation(e.target.value)}
      />

      {/* Summarize Buttons */}
      <button style={styles.button} onClick={() => handleSummarize('brief')}>
        Brief Summary
      </button>
      <button style={styles.button} onClick={() => handleSummarize('executive')}>
        Executive Summary
      </button>

      {/* Display Summary */}
      {summary && (
        <div style={styles.summary}>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

// Basic inline styles for components
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    padding: '20px',
  },
  heading: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
  },
  fileInput: {
    display: 'none',
  },
  textArea: {
    width: '80%',
    height: '200px',
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginBottom: '20px',
    resize: 'none',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  fileName: {
    marginTop: '10px',
    fontSize: '1rem',
    color: '#333',
  },
  summary: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

export default App;