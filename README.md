# DePuzzle

DePuzzle is a simple word game that challenges players to reconstruct a sentence given its English translation. This game is a great way to improve vocabulary and understanding of sentence structure.

At the moment, the site is hosted at [this link](http://depuzzle-env.eba-iqm3yci3.eu-central-1.elasticbeanstalk.com/).


# Install Locally 

The project can be run locally in two ways. 

1. To run the project via `virtualenv`, perform the following steps:
```
 pip install virtualenv
 virtualenv env 
 source env/bin/activate

 pip install --no-cache-dir -r requirements.txt

 export OPENAI_API_KEY=<your OpenAI API KEY>
 export DEEPL_API_KEY=<your Deepl API KEY>

 flask run -p 8080

 In browser, open: http://127.0.0.1:8080/
```

2. Alternatively, the project can be run inside of a Docker container. To avoid exposing my API keys, only Dockerfile is provided. 
```
 <edit Dockerfile to add your API keys>
 make build
 make run
```
