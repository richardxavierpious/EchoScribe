import os
import logging
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import assemblyai as aai
from config import API_KEY

app = Flask(__name__)
CORS(app)  # Enable CORS
aai.settings.api_key = API_KEY

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Get the speaker count from the form data
    speaker_count = request.form.get('speakerCount')
    
    # Create a temporary directory
    with tempfile.TemporaryDirectory() as tmpdirname:
        file_path = os.path.join(tmpdirname, file.filename)
        file.save(file_path)

        transcriber = aai.Transcriber()
        
        # If speaker count is provided, use it; otherwise, use speaker detection without a set count
        if speaker_count and int(speaker_count) > 0:
            config = aai.TranscriptionConfig(speaker_labels=True, speakers_expected=int(speaker_count))
        else:
            # Default to speaker detection without specifying a count
            config = aai.TranscriptionConfig(speaker_labels=True)
            
        transcript = transcriber.transcribe(file_path, config)

        if transcript.status == aai.TranscriptStatus.error:
            logging.error(f"Transcription failed: {transcript.error}")
            return jsonify({'error': f"Transcription failed: {transcript.error}"}), 500

        # Format the transcript with speaker labels
        formatted_transcript = ""
        for utterance in transcript.utterances:
            formatted_transcript += f"Speaker {utterance.speaker}: {utterance.text}\n"

        return jsonify({'transcript': formatted_transcript})

if __name__ == '__main__':
    app.run(port=5000, debug=True)