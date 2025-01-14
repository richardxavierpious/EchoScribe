import assemblyai as aai

aai.settings.api_key = "5c27bcc19e0642a38ad9842281185dbe"

transcriber = aai.Transcriber()

audio_file = "./../sampledata/memories.mp3"

transcript = transcriber.transcribe(audio_file)

if transcript.error:
   print(transcript.error)
   exit(1)

print(transcript.text)