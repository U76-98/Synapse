# AI Model Module (Synapse)

This module handles machine learning operations for predicting employee productivity.

## Structure
- **train_model.ipynb** – trains the RandomForest model
- **app.py** – Flask API for prediction
- **test_api.py** – Local test for API
- **employee_productivity_model.pkl** – Saved model
- **final_workforce_3month_enhanced.csv** – Training dataset

## Steps to Run

1. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

Train model:

```powershell
python train_model.py
```

Start Flask API:

```powershell
python app.py
```

Test API:

```powershell
python test_api.py
```

---

## final_workforce_3month_enhanced.csv

Dataset of ~4,500 rows, 16 columns (synthetic employee metrics):

Employee_ID, Date, Claimed_Hours, Active_Hours, Claimed_Minus_Active, Utilization_Rate, Commits, PRs_Opened, Tasks_Done, Performance_Score, Meetings_Hours, Recent_HR_Flag, Project_Type, Role_Level, Team_ID, Productivity_Level

Each record is a 3-month sample of employee data.

---

## Extras provided by Copilot

- `app_enhanced.py` — same API with input validation, error handling, logging predictions to `predictions_log.csv`, and a `/retrain` endpoint to retrain using `train_model.py`.
- `train_model.py` — script to train a RandomForest (falls back to a dummy model if scikit-learn is not installed).
