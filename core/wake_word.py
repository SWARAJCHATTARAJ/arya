import sounddevice as sd
import numpy as np
from openwakeword.model import Model
import argparse

# Audio parameters
FORMAT = 'int16'
CHANNELS = 1
RATE = 16000
CHUNK = 1280

def listen_for_wake_word(model_name="hey_jarvis"):
    """
    Listens continuously for the wake word using a rolling buffer.
    """
    print("Initializing openWakeWord...")
    owwModel = Model(wakeword_models=[model_name], inference_framework="onnx")

    print(f"Listening for '{model_name}'...")
    
    wake_word_detected = False

    def callback(indata, frames, time, status):
        nonlocal wake_word_detected
        if status:
            print(status)
            
        audio_data = indata.flatten()
        prediction = owwModel.predict(audio_data)
        
        for mdl, score in prediction.items():
            if score > 0.5:
                print(f"\nWake word detected! (Score: {score:.3f})")
                wake_word_detected = True
                raise sd.CallbackStop()

    try:
        with sd.InputStream(samplerate=RATE, channels=CHANNELS, dtype=FORMAT, blocksize=CHUNK, callback=callback):
            while not wake_word_detected:
                sd.sleep(100)
    except sd.CallbackStop:
        pass
    except KeyboardInterrupt:
        print("\nStopping...")
        
    return wake_word_detected

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="hey_jarvis", help="Wake word model to use")
    args = parser.parse_args()
    listen_for_wake_word(args.model)
