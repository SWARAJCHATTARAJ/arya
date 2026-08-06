import os
import time
import sounddevice as sd
import soundfile as sf

class TTSPipeline:
    def __init__(self, model_path="en_US-lessac-medium.onnx"):
        print(f"Initializing Piper TTS (model: {model_path})...")
        self.model_path = model_path
        
        try:
            from piper import PiperVoice
            if not os.path.exists(self.model_path):
                print(f"Warning: Model {self.model_path} not found. Please download it from HuggingFace.")
            else:
                self.voice = PiperVoice.load(self.model_path)
        except ImportError:
            print("piper-tts not installed. Install with: pip install piper-tts")
            self.voice = None

    def speak(self, text):
        if not self.voice:
            print(f"Cannot speak (piper not initialized): {text}")
            return
            
        print(f"Speaking: {text}")
        
        import wave
        temp_wav = "temp_tts.wav"
        
        with wave.open(temp_wav, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2) # 16-bit
            wav_file.setframerate(22050) # Assuming 22050 for lessac medium
            self.voice.synthesize(text, wav_file)
            
        self.play_wav(temp_wav)
        
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

    def play_wav(self, file_path):
        data, fs = sf.read(file_path)
        sd.play(data, fs)
        sd.wait()
        
    def cleanup(self):
        pass

if __name__ == "__main__":
    tts = TTSPipeline()
    tts.speak("Hello! I am Arya, your personal voice assistant.")
    tts.cleanup()
