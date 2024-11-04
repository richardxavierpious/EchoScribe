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

      <label htmlFor="audio-upload" style={{ cursor: 'pointer' }} className='bg-blue-700 rounded-sm p-2'>
        {audioFile ? 'Change Audio File' : 'Upload Audio File'}
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
