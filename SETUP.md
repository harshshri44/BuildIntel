# BuildIntel — Cross-Device Setup & Installation Guide

This guide provides exact, step-by-step instructions to set up, configure, and run **BuildIntel** (MahaRERA Real-Estate Intelligence Platform) on a fresh computer (Windows, macOS, or Linux).

---

## ⚡ Quick Start: Choose Your Setup Method

| Method | Best For | Setup Time | Required Tools |
| :--- | :--- | :--- | :--- |
| **[Method 1: Docker Compose](#method-1-docker-compose-setup-recommended)** *(Recommended)* | Quick evaluation, zero dependency conflicts, complete stack containerization | ~3–5 mins | Docker Desktop |
| **[Method 2: Manual Native Setup](#method-2-manual-native-installation)** | Local code editing, debugging, step-by-step inspection | ~10 mins | Java 21+, Python 3.10+, Node 18+, PostgreSQL |

---

## Method 1: Docker Compose Setup (Recommended)

Docker packages PostgreSQL, the Spring Boot REST API, the Python runtime, and the Angular Nginx frontend into unified containers.

### Prerequisites
- Install **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS) or **Docker Engine + Docker Compose** (Linux).
- Ensure Docker Desktop is launched and running.

### Step 1: Clone the Repository
```bash
git clone https://github.com/harshshri44/BuildIntel.git
cd BuildIntel
```

### Step 2: Initialize Environment Variables
Copy the pre-configured example environment file:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux (bash/zsh)
cp .env.example .env
```
*(The default values in `.env.example` work out-of-the-box for Docker without changes).*

### Step 3: Build & Start All Services
```bash
docker compose up --build
```
> **What this does:**
> 1. Starts a PostgreSQL 16 container with a persistent volume and automatically runs `database/init.sql`.
> 2. Builds the Spring Boot 4 backend with an integrated Python 3 virtual environment.
> 3. Builds the Angular frontend with multi-stage compilation and serves it via Nginx Alpine.

### Step 4: Access the Application
Once the terminal displays `Started BackendApplication` and `ready for start up`:

| Service | URL | Notes |
| :--- | :--- | :--- |
| **Web Application (UI)** | **[http://localhost](http://localhost)** | Angular Frontend |
| **Backend REST API** | **[http://localhost:8080/api](http://localhost:8080/api)** | Spring Boot API |
| **Database Port** | `localhost:5432` | PostgreSQL (mapped for DBeaver/pgAdmin) |

### Stopping the Services
To stop all containers cleanly:
```bash
docker compose down
```
To stop and reset all database data:
```bash
docker compose down -v
```

---

## Method 2: Manual Native Installation

Follow this method to run the project natively without Docker on Windows, macOS, or Linux.

### System Requirements & Prerequisites

| Software | Minimum Version | Recommended | Download Link |
| :--- | :--- | :--- | :--- |
| **Java JDK** | JDK 21 | JDK 21 or 25 | [Adoptium Temurin](https://adoptium.net/) |
| **Python** | 3.10 | 3.11 or 3.12 | [Python.org Downloads](https://www.python.org/downloads/) |
| **Node.js & npm**| Node 18 LTS | Node 20 or 22 LTS | [Node.js Official](https://nodejs.org/) |
| **PostgreSQL** | 14 | 16 or 18 | [PostgreSQL Downloads](https://www.postgresql.org/download/) |
| **Git** | 2.30+ | Latest | [Git SCM](https://git-scm.com/) |

> [!IMPORTANT]
> **Windows Users**: During Python installation, ensure you check the box **"Add python.exe to PATH"**.

---

### Step 1: Set Up PostgreSQL Database

1. Ensure the PostgreSQL service is running on your machine on port `5432`.
2. Connect to PostgreSQL using `psql` or **pgAdmin**:
   ```sql
   CREATE DATABASE buildintel_db;
   ```
3. Run the schema creation script [database/init.sql](database/init.sql):
   - **Via Command Line (`psql`)**:
     ```bash
     psql -U postgres -d buildintel_db -f database/init.sql
     ```
   - **Via pgAdmin**:
     1. Open pgAdmin and connect to your server.
     2. Expand `Databases` > right-click `buildintel_db` > select **Query Tool**.
     3. Open `database/init.sql` (or paste its contents) and click **Execute (F5)**.

---

### Step 2: Configure Environment Files

1. In the repository root, create `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   Copy-Item Scrapper/.env.example Scrapper/.env

   # macOS / Linux
   cp .env.example .env
   cp Scrapper/.env.example Scrapper/.env
   ```
2. Open `.env` in a text editor. If your local PostgreSQL password is not `postgres` (or blank), update `DB_PASSWORD`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=buildintel_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_postgres_password
   ```

---

### Step 3: Set Up Python Virtual Environment

Create the virtual environment in the **repository root folder** (this allows the Spring Boot backend to automatically locate the Python binary):

#### On Windows (PowerShell):
```powershell
# Create venv
python -m venv venv

# If PowerShell restricts scripts, run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Activate venv
.\venv\Scripts\Activate.ps1

# Upgrade pip and install scraper dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### On macOS / Linux (bash/zsh):
```bash
# Create venv
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip and install scraper dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Smoke Test the Scraper (Optional):
Verify that the scraper can communicate with PostgreSQL:
```bash
# Windows
.\venv\Scripts\python.exe Scrapper\scraper.py --district Pune -p 1 --mode upsert

# macOS / Linux
./venv/bin/python Scrapper/scraper.py --district Pune -p 1 --mode upsert
```

---

### Step 4: Start the Spring Boot Backend

Open a new terminal tab or window:

```bash
cd Backend

# On Windows:
.\mvnw.cmd spring-boot:run

# On macOS / Linux:
chmod +x ./mvnw
./mvnw spring-boot:run

# Or if you have Apache Maven installed globally:
mvn spring-boot:run
```

- When startup finishes, you will see:
  ```
  INFO ... Started BackendApplication in X.XXX seconds
  ```
- **Backend API Base URL**: `http://localhost:8080/api`
- Verify backend health in your browser or curl:
  ```bash
  curl http://localhost:8080/api/projects
  ```
  *(Should return a JSON response with status 200)*.

---

### Step 5: Start the Angular Frontend

Open another new terminal tab or window:

```bash
cd Frontend

# Install node dependencies
npm install

# Start local dev server
npm start
```

- Wait until the terminal displays:
  ```
  Application bundle generation complete.
  Local: http://localhost:4200/
  ```

---

### Step 6: Open the App in Your Browser

Open your browser to:
👉 **[http://localhost:4200](http://localhost:4200)**

You can now:
1. **Explore Projects**: Browse, filter by district/pincode, and search MahaRERA projects.
2. **View Builder Intelligence**: Inspect developers and their registered project portfolios.
3. **Trigger Scraper Jobs**: Launch live scraping tasks from the Scraper Control dashboard.
4. **Export Data**: Download filtered datasets into styled Excel spreadsheets.

---

## 🧪 Running Verification Tests

To verify full system integrity on the new machine:

### 1. Spring Boot Tests (21 Unit & Integration Tests)
```bash
cd Backend
./mvnw test       # macOS/Linux
.\mvnw.cmd test   # Windows
```
*Expected: `Tests run: 21, Failures: 0, Errors: 0, Skipped: 0 - BUILD SUCCESS`*

### 2. Python Scraper Tests (12 Unit Tests)
```bash
# Activate venv first
pytest Scrapper/test_scraper.py
```
*Expected: `12 passed in 0.XXs`*

### 3. Angular Production Build
```bash
cd Frontend
npm run build
```
*Expected: `Application bundle generation complete. Output: dist/frontend`*

---

## 🛠️ Troubleshooting & FAQ

### 1. `docker: command not found`
- **Cause**: Docker Desktop is not installed or not added to your system `PATH`.
- **Solution**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it, or use **Method 2 (Manual Native Installation)**.

### 2. `SchemaManagementException: Schema-validation: missing table [builders]`
- **Cause**: Spring Boot has `spring.jpa.hibernate.ddl-auto=validate`, but the database tables were not created yet.
- **Solution**: Execute the [database/init.sql](database/init.sql) script in `buildintel_db` using `psql` or pgAdmin before starting the backend.

### 3. `CreateProcess error=2, The system cannot find the file specified` (Python not found)
- **Cause**: The virtual environment was not created in the project root, or `python` is not in the system `PATH`.
- **Solution**: Ensure your virtual environment is created directly in the root directory as `venv/`, or set the `PYTHON_EXECUTABLE` environment variable in your terminal:
  ```powershell
  $env:PYTHON_EXECUTABLE="C:\path\to\your\venv\Scripts\python.exe"
  ```

### 4. `Port 8080 or Port 5432 already in use`
- **Windows**: Check running processes on the port:
  ```powershell
  Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
  ```
- **macOS / Linux**:
  ```bash
  lsof -i :8080
  kill -9 <PID>
  ```
- Or change `SERVER_PORT=8081` in your `.env` file.

### 5. Windows PowerShell: `Execution of scripts is disabled on this system`
- **Cause**: Windows default script execution policy prevents running `Activate.ps1`.
- **Solution**: Run this command once in PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

