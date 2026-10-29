# RepoPulse — GitHub Project Intelligence

RepoPulse is a full-stack web application that analyzes GitHub repositories and presents useful insights into repository health, commit activity, contributors, and project comparisons.

## Features

- **Repository Overview:** View repository details, stars, forks, and open issues.
- **Health Score:** Evaluate repository health using project metrics.
- **Commit Activity:** Visualize recent commit activity.
- **Contributor Insights:** Explore repository contributors.
- **Repository Comparison:** Compare two GitHub repositories using key metrics.
- **Repository History:** Access recently viewed repositories.
- **Interactive Analytics:** Explore project data through charts and visualizations.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI
- **Database:** MySQL
- **API:** GitHub REST API
- **Visualization:** Recharts
- **Testing:** Pytest

## Project Structure

```text
RepoPulse/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── services/
│   │       └── github_service.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── index.css
└── README.md
```

## Getting Started

### Prerequisites

- Python
- Node.js and npm
- MySQL
- GitHub account

### 1. Clone the Repository

```bash
git clone https://github.com/harshadapadmar113/RepoPulse.git
cd RepoPulse
```

### 2. Start the Backend

From the project root, activate your Python virtual environment if you use one, install the backend dependencies, and configure your MySQL connection.

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

**Configuration:** Set up your database connection and any required environment variables according to your project configuration. Never commit passwords, API tokens, or other secrets.

## Testing

Run the backend tests from the project root:

```bash
pytest backend/tests -v
```

## Learning Outcomes

This project demonstrates full-stack development, REST API integration, database connectivity, data visualization, repository analytics, and automated backend testing.

## Author

**Harshada Padmar**

GitHub: [@harshadapadmar113](https://github.com/harshadapadmar113)

---

*RepoPulse — Turning GitHub repository data into actionable insights.*
