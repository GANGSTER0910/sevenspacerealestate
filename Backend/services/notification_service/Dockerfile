FROM python:3.12.7
WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
COPY app/schema.py .
RUN pip install --no-cache-dir -r requirements.txt

# Add a test to check network connectivity to the api_gateway
# RUN ping -c 3 api_gateway

COPY . .

EXPOSE 8004
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"] 