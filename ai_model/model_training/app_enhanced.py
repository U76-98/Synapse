from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
import threading
import subprocess
import time

MODEL_FILE = "employee_productivity_model.pkl"
LOG_FILE = "predictions_log.csv"

app = Flask(__name__)

# Load trained model with fallback
def load_model():
    if os.path.exists(MODEL_FILE):
        try:
            return joblib.load(MODEL_FILE)
        except Exception:
            import pickle
            with open(MODEL_FILE, "rb") as f:
                return pickle.load(f)
    raise FileNotFoundError(f"Model file {MODEL_FILE} not found")

model = None
try:
    model = load_model()
except Exception:
    model = None

# Simple validation schema (expected numeric columns)
EXPECTED_FIELDS = [
    "Claimed_Hours","Active_Hours","Claimed_Minus_Active","Utilization_Rate",
    "Commits","PRs_Opened","Tasks_Done","Performance_Score","Meetings_Hours",
    "Recent_HR_Flag","Project_Type","Role_Level","Team_ID"
]

@app.route("/predict", methods=["POST"])
def predict():
    global model
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    try:
        data = request.get_json(force=True)
        # validation
        missing = [f for f in EXPECTED_FIELDS if f not in data]
        if missing:
            return jsonify({"error": "Missing fields", "missing": missing}), 400
        df = pd.DataFrame([data])
        pred = model.predict(df)[0]
        # log
        try:
            row = df.copy()
            row["predicted_productivity"] = int(pred)
            if not os.path.exists(LOG_FILE):
                row.to_csv(LOG_FILE, index=False)
            else:
                row.to_csv(LOG_FILE, mode='a', header=False, index=False)
        except Exception:
            pass
        return jsonify({"predicted_productivity": int(pred)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/retrain", methods=["POST"])
def retrain():
    """Trigger retraining using train_model.py in a background thread."""
    def _retrain():
        try:
            subprocess.run(["python", "train_model.py"], check=True)
            # reload model
            time.sleep(1)
            nonlocal_model = None
            try:
                nonlocal_model = load_model()
            except Exception:
                nonlocal_model = None
            globals()['model'] = nonlocal_model
        except Exception:
            pass

    thread = threading.Thread(target=_retrain, daemon=True)
    thread.start()
    return jsonify({"status": "retraining_started"})

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Employee Productivity Prediction API (enhanced) is running successfully.",
        "how_to_use": "POST /predict with JSON payload. POST /retrain to retrain (background)."
    })

if __name__ == "__main__":
    print("🚀 Enhanced Flask API starting...")
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
