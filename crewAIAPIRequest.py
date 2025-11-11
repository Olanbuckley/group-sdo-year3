import requests
import json
import time
import os

AUTOMATION_URL = "https://dementia-research-monitor-for-doctors-v1-fe-1ef45373.crewai.com/kickoff"


BEARER_TOKEN = "Bearer 451b085095f2"

def _get_status_url(base_url: str, kickoff_id: str) -> str:

    try:
        parts = base_url.split('/')
        if parts[-1]:
            parts[-1] = 'status'
        else:
            parts[-2] = 'status'
        
        status_base = '/'.join(parts)
        return f"{status_base}/{kickoff_id}"
    except Exception:
        # Fallback to appending status to the base URL
        return f"{base_url}/status/{kickoff_id}"


def run_crew_automation():
    
    headers = {
        "Authorization": BEARER_TOKEN,
        "Content-Type": "application/json"
    }

    payload = {}

    print(f"Attempting to trigger automation at: {AUTOMATION_URL}...")
    
    response = None
    try:
        # 2. Make the API request to trigger the automation (usually POST)
        response = requests.post(AUTOMATION_URL, headers=headers, json=payload)
        response.raise_for_status()

        # 3. Process the response (could be sync result or async kickoff_id)
        result = response.json()

        print("\n--- Automation Trigger Response ---")
        print(f"Status Code: {response.status_code}")
        
        # Check for asynchronous response pattern
        if result and isinstance(result, dict) and 'kickoff_id' in result:
            kickoff_id = result['kickoff_id']
            print(f"Automation started successfully. Kickoff ID: {kickoff_id}")
            

    except requests.exceptions.RequestException as e:
        print(f"\n--- API Request Failed ---")
        if response is not None:
             print(f"HTTP Status Code: {response.status_code}")
             print(f"Response Body: {response.text}")
        print(f"Error Details: {e}")
    
    return kickoff_id

if __name__ == "__main__":
    # Ensure you have the 'requests' library installed: pip install requests
    run_crew_automation()