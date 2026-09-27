import requests
import json
import os
from datetime import datetime

# Path to your Digital Twin data
GEOJSON_PATH = "../client/public/solapur_wards.json"

def fetch_nasa_metrics(lat, lon):
    """
    Fetches real-time environmental data from NASA Power API.
    In a full production build, you would also use ECOSTRESS and GPM specific APIs.
    """
    # NASA Power API is a great starting point for live environmental data
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG&longitude={lon}&latitude={lat}&start=20260201&end=20260204&format=JSON"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Extracting the latest values
        latest_date = list(data['properties']['parameter']['T2M'].keys())[-1]
        temp = data['properties']['parameter']['T2M'][latest_date]
        precip = data['properties']['parameter']['PRECTOTCORR'][latest_date]
        humidity = data['properties']['parameter']['RH2M'][latest_date]
        
        return {
            "temp": temp,
            "precip": precip,
            "humidity": humidity
        }
    except Exception as e:
        print(f"Error fetching NASA data: {e}")
        return None

def update_digital_twin():
    # Solapur Coordinates
    lat, lon = 17.6599, 75.9064
    metrics = fetch_nasa_metrics(lat, lon)
    
    if not metrics:
        return

    with open(GEOJSON_PATH, 'r') as f:
        geojson = json.load(f)

    for feature in geojson['features']:
        props = feature['properties']
        
        # Injecting REAL NASA Values
        props['temp_c'] = metrics['temp']
        props['rainfall_mm'] = metrics['precip']
        props['humidity_pct'] = metrics['humidity']
        
        # Calculate Real HRI
        hri = (metrics['precip'] * 0.4) + (metrics['humidity'] * 0.3) + (metrics['temp'] * 0.3)
        props['hri_score'] = round(hri, 2)
        props['risk'] = "High" if hri > 66 else "Medium" if hri > 33 else "Low"

    with open(GEOJSON_PATH, 'w') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Digital Twin Updated: Temp: {metrics['temp']}C, Rain: {metrics['precip']}mm")

if __name__ == "__main__":
    update_digital_twin()