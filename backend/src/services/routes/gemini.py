from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

def __getLocation__():
    pass



def getResponse(prompt):
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    prompt = "\n Please keep it under 200 words \n" + prompt

    if prompt:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        ).text
    else:
        response = "Bum"

    return response

if __name__ == "__main__": 
    resp = getResponse("hello")

    print(resp)