import sounddevice as sd
import soundfile as sf
import numpy as np
from faster_whisper import WhisperModel
import time
import os

RATE = 16000
CHANNELS = 1

class STTPipeline:
    def __init__(self, model_size="base.en", device="cpu", compute_type="int8"):
        print(f"Loading faster-whisper model ({model_size})...")
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)

    def record_until_silence(self, silence_threshold=500, silence_duration=1.5, timeout=10.0):
        """
        Records audio from the microphone until silence is detected.
        Returns the path to the recorded WAV file.
        """
        print("Listening (Speak now)...")
        frames = []
        silence_start_time = None
        start_time = time.time()
        
        recording_done = False
        
        def callback(indata, _frames, _time, status):
            nonlocal silence_start_time, recording_done
            if status:
                print(status)
                
            audio_data = indata.flatten()
            frames.append(indata.copy())
            
            # Simple RMS energy calculation for silence detection
            rms = np.sqrt(np.mean(np.square(audio_data.astype(np.float32) * 32767)))
            
            if rms < silence_threshold:
                if silence_start_time is None:
                    silence_start_time = time.time()
                elif time.time() - silence_start_time > silence_duration:
                    recording_done = True
                    raise sd.CallbackStop()
            else:
                silence_start_time = None
            
            if time.time() - start_time > timeout:
                recording_done = True
                raise sd.CallbackStop()

        try:
            with sd.InputStream(samplerate=RATE, channels=CHANNELS, dtype='int16', callback=callback):
                while not recording_done:
                    sd.sleep(100)
        except sd.CallbackStop:
            pass

        # Save to a temporary file
        temp_file = "temp_recording.wav"
        audio_array = np.concatenate(frames, axis=0)
        sf.write(temp_file, audio_array, RATE)
        
        print("Recording stopped.")
        return temp_file

    def transcribe(self, audio_file):
        """
        Transcribes the given audio file using faster-whisper.
        """
        print("Transcribing...")
        segments, info = self.model.transcribe(audio_file, beam_size=5)
        
        text = ""
        for segment in segments:
            text += segment.text + " "
            
        return text.strip()
        
    def cleanup(self):
        pass

if __name__ == "__main__":
    stt = STTPipeline()
    audio_path = stt.record_until_silence()
    text = stt.transcribe(audio_path)
    print(f"\nTranscribed: {text}")
    if os.path.exists(audio_path):
        os.remove(audio_path)
