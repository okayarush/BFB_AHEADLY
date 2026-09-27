import json
import requests
import os

# PATH TO YOUR FRONTEND DATA
GEOJSON_PATH = "../client/public/solapur_wards.json"

def fetch_nasa_data(lat, lon):
    """Fetches real environmental data for Solapur coordinates."""
    # NASA Power API provides live precipitation, temp, and humidity
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG&longitude={lon}&latitude={lat}&start=20260201&end=20260204&format=JSON"
    res = requests.get(url).json()
    latest_date = list(res['properties']['parameter']['T2M'].keys())[-1]
    
    return {
        "temp": res['properties']['parameter']['T2M'][latest_date],
        "precip": res['properties']['parameter']['PRECTOTCORR'][latest_date],
        "humidity": res['properties']['parameter']['RH2M'][latest_date]
    }

def update_twin_file():
    # Solapur coordinates
    metrics = fetch_nasa_data(17.6599, 75.9064)
    
    with open(GEOJSON_PATH, 'r') as f:
        data = json.load(f)

    for feature in data['features']:
        p = feature['properties']
        # MAPPING EXACT KEYS TO PREVENT 'UNDEFINED'
        p['temp_c'] = metrics['temp']
        p['rainfall_mm'] = metrics['precip']
        p['humidity_pct'] = metrics['humidity']
        
        # Aheadly HRI Logic: Rain(40%) + Humidity(30%) + Temp(30%)
        hri = (p['rainfall_mm'] * 0.4) + (p['humidity_pct'] * 0.3) + (p['temp_c'] * 0.3)
        p['hri_score'] = round(hri, 2)
        p['risk'] = "High" if hri > 65 else "Low"

    with open(GEOJSON_PATH, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Data Synced: {metrics['temp']}C | {metrics['precip']}mm | {metrics['humidity']}%")

if __name__ == "__main__":
    update_twin_file()