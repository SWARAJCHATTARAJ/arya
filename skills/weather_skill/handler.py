import urllib.request
import json

def handle(text):
    """
    Fetches the current weather for a default location (London).
    In a real app, this would parse the city from the text or use geolocation.
    """
    # Open-Meteo API for London
    url = "https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current_weather=true"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            current = data.get("current_weather", {})
            temp = current.get("temperature")
            # Weather code translation is needed for exact description, but we can give temp.
            if temp is not None:
                return f"The current temperature is {temp} degrees Celsius."
            else:
                return "I couldn't retrieve the current temperature."
    except Exception as e:
        print(f"Weather API error: {e}")
        return "I am unable to check the weather right now."
