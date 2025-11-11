from openai import OpenAI
import os
import sys

# Ensure your API key is set as an environment variable (OPENAI_API_KEY)
client = OpenAI()

# --- REPLACE THIS WITH YOUR FINE-TUNED MODEL ID ---
FINE_TUNED_MODEL_ID = "ft:gpt-4.1-nano-2025-04-14:olan::CaKaYeci"

# Use the fine-tuned model in a Chat Completion request
response = client.chat.completions.create(
    model=FINE_TUNED_MODEL_ID,
    messages=[
        {"role": "system", "content": "You are scorer for speach, you will evaulate the provided transcript and return a score between 1-30"}, 
        {"role": "user", "content": sys.argv[1]}
    ]
)

print(response.choices[0].message.content)