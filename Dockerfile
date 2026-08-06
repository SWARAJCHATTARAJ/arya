FROM python:3.10-slim

WORKDIR /app
COPY requirements-cloud.txt .

RUN pip install --no-cache-dir -r requirements-cloud.txt

COPY . .

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "7860"]
