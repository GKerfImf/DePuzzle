# syntax=docker/dockerfile:1

FROM python:3.7

WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

ENV OPENAI_API_KEY <Your OpenAI API KEY>
ENV DEEPL_API_KEY <Your Deepl API KEY>

COPY . .
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000"]