import React, { useState } from 'react';

function CustomAudioUploader() {
  const [audioFile, setAudioFile] = useState(null);

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        id="audio-upload"
        style={{ display: 'none' }} // Hide the default file input
      />
      <label htmlFor="audio-upload" style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
        {audioFile ? 'Change Audio File' : 'Select an Audio File'}
      </label>
      {audioFile && (
        <div>
          <p>Selected file: {audioFile.name}</p>
          <audio controls>
            <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default CustomAudioUploader;
