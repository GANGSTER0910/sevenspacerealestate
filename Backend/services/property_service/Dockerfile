FROM python:3.12.7
WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
COPY app/schema.py .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8003
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"] 