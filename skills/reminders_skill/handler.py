import os
import sys

# Ensure storage is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from storage.db import get_connection

def handle(text):
    text_lower = text.lower()
    
    if "what are my reminders" in text_lower or "read my reminders" in text_lower:
        return read_reminders()
    
    if "remind me to" in text_lower:
        # naive parsing
        idx = text_lower.find("remind me to")
        reminder = text[idx + len("remind me to"):].strip()
        return save_reminder(reminder)
        
    return "I wasn't sure what you wanted to do with your reminders."

def save_reminder(reminder_text):
    if not reminder_text:
        return "I didn't catch what you wanted to be reminded about."
        
    conn = get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO reminders (reminder_text) VALUES (?)", (reminder_text,))
    conn.commit()
    conn.close()
    return f"Okay, I will remind you to {reminder_text}."

def read_reminders():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT reminder_text FROM reminders ORDER BY created_at DESC LIMIT 5")
    rows = c.fetchall()
    conn.close()
    
    if not rows:
        return "You have no saved reminders."
        
    reminders = [row[0] for row in rows]
    joined = ", ".join(reminders)
    return f"Your recent reminders are: {joined}."
