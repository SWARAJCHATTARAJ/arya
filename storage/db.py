import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'arya_local.db')

def get_connection():
    # To upgrade to SQLCipher later, this would use pysqlcipher3
    # and execute: conn.execute(f"PRAGMA key='{encryption_key}'")
    conn = sqlite3.connect(DB_FILE)
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # Create reminders table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminder_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Create audit log table
    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            hash TEXT
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
