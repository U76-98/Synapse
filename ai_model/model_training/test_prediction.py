import requests
import json
import sys

# Configure console output encoding
sys.stdout.reconfigure(encoding='utf-8')

# Test data matching the expected format
test_data = {
    "Claimed_Hours": 8.0,
    "Active_Hours": 7.5,
    "Claimed_Minus_Active": 0.5,
    "Utilization_Rate": 92.0,
    "Commits": 5,
    "PRs_Opened": 2,
    "Tasks_Done": 6,
    "Performance_Score": 12.0,
    "Meetings_Hours": 1.5,
    "Recent_HR_Flag": 0,
    "Project_Type": 0,
    "Role_Level": 1,
    "Team_ID": 2
}

def print_section(title):
    print(f"\n{'='*50}")
    print(f" {title}")
    print(f"{'='*50}")

def test_prediction():
    try:
        # Test direct AI model
        print_section("Testing AI Model (Port 5000)")
        ai_response = requests.post(
            "http://localhost:5000/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"Status Code: {ai_response.status_code}")
        print("Response:")
        print(json.dumps(ai_response.json(), indent=2))
        
        # Test backend API
        print_section("Testing Backend API (Port 3001)")
        backend_response = requests.post(
            "http://localhost:3001/api/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"Status Code: {backend_response.status_code}")
        print("Response:")
        print(json.dumps(backend_response.json(), indent=2))
        
        print_section("Test Completed Successfully")
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting Tips:")
        print("1. Make sure the AI model is running: python app.py in ai_model/model_training")
        print("2. Make sure the backend is running: npm run dev in backend/")
        print("3. Check that the ports (5000 for AI, 3001 for backend) are not in use")
        print("4. Check if any firewall is blocking the connections")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(test_prediction())
