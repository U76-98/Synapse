from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Import or define DummyModel for loading the model
class DummyModel:
    def __init__(self, value=0):
        self.value = value
    def fit(self, X, y=None):
        return self
    def predict(self, X):
        # return a simple deterministic prediction (0) for any input
        return [int(self.value) for _ in range(len(X))]

app = Flask(__name__)

# Load trained model
model = joblib.load("employee_productivity_model.pkl")

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Employee Productivity Prediction API is running successfully.",
        "how_to_use": "Send a POST request to /predict with employee metrics as JSON."
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        df = pd.DataFrame([data])
        prediction = model.predict(df)[0]
        return jsonify({"predicted_productivity": int(prediction)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    print("🚀 Flask API starting...")
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
