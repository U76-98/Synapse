import pandas as pd
import os
import pickle

CSV_PATH = "final_workforce_3month_enhanced.csv"
MODEL_PATH = "employee_productivity_model.pkl"

try:
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import classification_report, accuracy_score
    import joblib
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

if __name__ == "__main__":
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)

    if SKLEARN_AVAILABLE:
        # Encode categorical columns
        label_encoders = {}
        for col in df.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            label_encoders[col] = le
        print("Categorical columns encoded successfully!")

        # Split data
        X = df.drop("Productivity_Level", axis=1)
        y = df["Productivity_Level"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        print("Accuracy:", accuracy_score(y_test, y_pred))
        print(classification_report(y_test, y_pred))

        # Save model
        joblib.dump(model, MODEL_PATH)
        print("Model trained successfully!")
    else:
        # Create a simple dummy model that replicates sklearn's interface
        class DummyModel:
            def __init__(self):
                self.median = None
            def fit(self, X, y):
                try:
                    self.median = int(y.mode()[0])
                except Exception:
                    self.median = 0
            def predict(self, X):
                return [self.median for _ in range(len(X))]

        y = df['Productivity_Level'] if 'Productivity_Level' in df.columns else pd.Series([0]*len(df))
        model = DummyModel()
        model.fit(df.drop('Productivity_Level', axis=1, errors='ignore'), y)

        # Save with pickle
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model, f)
        print("Dummy model created and saved to employee_productivity_model.pkl")
