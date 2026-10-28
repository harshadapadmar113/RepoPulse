
from fastapi import FastAPI
from app.database import test_db_connection
from fastapi import HTTPException
from httpx import HTTPError
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.repository import Repository
from app.analytics.health_score import calculate_health_score
from app.models.repository_snapshot import RepositorySnapshot
from app.services.github_service import get_repository, get_commit_activity,get_repository_contributors
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="RepoPulse API",
    description="GitHub Repository Intelligence Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message": "Welcome to RepoPulse!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/health/database")
def database_health():
    try:
        version = test_db_connection()
        return {
            "status": "connected",
            "database": "repopulse_db",
            "mysql_version": version
        }
    except Exception:
        return {
            "status": "disconnected",
            "message": "Database connection failed"
        }


@app.get("/api/repositories/{owner}/{repo}")
def repository_details(owner: str, repo: str):
    try:
        result = get_repository(owner, repo)

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result

    except HTTPException:
        raise
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch repository data from GitHub"
        )

@app.post("/api/repositories/{owner}/{repo}/save")
def save_repository(owner: str, repo: str):
    try:
        data = get_repository(owner, repo)
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch repository data from GitHub"
        )

    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])

    db: Session = SessionLocal()

    try:
        repository = (
            db.query(Repository)
            .filter(Repository.full_name == data["full_name"])
            .first()
        )

        def parse_datetime(value):
            if not value:
                return None
            return datetime.fromisoformat(value.replace("Z", "+00:00"))

        fields = {
            "name": data["name"],
            "description": data["description"],
            "url": data["url"],
            "stars": data["stars"],
            "forks": data["forks"],
            "open_issues": data["open_issues"],
            "language": data["language"],
            "default_branch": data["default_branch"],
            "github_created_at": parse_datetime(data["created_at"]),
            "github_updated_at": parse_datetime(data["updated_at"]),
        }

        if repository is None:
            repository = Repository(full_name=data["full_name"], **fields)
            db.add(repository)
            action = "saved"
        else:
            for key, value in fields.items():
                setattr(repository, key, value)
            action = "updated"

        db.commit()
        db.refresh(repository)

        return {
            "message": f"Repository {action} successfully",
            "action": action,
            "repository": {
                "id": repository.id,
                "full_name": repository.full_name,
                "stars": repository.stars,
                "forks": repository.forks,
                "language": repository.language,
            },
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save repository to database"
        )
    finally:
        db.close()

@app.post("/api/repositories/{owner}/{repo}/snapshot")
def create_repository_snapshot(owner: str, repo: str):
    try:
        data = get_repository(owner, repo)
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch data from GitHub"
        )

    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])

    db = SessionLocal()

    try:
        repository = (
            db.query(Repository)
            .filter(Repository.full_name == data["full_name"])
            .first()
        )

        if repository is None:
            raise HTTPException(
                status_code=404,
                detail="Save this repository first using the save endpoint"
            )

        snapshot = RepositorySnapshot(
            repository_id=repository.id,
            stars=data["stars"],
            forks=data["forks"],
            open_issues=data["open_issues"]
        )

        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)

        return {
            "message": "Snapshot saved successfully",
            "snapshot_id": snapshot.id,
            "repository": repository.full_name,
            "stars": snapshot.stars,
            "forks": snapshot.forks,
            "open_issues": snapshot.open_issues,
            "recorded_at": snapshot.recorded_at
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save snapshot"
        )
    finally:
        db.close()

@app.get("/api/repositories/{owner}/{repo}/history")
def get_repository_history(owner: str, repo: str):
    db = SessionLocal()

    try:
        full_name = f"{owner}/{repo}"

        repository = (
            db.query(Repository)
            .filter(Repository.full_name == full_name)
            .first()
        )

        if repository is None:
            raise HTTPException(
                status_code=404,
                detail="Repository not found in database"
            )

        snapshots = (
            db.query(RepositorySnapshot)
            .filter(
                RepositorySnapshot.repository_id == repository.id
            )
            .order_by(RepositorySnapshot.recorded_at.asc())
            .all()
        )

        return {
            "repository": repository.full_name,
            "total_snapshots": len(snapshots),
            "history": [
                {
                    "stars": snapshot.stars,
                    "forks": snapshot.forks,
                    "open_issues": snapshot.open_issues,
                    "recorded_at": snapshot.recorded_at
                }
                for snapshot in snapshots
            ]
        }

    finally:
        db.close()

@app.get("/api/repositories/{owner}/{repo}/health-score")
def repository_health_score(owner: str, repo: str):
    try:
        data = get_repository(owner, repo)
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch repository data from GitHub"
        )

    if "error" in data:
        raise HTTPException(
            status_code=404,
            detail=data["error"]
        )

    result = calculate_health_score(data)

    return {
        "repository": data["full_name"],
        **result
    }

@app.get("/api/repositories/compare")
def compare_repositories(
    owner1: str,
    repo1: str,
    owner2: str,
    repo2: str
):
    try:
        data1 = get_repository(owner1, repo1)
        data2 = get_repository(owner2, repo2)

    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch repository data from GitHub"
        )

    if "error" in data1:
        raise HTTPException(
            status_code=404,
            detail=f"First repository not found: {owner1}/{repo1}"
        )

    if "error" in data2:
        raise HTTPException(
            status_code=404,
            detail=f"Second repository not found: {owner2}/{repo2}"
        )

    health1 = calculate_health_score(data1)
    health2 = calculate_health_score(data2)

    return {
        "repository_1": {
            "name": data1["full_name"],
            "stars": data1["stars"],
            "forks": data1["forks"],
            "open_issues": data1["open_issues"],
            "health_score": health1["health_score"],
            "health_status": health1["status"]
        },
        "repository_2": {
            "name": data2["full_name"],
            "stars": data2["stars"],
            "forks": data2["forks"],
            "open_issues": data2["open_issues"],
            "health_score": health2["health_score"],
            "health_status": health2["status"]
        },
        "comparison": {
            "stars_difference": data1["stars"] - data2["stars"],
            "forks_difference": data1["forks"] - data2["forks"],
            "health_score_difference": (
                health1["health_score"] - health2["health_score"]
            )
        }
    }

@app.get("/api/repositories/{owner}/{repo}/commit-activity")
def repository_commit_activity(owner: str, repo: str):
    try:
        result = get_commit_activity(owner, repo)
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch commit activity from GitHub"
        )

    if "error" in result:
        raise HTTPException(
            status_code=404,
            detail=result["error"]
        )

    return result

@app.get("/api/repositories/{owner}/{repo}/contributors")
def repository_contributors(owner: str, repo: str):
    try:
        result = get_repository_contributors(owner, repo)
    except HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch contributors from GitHub"
        )

    if "error" in result:
        raise HTTPException(
            status_code=404,
            detail=result["error"]
        )

    return result
