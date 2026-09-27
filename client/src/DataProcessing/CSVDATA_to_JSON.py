import pandas as pd
import json
from datetime import datetime
import numpy as np

def calculate_aqi_from_pm25(pm25_value):
    """
    Calculate AQI based on PM2.5 concentration using US EPA standards
    """
    if pm25_value <= 12.0:
        return int((50 / 12.0) * pm25_value)
    elif pm25_value <= 35.4:
        return int(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25_value - 12.1))
    elif pm25_value <= 55.4:
        return int(100 + ((150 - 100) / (55.4 - 35.5)) * (pm25_value - 35.5))
    elif pm25_value <= 150.4:
        return int(150 + ((200 - 150) / (150.4 - 55.5)) * (pm25_value - 55.5))
    elif pm25_value <= 250.4:
        return int(200 + ((300 - 200) / (250.4 - 150.5)) * (pm25_value - 150.5))
    else:
        return min(500, int(300 + ((500 - 300) / (500.4 - 250.5)) * (pm25_value - 250.5)))

def get_air_quality_level(aqi):
    """
    Get air quality level description based on AQI
    """
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def process_air_quality_data(csv_file_path):
    """
    Process the air quality CSV data and return formatted data for frontend
    """
    # Read the CSV file
    df = pd.read_csv(csv_file_path)
    
    # Convert datetime columns
    df['datetimeUtc'] = pd.to_datetime(df['datetimeUtc'])
    df['datetimeLocal'] = pd.to_datetime(df['datetimeLocal'])
    
    # Get the latest data for each parameter
    latest_data = {}
    
    # Process PM2.5 data
    pm25_data = df[df['parameter'] == 'pm25'].sort_values('datetimeUtc')
    if not pm25_data.empty:
        latest_pm25 = pm25_data.iloc[-1]
        pm25_value = latest_pm25['value']
        aqi = calculate_aqi_from_pm25(pm25_value)
        
        latest_data['pm25'] = {
            'value': round(pm25_value, 2),
            'unit': 'µg/m³',
            'timestamp': latest_pm25['datetimeLocal'],
            'aqi': aqi,
            'level': get_air_quality_level(aqi)
        }
    
    # Process PM1 data
    pm1_data = df[df['parameter'] == 'pm1'].sort_values('datetimeUtc')
    if not pm1_data.empty:
        latest_pm1 = pm1_data.iloc[-1]
        latest_data['pm1'] = {
            'value': round(latest_pm1['value'], 2),
            'unit': 'µg/m³',
            'timestamp': latest_pm1['datetimeLocal']
        }
    
    # Process temperature data
    temp_data = df[df['parameter'] == 'temperature'].sort_values('datetimeUtc')
    if not temp_data.empty:
        latest_temp = temp_data.iloc[-1]
        latest_data['temperature'] = {
            'value': round(latest_temp['value'], 1),
            'unit': '°C',
            'timestamp': latest_temp['datetimeLocal']
        }
    
    # Process humidity data
    humidity_data = df[df['parameter'] == 'relativehumidity'].sort_values('datetimeUtc')
    if not humidity_data.empty:
        latest_humidity = humidity_data.iloc[-1]
        latest_data['humidity'] = {
            'value': round(latest_humidity['value'], 1),
            'unit': '%',
            'timestamp': latest_humidity['datetimeLocal']
        }
    
    # Process particle count data
    particle_data = df[df['parameter'] == 'um003'].sort_values('datetimeUtc')
    if not particle_data.empty:
        latest_particles = particle_data.iloc[-1]
        latest_data['particles'] = {
            'value': round(latest_particles['value'], 0),
            'unit': 'particles/cm³',
            'timestamp': latest_particles['datetimeLocal']
        }
    
    # Get location info
    if not df.empty:
        location_info = {
            'name': df.iloc[0]['location_name'],
            'latitude': df.iloc[0]['latitude'],
            'longitude': df.iloc[0]['longitude'],
            'provider': df.iloc[0]['provider']
        }
    else:
        location_info = {}
    
    # Calculate hourly averages for the last 24 hours
    recent_data = df[df['datetimeUtc'] >= df['datetimeUtc'].max() - pd.Timedelta(hours=24)]
    
    hourly_trends = {}
    for param in ['pm25', 'pm1', 'temperature', 'relativehumidity']:
        param_data = recent_data[recent_data['parameter'] == param]
        if not param_data.empty:
            # Group by hour and calculate mean
            param_data['hour'] = param_data['datetimeLocal'].dt.floor('H')
            hourly_avg = param_data.groupby('hour')['value'].mean().reset_index()
            hourly_avg['hour'] = hourly_avg['hour'].dt.strftime('%Y-%m-%d %H:00:00')
            
            hourly_trends[param] = hourly_avg.to_dict('records')
    
    return {
        'current': latest_data,
        'location': location_info,
        'trends': hourly_trends,
        'last_updated': datetime.now().isoformat()
    }

def generate_frontend_data():
    """
    Generate the data structure that matches your frontend expectations
    """
    # Process the CSV data (assuming the CSV file is named 'air_quality_data.csv')
    processed_data = process_air_quality_data(r'.\client\public\openaq_location_3194367_measurments.csv')
    
    # Format data to match the frontend structure
    frontend_data = {
        'temperature': {
            'current': {
                'value': processed_data['current'].get('temperature', {}).get('value', 28.4),
                'unit': '°C',
                'timestamp': processed_data['current'].get('temperature', {}).get('timestamp', datetime.now().isoformat())
            }
        },
        'vegetation': {
            'ndvi': {
                'current': 0.45  # This would need to come from satellite data
            }
        },
        'precipitation': {
            'current': {
                'value': 2.3,  # This would need to come from weather data
                'unit': 'mm/day'
            }
        },
        'airQuality': {
            'current': {
                'aqi': processed_data['current'].get('pm25', {}).get('aqi', 85),
                'level': processed_data['current'].get('pm25', {}).get('level', 'Moderate'),
                'pm25': processed_data['current'].get('pm25', {}).get('value', 35.0),
                'pm1': processed_data['current'].get('pm1', {}).get('value', 25.0),
                'particles': processed_data['current'].get('particles', {}).get('value', 5000),
                'humidity': processed_data['current'].get('humidity', {}).get('value', 75.0),
                'timestamp': processed_data['last_updated']
            },
            'trends': processed_data.get('trends', {}),
            'location': processed_data.get('location', {})
        }
    }
    
    return frontend_data

# Example usage
if __name__ == "__main__":
    try:
        data = generate_frontend_data()
        
        # Pretty print the JSON data
        print("Generated Frontend Data:")
        print(json.dumps(data, indent=2, default=str))
        
        # Save to JSON file for frontend consumption
        with open('air_quality_frontend_data.json', 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        print("\nData saved to 'air_quality_frontend_data.json'")
        
    except FileNotFoundError:
        print("Error: CSV file not found. Please make sure 'air_quality_data.csv' exists in the current directory.")
    except Exception as e:
        print(f"Error processing data: {e}")