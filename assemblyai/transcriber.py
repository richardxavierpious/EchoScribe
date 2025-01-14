import assemblyai as aai
from config import API_KEY

aai.settings.api_key = API_KEY

transcriber = aai.Transcriber()

# You can use a local filepath:
# audio_file = "./example.mp3"

# Or use a publicly-accessible URL:
audio_file = "C:\\Users\\richa\\OneDrive\\Desktop\\Repos\\EchoScribe\\assemblyai\\test1.mp3"


config = aai.TranscriptionConfig(speaker_labels=True, speakers_expected=3)

transcript = transcriber.transcribe(audio_file, config)

if transcript.status == aai.TranscriptStatus.error:
    print(f"Transcription failed: {transcript.error}")
    exit(1)

print(transcript.text)

for utterance in transcript.utterances:
    print(f"Speaker {utterance.speaker}: {utterance.text}")