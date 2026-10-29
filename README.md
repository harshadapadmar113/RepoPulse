# RepoPulse — GitHub Project Intelligence

RepoPulse is a full-stack web application that analyzes GitHub repositories and transforms repository data into meaningful visual insights. It helps users explore commit activity, contributor contributions, compare repositories, and understand repository health through a rule-based scoring system.

## Features

- **Repository Overview:** Explore key information and metrics for a GitHub repository.
- **Commit Activity Analytics:** Visualize repository commit activity using charts.
- **Contributor Analytics:** Explore contributor contribution data.
- **Repository Comparison:** Compare two GitHub repositories side by side.
- **Repository Health Score:** View an overall health score, status, and metric breakdown.
- **Health Recommendations:** Display rule-based suggestions based on repository health metrics.
- **Repository History:** View recently analyzed repositories using locally stored browser history.
- **Repository Data Storage:** Save repository details and record metric snapshots in MySQL.
- **Historical Snapshots:** Retrieve previously recorded stars, forks, and open issues.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Data Visualization | Recharts |
| Backend | Python, FastAPI |
| Data Source | GitHub API |
| API Documentation | FastAPI Swagger UI |
| Testing | Python test suite |
## Testing

RepoPulse includes automated backend tests using `pytest` and FastAPI's `TestClient`.

Run the tests from the project root:

```bash
python -m pytest backend/tests -v
```

The current test suite checks the home endpoint, health endpoint, and required-parameter validation for repository comparison.

## Architecture

The application follows a frontend-backend architecture.

1. Users select a GitHub repository in the React frontend.
2. The frontend sends HTTP requests to the FastAPI backend.
3. The backend processes requests and retrieves the required repository data.
4. The backend provides analytics and health-score information.
5. The frontend presents the results through metrics, charts, comparison views, and health insights.

See [System Architecture](docs/architecture.md) for more details.

## Run Locally

### Prerequisites

- Python installed
- Node.js and npm installed
- Git installed

### 1. Start the Backend

From the project root directory, activate your existing Python virtual environment if it is not already active.

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload --app-dir backend
```

Backend API: http://127.0.0.1:8000

Interactive API documentation: http://127.0.0.1:8000/docs

### 2. Start the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually http://localhost:5173.

Keep both development servers running while using the application.

## Repository Health Score

RepoPulse displays an overall health score and a breakdown of metrics such as:

- Recent activity
- Issue load
- Maintenance
- Community interest

The score and recommendations are rule-based indicators. They are not a validated prediction of software quality or future project success.

## Project Structure

```text
RepoPulse/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── tests/
├── docs/
│   └── architecture.md
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Future Improvements

- Expand automated tests for API endpoints and frontend components.
- Improve API error handling and loading states.
- Add historical repository trend analysis.
- Evaluate health-score weights against documented criteria.
- Deploy the application with secure environment configuration.

## Author

Developed independently as an MCA Data Science portfolio project.
