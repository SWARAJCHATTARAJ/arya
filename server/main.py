import os
import sys
import asyncio
import threading
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response

# Ensure core and skills are in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from storage.db import init_db
from core.llm_provider import LLMProvider
from core.orchestrator import Orchestrator

app = FastAPI()
clients = []

# State
current_state = "idle" # idle, listening, processing, speaking
transcript = ""

MODE = os.getenv("MODE", "local") # "local" or "cloud"

# Initialize orchestration
init_db()
llm = LLMProvider()
orc = Orchestrator(skills_dir=os.path.join(os.path.dirname(__file__), '..', 'skills'), llm_provider=llm)

def broadcast_state():
    state_msg = json.dumps({
        "type": "state",
        "state": current_state,
        "transcript": transcript
    })
    for client in clients:
        asyncio.run_coroutine_threadsafe(client.send_text(state_msg), loop)

def set_state(new_state, new_transcript=None):
    global current_state, transcript
    current_state = new_state
    if new_transcript is not None:
        transcript = new_transcript
    print(f"[STATE] {current_state} | {transcript}")
    broadcast_state()

def process_query_from_ws(text, websocket):
    # Process text query received via WebSocket (Cloud mode)
    set_state("processing", text)
    response_data = orc.route_query(text)
    
    text_reply = response_data.get("text", "")
    set_state("speaking", text_reply)
    
    # Send response back to WS for frontend TTS
    payload = {
        "type": "response",
        "text": text_reply
    }
    
    if "action" in response_data:
        payload["action"] = response_data["action"]
    if "payload" in response_data:
        payload["payload"] = response_data["payload"]
        
    asyncio.run_coroutine_threadsafe(websocket.send_text(json.dumps(payload)), loop)
    
    set_state("idle", "")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        # Send initial state
        await websocket.send_text(json.dumps({
            "type": "state",
            "state": current_state,
            "transcript": transcript
        }))
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "query":
                # Handle text query from client
                threading.Thread(target=process_query_from_ws, args=(msg.get("text"), websocket)).start()
            # Handle other messages if any
    except WebSocketDisconnect:
        clients.remove(websocket)

def run_local_assistant_loop():
    print("Starting Arya local hardware loop...")
    from core.wake_word import listen_for_wake_word
    from core.stt import STTPipeline
    from core.tts import TTSPipeline
    
    stt = STTPipeline()
    tts = TTSPipeline()
    
    while True:
        set_state("idle", "")
        # Block until wake word
        listen_for_wake_word()
        
        set_state("listening", "...")
        audio_path = stt.record_until_silence()
        
        set_state("processing", "Transcribing...")
        text = stt.transcribe(audio_path)
        
        if text:
            set_state("processing", text)
            response_data = orc.route_query(text)
            text_reply = response_data.get("text", "")
            
            set_state("speaking", text_reply)
            tts.speak(text_reply)
        else:
            set_state("idle", "")
            
        if os.path.exists(audio_path):
            os.remove(audio_path)

@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_running_loop()
    
    if MODE == "local":
        # Run the local hardware assistant loop
        thread = threading.Thread(target=run_local_assistant_loop, daemon=True)
        thread.start()
    else:
        print("Starting in CLOUD mode. Waiting for WebSocket connections...")

if __name__ == "__main__":
    import uvicorn
    host = "127.0.0.1" if MODE == "local" else "0.0.0.0"
    uvicorn.run(app, host=host, port=8000)
