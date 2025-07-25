# Sevenspace Real Estate

[Live Website](https://sevenspacerealestate.vercel.app)

Sevenspace Real Estate is a modern, full-stack real estate platform built as a monorepo, featuring a microservices backend (FastAPI, Docker) and a high-performance frontend (React, Vite, TypeScript).

---

## Project Structure

```
sevenspacerealestate/
  Backend/         # FastAPI microservices (Dockerized)
  Frontend/        # React + Vite + TypeScript frontend
```

---

## Backend (FastAPI Microservices)

- **Location:** `sevenspacerealestate/Backend/`
- **Tech:** Python, FastAPI, Docker
- **Services:**
  - Auth Service
  - Property Service
  - Image Service
  - Notification Service

### Setup & Run (Development)

1. **Install Docker & Docker Compose**
2. Navigate to the backend directory:
   ```sh
   cd sevenspacerealestate/Backend/services/<service_name>
   ```
3. Build and run the desired service:
   ```sh
   docker-compose up --build
   # or, for individual Dockerfiles
   docker build -t <service_name> .
   docker run -p <port>:<port> <service_name>
   ```

---

## Frontend (React + Vite + TypeScript)

- **Location:** `sevenspacerealestate/Frontend/sevenspace/`
- **Tech:** React, Vite, TypeScript, TailwindCSS

### Setup & Run (Development)

1. Navigate to the frontend directory:
   ```sh
   cd sevenspacerealestate/Frontend/sevenspace
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

---

## Deployment

- **Frontend:** Deployed on [Vercel](https://sevenspacerealestate.vercel.app)
- **Backend:** Dockerized microservices 
---

## Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

