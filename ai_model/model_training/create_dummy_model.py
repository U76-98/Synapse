# Creates employee_productivity_model.pkl using joblib if available, otherwise pickle
import os
import pickle

MODEL_PATH = "employee_productivity_model.pkl"

class DummyModel:
    def __init__(self, value=0):
        self.value = value
    def fit(self, X, y=None):
        return self
    def predict(self, X):
        # return a simple deterministic prediction (0) for any input
        return [int(self.value) for _ in range(len(X))]

model = DummyModel(0)

# Try joblib.dump if joblib is available
try:
    import joblib
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH} via joblib")
except Exception:
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved model to {MODEL_PATH} via pickle")
