import re

def handle(text):
    text_lower = text.lower()
    
    # Extract what they want to play
    # e.g., "play shape of you" -> "shape of you"
    match = re.search(r'play\s+(.+)', text_lower)
    
    if match:
        song = match.group(1).strip()
        return {
            "text": f"Playing {song} on Spotify...",
            "action": "music",
            "payload": song
        }
        
    return {
        "text": "What would you like to play?",
        "action": "none"
    }
