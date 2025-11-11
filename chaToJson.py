import sys
import json


requiredData = {
    "Participant" : "Par",
    "Age" : 0,
    "Gender" : "Text",
    "UserID" : 0,
    "Speach" : "",
    "Score" : ""
}

lineEnded = True




def readParticipant(text):
    counter = 0
    breakCounter = 0
    for char in text:
        counter +=1
        if char == "|":
            breakCounter +=1
            if breakCounter == 3:
                age = int(text[counter:counter+2])
                requiredData.update({"Age": age})
            if breakCounter == 4:
                if (text[counter:counter+1] == "m"):
                    requiredData.update({"Gender": "male"})
                else:
                    requiredData.update({"Gender": "female"})


        
def readID(text):
    counter = 0
    textLength = len(text)
    requiredData.update({"UserID": (text[8:(textLength - 8)])})


def readResponse(text):
    speachStopPoint = len(text)
    if "[+ exc] " in text:
        speachStopPoint = text.find("[+ exc] ")
        lineEnded = True
    elif "[+ gram] " in text:
        speachStopPoint = text.find("[+ gram] ")
        lineEnded = True
    elif "" in text:
        speachStopPoint = text.find("")
        lineEnded = True
    else:
        lineEnded = False
    lastData = requiredData.get("Speach")
    newData = lastData + text[6: speachStopPoint].replace("\n", "")
    
    requiredData.update({"Speach": newData})
    


def readFile():

    
    with open(sys.argv[1]) as file:
        for line in file:
            if "@ID:" in line:
                if "PAR" in line:
                    readParticipant(line)
            if "@Media" in line:
                readID(line)
            if "*PAR:" in line:
                readResponse(line)
            if not lineEnded:
                readResponse(line)


    with open(sys.argv[2]) as resultFile:
        for line in resultFile:
            if str(requiredData.get("UserID")) in line:
                lineLength = len(line)
                score = int(line[(lineLength - 3): lineLength])
                requiredData.update({"Score": str(score)})


def createUserJsonData():
    age = "Age: " + str(requiredData.get("Age"))
    gender = " | Gender: " + requiredData.get("Gender")
    transcript = " | Transcript: " + requiredData.get("Speach") + " ->"
    jsonText =  age + gender + transcript
    return jsonText

def createJson():


    systemData = {
        "role": "system",
        "content": "You are scorer for speach, you will evaulate the provided transcript and return a score between 1-30"
    }
    userData = {
        "role": "user",
        "content": createUserJsonData(),
    }

    assistantData = {
        "role": "assistant",
        "content": requiredData.get("Score")
    }

    
    message = {
        "messages": [systemData, userData, assistantData]
    }
    

    theJson = json.dumps(message)
    print(theJson)


def createEval():

    transcriptText = {
        "transcript_text": createUserJsonData()
    }

    correctScore = {
        "correct_score": requiredData.get("Score")
    }

    evalItem = {
        "item": [transcriptText, correctScore]
    }
    theJson = json.dumps(evalItem)
    print(theJson)

        
                            
                            
                            
                        
argumentNumber = len(sys.argv)
if argumentNumber == 3:
    readFile()
elif argumentNumber == 1:
    print("Too few files")
else:
    print("Too many files")

createJson()    

     
                    
    

2