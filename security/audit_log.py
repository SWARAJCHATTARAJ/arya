import os
import sys
import hashlib
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from storage.db import get_connection

def log_action(action, details=""):
    """
    Appends an action to the hash-chained audit log in the database.
    """
    conn = get_connection()
    c = conn.cursor()
    
    # Get previous hash
    c.execute("SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    prev_hash = row[0] if row else "0000000000000000000000000000000000000000000000000000000000000000"
    
    timestamp = datetime.now().isoformat()
    
    # Calculate new hash
    data_to_hash = f"{prev_hash}{action}{details}{timestamp}".encode('utf-8')
    new_hash = hashlib.sha256(data_to_hash).hexdigest()
    
    c.execute("INSERT INTO audit_log (action, details, timestamp, hash) VALUES (?, ?, ?, ?)",
              (action, details, timestamp, new_hash))
              
    conn.commit()
    conn.close()
    print(f"Audit log: [{action}] {details}")
