import sys
import subprocess
import glob
import json

scriptName = "chaToJson.py"
fileExtention = "*.cha"
metaData = sys.argv[1]
aggregatedData = "aggregatedData.jsonl"

def readFiles():

    chaFiles = glob.glob(fileExtention)

    if not chaFiles:
        print("no " + fileExtention + " files found")
        return
    pythonExecutable = sys.executable

    allResults = []


    for i, file_path in enumerate(chaFiles):
        command = [pythonExecutable, scriptName, file_path, metaData]
        print(file_path)

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False
            )

            if result.stdout:
                allResults.append(json.loads(result.stdout))
                print(result.stdout)
            if result.stderr:
                print(result.stderr)
        except FileNotFoundError:
            print(f"Error: Could not find Python interpreter or the script '{scriptName}'.", file=sys.stderr)
            break
        except Exception as e:
            print(f"An unexpected error occurred for {file_path}: {e}", file=sys.stderr)

        with open(aggregatedData, "w") as jsonFile:
            for entry in allResults:
                jsonLine = json.dumps(entry)
                jsonFile.write(jsonLine + "\n")

readFiles()