FROM python:3.10-slim

WORKDIR /app
COPY requirements-cloud.txt .

RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    libssl-dev \
    sqlcipher \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements-cloud.txt

COPY . .

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "7860"]
