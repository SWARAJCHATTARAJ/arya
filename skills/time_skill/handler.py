from datetime import datetime

def handle(text):
    """
    Returns the current time.
    """
    now = datetime.now()
    time_str = now.strftime("%I:%M %p")
    return f"The current time is {time_str}."
