import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'arya_local.db')
ENCRYPTION_KEY = os.getenv("ARYA_DB_KEY", "default-secure-key-123")

try:
    from pysqlcipher3 import dbapi2 as sqlite3
    USING_CIPHER = True
except ImportError:
    import sqlite3
    USING_CIPHER = False

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    if USING_CIPHER:
        conn.execute(f"PRAGMA key='{ENCRYPTION_KEY}'")
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
