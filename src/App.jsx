import React, { useState } from 'react';

function App() {
  const [conversation, setConversation] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    try {
      const response = await fetch('http://localhost:7071/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text(); // Get response as text
      setSummary(data); // Set the summary directly
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App" style={styles.container}>
      <h1 style={styles.heading}>Conversation Summarizer</h1>

      {/* Text Area for Conversation Input */}
      <textarea
        style={styles.textArea}
        placeholder="Enter conversation here..."
        value={conversation}
        onChange={(e) => setConversation(e.target.value)}
      />

      {/* Summarize Button */}
      <button
        style={styles.button}
        onClick={handleSummarize}
      >
        Summarize
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
  },
  summary: {
    marginTop: '20px',
    textAlign: 'center',
  },
};

export default App;