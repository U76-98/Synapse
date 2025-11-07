import requests

url = "http://127.0.0.1:5000/predict"

data = {
    "Claimed_Hours": 8.1,
    "Active_Hours": 7.5,
    "Claimed_Minus_Active": 0.6,
    "Utilization_Rate": 92.8,
    "Commits": 4,
    "PRs_Opened": 2,
    "Tasks_Done": 5,
    "Performance_Score": 11.3,
    "Meetings_Hours": 2.0,
    "Recent_HR_Flag": 0,
    "Project_Type": 0,
    "Role_Level": 0,
    "Team_ID": 1
}

response = requests.post(url, json=data)
print("Response:", response.json())
