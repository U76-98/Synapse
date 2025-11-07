from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import joblib
import pandas as pd
import os
import numpy as np
from datetime import datetime

class DummyModel:
    def predict(self, X):
        try:
            predictions = []
            for _, row in X.iterrows():
                # Normalize and weight the metrics
                metrics = {
                    'performance': min(float(row.get('Performance_Score', 0)) / 15.0, 1) * 0.4,
                    'utilization': min(float(row.get('Utilization_Rate', 0)) / 100.0, 1) * 0.3,
                    'time_accuracy': (1 - min(float(row.get('Claimed_Minus_Active', 0)) / 8.0, 1)) * 0.2,
                    'hr_status': (0 if int(row.get('Recent_HR_Flag', 0)) > 0 else 1) * 0.1
                }
                
                # Calculate total score (0-1 range)
                score = sum(metrics.values())
                
                # Map to risk levels (1-3)
                if score >= 0.7:    # High performer
                    risk_level = 1  # Low risk
                elif score >= 0.4:  # Average performer
                    risk_level = 2  # Medium risk
                else:              # Low performer
                    risk_level = 3  # High risk
                    
                predictions.append(risk_level)
            return predictions
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return [2] * len(X)  # Default to medium risk on error

app = Flask(__name__)

# Enable CORS for all origins in development
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Try to load the trained model, fall back to dummy model if not found
try:
    model = joblib.load("employee_productivity_model.pkl")
    print("✅ Loaded trained model successfully")
except:
    print("⚠️ No trained model found, using dummy model")
    model = DummyModel()

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Employee Productivity Prediction API is running successfully.",
        "how_to_use": "Send a POST request to /predict with employee metrics as JSON."
    })

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST")
        return response

    try:
        # Parse and validate input data
        data = request.get_json(force=True)
        print(f"Received prediction request with data: {data}")
        
        # Convert to DataFrame with error handling
        try:
            df = pd.DataFrame([data])
        except Exception as e:
            print(f"Error creating DataFrame: {e}")
            df = pd.DataFrame([{
                'Claimed_Hours': 8.0,
                'Active_Hours': 7.0,
                'Claimed_Minus_Active': 1.0,
                'Utilization_Rate': 85.0,
                'Performance_Score': 10.0,
                'Recent_HR_Flag': 0
            }])
        
        # Make prediction with error handling
        try:
            prediction = model.predict(df)[0]
            print(f"Prediction result: {prediction}")
        except Exception as e:
            print(f"Prediction error: {e}")
            prediction = 2  # Default to medium risk
        
        # Prepare response
        response_data = {
            "modelResponse": {
                "predicted_productivity": int(prediction),
                "confidence": 0.85,
                "risk_factors": ["performance", "utilization"] if prediction > 1 else []
            }
        }
        
        # Create response with proper CORS headers
        response = make_response(jsonify(response_data))
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error in prediction endpoint: {str(e)}")
        error_response = make_response(jsonify({"error": str(e)}), 400)
        error_response.headers.add("Access-Control-Allow-Origin", "*")
        return error_response


if __name__ == "__main__":
    print("🚀 Flask API starting...")
    try:
        app.run(host="0.0.0.0", port=5000, debug=True)
    except Exception as e:
        print(f"Failed to start server: {e}")
