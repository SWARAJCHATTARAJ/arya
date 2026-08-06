import pystray
from PIL import Image, ImageDraw
import subprocess
import os
import sys

# Simple generic icon
def create_image(width, height, color1, color2):
    image = Image.new('RGB', (width, height), color1)
    dc = ImageDraw.Draw(image)
    dc.rectangle(
        (width // 2, 0, width, height // 2),
        fill=color2)
    dc.rectangle(
        (0, height // 2, width // 2, height),
        fill=color2)
    return image

def on_quit(icon, item):
    icon.stop()
    # In a real app, this should gracefully shut down the backend process.
    sys.exit(0)

if __name__ == "__main__":
    icon_image = create_image(64, 64, 'black', 'cyan')
    
    menu = (
        pystray.MenuItem('Arya Status: Running', lambda: None, enabled=False),
        pystray.MenuItem('Quit', on_quit)
    )
    
    icon = pystray.Icon("Arya", icon_image, "Arya Assistant", menu)
    
    print("Starting Arya in background...")
    
    # Start the backend server
    backend_process = subprocess.Popen(
        [sys.executable, os.path.join(os.path.dirname(__file__), '..', 'server', 'main.py')],
        creationflags=subprocess.CREATE_NO_WINDOW
    )
    
    icon.run()
    
    backend_process.terminate()
