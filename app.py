import os
import json
import openai
import requests
import numpy as np
from flask import Flask, request, render_template

app = Flask(__name__)

# Reads openai API key from the environment
if os.environ.get('OPENAI_API_KEY'):
    openai.api_key = os.environ.get('OPENAI_API_KEY')
else: 
    raise RuntimeError("No API KEY for OpenAI.")

# Read Deepl API key from the environment
if os.environ.get('DEEPL_API_KEY'):
    DEEPL_API_KEY = os.environ.get('DEEPL_API_KEY')
else: 
    raise RuntimeError("No API KEY for Deepl.")

# ----------------------------------------------------------------


def generatePrompts(sentiment, hardcore, n=1): 
    if sentiment == "lov" and hardcore: 
        prompt=f"Write a long lovely story",
    elif sentiment == "sma" and hardcore: 
        prompt=f"Write a scientific story using sophisticated language",
    elif sentiment == "nor" and hardcore: 
        prompt=f"Write a story using sophisticated language",
    elif sentiment == "ann" and hardcore: 
        prompt=f"Write a long complaining story",
    elif sentiment == "ang" and hardcore: 
        prompt=f"Write a long angry story",
    elif sentiment == "lov" and not hardcore: 
        prompt=f"Write a lovely sentence",
    elif sentiment == "sma" and not hardcore: 
        prompt=f"Write a long scientific sentence using sophisticated language",
    elif sentiment == "nor" and not hardcore: 
        prompt=f"Write a long sentence using sophisticated language",
    elif sentiment == "ann" and not hardcore: 
        prompt=f"Write a complaining sentence",
    elif sentiment == "ang" and not hardcore: 
        prompt=f"Write an angry sentence",
    else: 
        return "Something went wrong"

    # Use the `Completion` method to generate text using GPT-3
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=1024,
        n=n,
        stop=None
    )
    return [response["choices"][i]["text"].replace('\n', ' ').replace('\'','').replace('  ', ' ') for i in range(n)]


def translate(text, lang): 

    # Set the API endpoint URL
    endpoint = "https://api-free.deepl.com/v2/translate"

    # Set the source and target languages
    src_lang = "en"

    if lang == "de":
        tgt_lang = "de"
    elif lang == "ru":
        tgt_lang = "ru"
    elif lang == "fr":
        tgt_lang = "fr"
    elif lang == "es":
        tgt_lang = "es"
    elif lang == "it":
        tgt_lang = "it"
    else: 
        () # TODO 

    # Set the request parameters
    params = {
        "auth_key": DEEPL_API_KEY,
        "source_lang": src_lang,
        "target_lang": tgt_lang,
        "text": text
    }

    # Send the request and get the response
    response = requests.get(endpoint, params=params)

    # Print the response
    return response.json()['translations'][0]['text']


@app.route('/load', methods=['POST'])
def load():
    print('> load')
    req = request.get_json()

    sen = generatePrompts(req["sentiment"], req["hardcore"], n=1)[0]
    tra = translate(sen, req["lang"])
    
    return json.dumps({ 
            "sen" : sen,
            "tra" : tra,
            "tra_tokens" : list(np.random.permutation(tra.split(' ')))
        }, indent=4)

# TODO
@app.route('/')
def index():
    return render_template('index.html')

# TODO 
if __name__ == '__main__':
    app.run(debug=False, port=8080)
