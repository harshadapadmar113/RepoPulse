# RepoPulse — System Architecture

## 1. Project Overview

RepoPulse is a full-stack GitHub Project Intelligence application that presents repository information, commit activity, contributor analytics, repository comparisons, and rule-based health insights.

## 2. Technology Stack

- Frontend: React, Vite, Recharts
- Backend: Python, FastAPI
- External Data Source: GitHub API
- Testing: Python test suite in `backend/tests/`

## 3. High-Level Architecture

```text
User
 |
 v
React Frontend (Vite)
 |
 | HTTP / JSON
 v
FastAPI Backend
 |
 +--> Repository API
 |
 +--> Analytics / Health Scoring
 |
 +--> Comparison Services
 |
 v
GitHub API
 |
 v
Repository Data
```

## 4. Request Flow

1. The user enters a repository owner and repository name.
2. The React frontend sends a request to the FastAPI backend.
3. The backend processes the request and retrieves the required repository data.
4. Analytics and health-score logic prepare the response.
5. The frontend displays repository metrics, charts, comparisons, and health insights.

## 5. Health Score

The application returns an overall health score and a breakdown containing:

- Recent activity
- Issue load
- Maintenance
- Community interest

The score is a rule-based indicator. It should not be interpreted as a validated measure of software quality.

## 6. Potential Future Improvements

- Add automated tests for important API endpoints.
- Improve API failure handling and user-facing error messages.
- Evaluate health-score thresholds against documented criteria.
- Add historical analytics and trend comparisons.
- Deploy the application with secure configuration.
