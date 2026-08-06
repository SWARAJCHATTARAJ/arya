import re

# Mock contact book for PWA fallback mappings
# Since it's a PWA, it can't read native contacts. We map known names here.
CONTACTS = {
    "girlfriend": "555-0100",
    "mom": "555-0101",
    "dad": "555-0102",
    "emergency": "911"
}

def handle(text):
    text_lower = text.lower()
    
    # Try to extract a 10-digit number if they spoke it
    number_match = re.search(r'(\d{10})', text_lower)
    if number_match:
        return {
            "text": f"Calling {number_match.group(1)}",
            "action": "call",
            "payload": number_match.group(1)
        }
        
    # Try to match a known contact
    for name, number in CONTACTS.items():
        if name in text_lower:
            return {
                "text": f"Calling your {name}...",
                "action": "call",
                "payload": number
            }
            
    # Fallback if no specific contact found
    return {
        "text": "Who would you like to call? Say the name or number.",
        "action": "none"
    }
