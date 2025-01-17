import assemblyai as aai
from config import API_KEY

aai.settings.api_key = API_KEY


transcriber = aai.Transcriber()

audio_file = "transcription\\testing_data\\test3.mp3"


config = aai.TranscriptionConfig(speaker_labels=True)

transcript = transcriber.transcribe(audio_file, config)

if transcript.status == aai.TranscriptStatus.error:
    print(f"Transcription failed: {transcript.error}")
    exit(1)


for utterance in transcript.utterances:
    print(f"Speaker {utterance.speaker}: {utterance.text}")