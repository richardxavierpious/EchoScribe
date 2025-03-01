//// filepath: /src/RecordingIndicator.jsx
import React, { useEffect, useState } from 'react';
import './styles.css';

function RecordingIndicator({ isRecording }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // Reset timer if not recording
    if (!isRecording) {
      setSecondsElapsed(0);
      return;
    }

    // Start interval to update every second
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isRecording) return null;

  // Format secondsElapsed as HH:MM:SS
  const formatTime = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return (
      String(hours).padStart(2, '0') +
      ':' +
      String(minutes).padStart(2, '0') +
      ':' +
      String(seconds).padStart(2, '0')
    );
  };

  return (
    <div className="recording-indicator">
      <div className="recording-bar" />
      <div className="recording-timer">
        Recording: {formatTime(secondsElapsed)}
      </div>
    </div>
  );
}

export default RecordingIndicator;