
from datetime import datetime, timezone


def calculate_health_score(repository: dict) -> dict:
    score = 0
    breakdown = {}

    # 1. Recent activity: last updated within 30 days
    updated_at = repository.get("updated_at")

    if updated_at:
        updated = datetime.fromisoformat(
            updated_at.replace("Z", "+00:00")
        )
        days_since_update = (
            datetime.now(timezone.utc) - updated
        ).days

        if days_since_update <= 30:
            activity_score = 40
        elif days_since_update <= 90:
            activity_score = 25
        elif days_since_update <= 180:
            activity_score = 10
        else:
            activity_score = 0
    else:
        activity_score = 0

    breakdown["recent_activity"] = activity_score
    score += activity_score

    # 2. Open issues: lower issue load gets more points
    open_issues = repository.get("open_issues", 0)

    if open_issues <= 10:
        issue_score = 25
    elif open_issues <= 50:
        issue_score = 18
    elif open_issues <= 100:
        issue_score = 10
    else:
        issue_score = 5

    breakdown["issue_load"] = issue_score
    score += issue_score

    # 3. Maintenance: repository must have a default branch
    maintenance_score = (
        20 if repository.get("default_branch") else 0
    )

    breakdown["maintenance"] = maintenance_score
    score += maintenance_score

    # 4. Community interest: based on stars
    stars = repository.get("stars", 0)

    if stars >= 1000:
        community_score = 15
    elif stars >= 100:
        community_score = 10
    elif stars >= 10:
        community_score = 5
    else:
        community_score = 0

    breakdown["community_interest"] = community_score
    score += community_score

    if score >= 80:
        status = "Healthy"
    elif score >= 50:
        status = "Moderate"
    else:
        status = "Needs Attention"

    return {
        "health_score": score,
        "status": status,
        "breakdown": breakdown,
    }
