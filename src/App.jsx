// Import necessary React dependencies
import React, { useState } from 'react';
import './App.css'; // Optional: Add styles for your components

function App() {
  const [conversation, setConversation] = useState('');

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
        onClick={() => alert('Summarize functionality coming soon!')} // Placeholder for functionality
      >
        Summarize
      </button>
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
};

export default App;
