import requests
import json
import time
import os
import sys 

AUTOMATION_URL = "https://dementia-research-monitor-for-doctors-v1-fe-1ef45373.crewai.com"


BEARER_TOKEN = "Bearer 451b085095f2"

def getStatus():

    kickoffID = sys.argv[1]
    theUrl = f"{AUTOMATION_URL}/status/{kickoffID}"

    headers = {
        "Authorization": BEARER_TOKEN,
        "Content-Type": "application/json"
    }

    payload = {}
    
    try:
        # 2. Make the API request to trigger the automation (usually POST)
        print(theUrl)
        response = requests.get(theUrl, headers=headers, json=payload)
        response.raise_for_status()

        # 3. Process the response (could be sync result or async kickoff_id)
        result = response.json()
        print(result)
    except Exception:
        print(Exception)

getStatus()