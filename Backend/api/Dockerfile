FROM python:3.12.7
WORKDIR /

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY common/ ./common/
COPY . .

EXPOSE 8003
CMD ["uvicorn", "gateway:app", "--host", "0.0.0.0", "--port", "8000"] 