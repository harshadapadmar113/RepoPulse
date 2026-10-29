
import httpx


GITHUB_API = "https://api.github.com"


def get_repository(owner: str, repo: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}"

    response = httpx.get(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=15.0,
    )

    if response.status_code == 404:
        return {"error": "Repository not found"}

    response.raise_for_status()
    data = response.json()

    return {
        "name": data["name"],
        "full_name": data["full_name"],
        "description": data["description"],
        "url": data["html_url"],
        "stars": data["stargazers_count"],
        "forks": data["forks_count"],
        "open_issues": data["open_issues_count"],
        "language": data["language"],
        "created_at": data["created_at"],
        "updated_at": data["updated_at"],
        "default_branch": data["default_branch"],
    }

from datetime import datetime, timedelta, timezone



def get_commit_activity(owner: str, repo: str):
    since_date = datetime.now(timezone.utc) - timedelta(days=30)

    url = f"{GITHUB_API}/repos/{owner}/{repo}/commits"

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    all_commits = []
    pages_fetched = 0
    max_pages = 5
    per_page = 100

    for page in range(1, max_pages + 1):
        response = httpx.get(
            url,
            params={
                "since": since_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "per_page": per_page,
                "page": page,
            },
            headers=headers,
            timeout=20.0,
        )

        if response.status_code == 404:
            return {"error": "Repository not found"}

        response.raise_for_status()
        commits = response.json()
        pages_fetched += 1

        if not commits:
            break

        all_commits.extend(commits)

        if len(commits) < per_page:
            break

    daily_activity = {}

    for item in all_commits:
        commit_info = item.get("commit") or {}
        author_info = commit_info.get("author") or {}
        committer_info = commit_info.get("committer") or {}

        commit_date = (
            author_info.get("date")
            or committer_info.get("date")
        )

        if not commit_date:
            continue

        date = commit_date[:10]
        daily_activity[date] = daily_activity.get(date, 0) + 1

    return {
        "repository": f"{owner}/{repo}",
        "period_days": 30,
        "commits_returned": len(all_commits),
        "pages_fetched": pages_fetched,
        "max_pages": max_pages,
        "possibly_incomplete": (
            pages_fetched == max_pages
            and len(all_commits) >= max_pages * per_page
        ),
        "daily_activity": [
            {
                "date": date,
                "commits": count,
            }
            for date, count in sorted(daily_activity.items())
        ],
    }

def get_repository_contributors(owner: str, repo: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contributors"

    response = httpx.get(
        url,
        params={"per_page": 100, "page": 1},
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=20.0,
    )

    if response.status_code == 404:
        return {"error": "Repository not found"}

    response.raise_for_status()
    contributors = response.json()

    if not isinstance(contributors, list):
        return {"error": "Unexpected response from GitHub"}

    return {
        "repository": f"{owner}/{repo}",
        "contributors_returned": len(contributors),
        "contributors": [
            {
                "username": contributor["login"],
                "profile_url": contributor["html_url"],
                "contributions": contributor["contributions"],
            }
            for contributor in contributors
        ],
        "note": "Shows up to 100 contributors returned by GitHub."
    }
