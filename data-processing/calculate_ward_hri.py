import sys
import json

def calculate_hri(rainfall, humidity, temp, sanitation_stress):
    """
    Aheadly Decision Intelligence Layer
    Inferences drawn from NASA Earthdata (GPM, MODIS, ECOSTRESS)
    """
    
    # 1. Rainfall Inference (NASA GPM): High rainfall leads to water stagnation 
    rainfall_weight = rainfall * 0.4 
    
    # 2. Humidity Inference (NASA MODIS): High humidity increases vector-borne risk 
    humidity_weight = humidity * 0.3
    
    # 3. Temperature Inference (NASA ECOSTRESS): Surface heat contributes to heat stress
    temp_weight = (temp / 50) * 0.1  # Normalized
    
    # 4. Sanitation Stress: Municipal/Simulated data on waste and waterfields
    sanitation_weight = sanitation_stress * 0.2

    # Final Composite Health Risk Index (HRI) [cite: 21, 147]
    hri_score = rainfall_weight + humidity_weight + temp_weight + sanitation_weight
    
    # Categorization based on SIH 2026 specs [cite: 22, 137]
    if hri_score > 66:
        category, risk_level, color = "High Risk", "HIGH", "#ef4444"
        action = "Immediate deployment of mobile clinics and health workers [cite: 72, 73]"
    elif hri_score > 33:
        category, risk_level, color = "Medium Risk", "MEDIUM", "#f59e0b"
        action = "Increase sanitation frequency and preventive advisories [cite: 38, 81]"
    else:
        category, risk_level, color = "Low Risk", "LOW", "#22c55e"
        action = "Routine surveillance and citizen engagement [cite: 79]"

    return {
        "score": round(hri_score, 2),
        "category": category,
        "risk": risk_level,
        "color": color,
        "action": action,
        "inferences": {
            "rainfall": "Increased risk of water-borne disease due to stagnation [cite: 264]",
            "humidity": "Favorable conditions for vector breeding detected [cite: 264]",
            "thermal": "Thermal stress may exacerbate underlying health conditions"
        }
    }

if __name__ == "__main__":
    # Simulated input data for Solapur Ward
    # In production, these variables are passed from the Express server via NASA APIs
    print(json.dumps(calculate_hri(rainfall=85, humidity=75, temp=38, sanitation_stress=60)))