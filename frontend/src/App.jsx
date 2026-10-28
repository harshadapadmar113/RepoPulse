
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [repoName, setRepoName] = useState("");
  const [healthInsights, setHealthInsights] = useState(null);
  const [page, setPage] = useState("overview");
  const [repository, setRepository] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState([]);
const [contributors, setContributors] = useState([]);
const [chartError, setChartError] = useState("");
const [compareRepo1, setCompareRepo1] = useState("fastapi/fastapi");
const [compareRepo2, setCompareRepo2] = useState("pallets/flask");
const [comparison, setComparison] = useState(null);
const [compareLoading, setCompareLoading] = useState(false);
const [compareError, setCompareError] = useState("");

  async function analyzeRepository(event) {
    event.preventDefault();

    const parts = repoName.trim().split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError("Enter the repository as owner/repo, e.g. fastapi/fastapi");
      return;
    }

    const [owner, repo] = parts;
    setLoading(true);
    setError("");
    setRepository(null);
    setHealth(null);

    try {
      const response = await fetch(
        `${API}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Repository not found. Check the owner and repository name."
            : `Request failed (${response.status}). Please try again.`
        );
      }

      const data = await response.json();
      setRepository(data);
      const [activityResponse, contributorsResponse] = await Promise.all([
  fetch(`${API}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commit-activity`),
  fetch(`${API}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`),
]);

if (activityResponse.ok && contributorsResponse.ok) {
  const activityData = await activityResponse.json();
  const contributorData = await contributorsResponse.json();

  setActivity(activityData.daily_activity || []);
  setContributors(contributorData.contributors || []);
  setChartError("");
} else {
  setChartError("Could not load analytics data for this repository.");
}


const healthResponse = await fetch(
  `${API}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/health-score`
);

const healthData = await healthResponse.json();
setHealth(healthData);
setHealthInsights(healthData);


      if (healthResponse.ok) {
        setHealth(await healthResponse.json());
      }
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure FastAPI is running on port 8000 and CORS is enabled."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

async function compareRepositories(event) {
  event.preventDefault();

  setCompareLoading(true);
  setCompareError("");
  setComparison(null);

  try {
    const parts1 = compareRepo1.trim().split("/");
    const parts2 = compareRepo2.trim().split("/");

    if (
      parts1.length !== 2 ||
      parts2.length !== 2 ||
      !parts1[0] ||
      !parts1[1] ||
      !parts2[0] ||
      !parts2[1]
    ) {
      throw new Error("Enter both repositories in owner/repo format.");
    }

    const params = new URLSearchParams({
      owner1: parts1[0],
      repo1: parts1[1],
      owner2: parts2[0],
      repo2: parts2[1],
    });

    const response = await fetch(
      `${API}/api/repositories/compare?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Could not compare repositories. Check the names and try again.");
    }

    const data = await response.json();
    setComparison(data);
  } catch (error) {
    setCompareError(error.message || "Something went wrong.");
  } finally {
    setCompareLoading(false);
  }
}


  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">◈ RepoPulse</h2>
        <p className="menu-label">WORKSPACE</p>

<button
  className={`nav-item ${page === "overview" ? "active" : ""}`}
  onClick={() => setPage("overview")}
>
  ▦ Overview
</button>

<button
  className={`nav-item ${page === "analytics" ? "active" : ""}`}
  onClick={() => setPage("analytics")}
>
  ⌁ Repository Analytics
</button>

<button
  className={`nav-item ${page === "compare" ? "active" : ""}`}
  onClick={() => setPage("compare")}
>
  ⇄ Compare Repositories
</button>

<button className="nav-item">
  ◷ Repository History
</button>


        <div className="sidebar-bottom">
          <div className="avatar">RP</div>
          <div>
            <strong>RepoPulse</strong>
            <p>GitHub Intelligence</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">GITHUB PROJECT INTELLIGENCE</p>
            <h1>
  {page === "compare"
    ? "Compare Repositories"
    : page === "analytics"
      ? "Repository Analytics"
      : "Repository Overview"}
</h1>
          </div>
          <div className="status"><span /> Analytics Workspace</div>
        </header>
        {page === "overview" ? (
  <>
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR REPOSITORY, AT A GLANCE</p>
            <h2>Understand your code. Track your progress.</h2>
            <p>Explore repository activity, community growth and project health.</p>
          </div>
          <div className="welcome-icon">⌘</div>
        </section>

        <section className="search-section">
          <label htmlFor="repo">Analyze a GitHub repository</label>
          <p>Enter the repository owner and name to get started.</p>

          <form className="search-box" onSubmit={analyzeRepository}>
            <span>⌕</span>
            <input
              id="repo"
              value={repoName}
              onChange={(event) => setRepoName(event.target.value)}
              placeholder="e.g. fastapi/fastapi"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Repository →"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
          {repository && (
            <p className="success-message">
              Repository loaded: {repository.full_name || repository.name}
            </p>
          )}
        </section>

        <section className="section-heading">
          <div>
            <h2>Repository Metrics</h2>
            <p>
              {repository?.full_name || "Search a repository to view its metrics"}
            </p>
          </div>
          <span className="demo-tag">{repository ? "LIVE DATA" : "WAITING"}</span>
        </section>

        <section className="metrics-grid">
          <Metric title="Total Stars" value={formatNumber(repository?.stars)} note="GitHub community interest" icon="☆" />
          <Metric title="Total Forks" value={formatNumber(repository?.forks)} note="Community contributions" icon="⑂" />
          <Metric title="Open Issues" value={formatNumber(repository?.open_issues)} note="Issues awaiting attention" icon="◎" />
          <Metric
            title="Health Score"
            value={health?.health_score != null ? `${health.health_score}/100` : "—"}
            note={health?.status || "Custom project health metric"}
            icon="↗"
          />
        </section>

        {repository && (
          <section className="panel repository-details">
            <div className="panel-heading">
              <div>
                <h3>{repository.full_name || repository.name}</h3>
                <p>{repository.description || "No repository description available."}</p>
              </div>
              <span className="panel-icon">⌘</span>
            </div>
            <div className="details-row">
              <span>Language: <strong>{repository.language || "Not specified"}</strong></span>
              <a href={repository.url} target="_blank" rel="noreferrer">View on GitHub ↗</a>
            </div>
          </section>
        )}

        <section className="analytics-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Commit Activity</h3>
                <p>Daily commits over the last 30 days</p>
              </div>
              <span className="panel-icon">⌁</span>
            </div>

{chartError ? (
  <div className="empty-chart">
    <strong>{chartError}</strong>
  </div>
) : activity.length > 0 ? (
  <div style={{ width: "100%", height: 230, marginTop: 20 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activity}>
        <CartesianGrid strokeDasharray="3 3" stroke="#28354d" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          tickFormatter={(date) => date.slice(5)}
        />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#111a2d",
            border: "1px solid #34426c",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        <Area
          type="monotone"
          dataKey="commits"
          name="Commits"
          stroke="#8795ff"
          fill="#8795ff"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
) : (
  <div className="empty-chart">
    <div className="chart-symbol">⌁</div>
    <strong>No commit activity to display yet</strong>
    <p>Search for a repository to load its activity.</p>
  </div>
)}

          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Top Contributors</h3>
                <p>Community contribution overview</p>
              </div>
              <span className="panel-icon">♙</span>
            </div>

{chartError ? (
  <div className="empty-chart">
    <strong>{chartError}</strong>
  </div>
) : contributors.length > 0 ? (
  <div style={{ width: "100%", height: 260, marginTop: 20 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[...contributors]
          .sort((a, b) => b.contributions - a.contributions)
          .slice(0, 8)}
        layout="vertical"
        margin={{ left: 10, right: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#28354d" />
        <XAxis
          type="number"
          tick={{ fill: "#94a3b8", fontSize: 10 }}
        />
        <YAxis
          type="category"
          dataKey="username"
          width={90}
          tick={{ fill: "#b8c5dd", fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{
            background: "#111a2d",
            border: "1px solid #34426c",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        <Bar
          dataKey="contributions"
          name="Contributions"
          fill="#8795ff"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
) : (
  <div className="empty-chart">
    <div className="chart-symbol">♙</div>
    <strong>No contributor data to display yet</strong>
    <p>Search for a repository to load contributors.</p>
  </div>
)}

          </div>
        </section>


        <footer>RepoPulse · GitHub Project Intelligence</footer>
        </>
) : page === "analytics" ? (
  <>
    <section className="welcome">
      <div>
        <p className="eyebrow">REPOSITORY INSIGHTS</p>
        <h2>Repository Analytics</h2>
        <p>
          Analyze commit activity and contributor contributions
          for the repository loaded in Overview.
        </p>

{healthInsights && (
  <section className="panel health-insights">
    <div className="health-header">
      <div>
        <p className="eyebrow">REPOSITORY HEALTH</p>
        <h2>Health Score</h2>
      </div>
      <div className="health-score">
        <strong>{healthInsights.health_score}</strong>
        <span>/100</span>
      </div>
    </div>

    <h3>{healthInsights.status}</h3>

<p className="health-interpretation">
  {healthInsights.health_score >= 80
    ? "Strong overall health. Continue monitoring repository activity and maintenance."
    : healthInsights.health_score >= 60
      ? "Moderate health. Review the breakdown to identify areas that may need attention."
      : "Needs attention. Review repository activity, maintenance, and community engagement."}
</p>


<div className="health-breakdown">
  {Object.entries(healthInsights.breakdown || {}).map(
    ([name, score]) => (
      <div className="health-row" key={name}>
        <div className="health-row-heading">
          <span>{name.replaceAll("_", " ")}</span>
          <strong>{score}</strong>
        </div>

        <div className="health-progress-track">
          <div
            className="health-progress-fill"
            style={{
              width: `${Math.max(0, Math.min(100, Number(score) || 0))}%`,
            }}
          />
        </div>
      </div>
    )
  )}
</div>

<div className="health-recommendations">
  <h3>Recommendations</h3>

  {Object.entries(healthInsights.breakdown || {}).filter(
    ([, score]) => Number(score) < 15
  ).length === 0 ? (
    <p>
      The repository has a strong health profile. Continue monitoring
      activity and community engagement.
    </p>
  ) : (
    <ul>
      {Object.entries(healthInsights.breakdown || {})
        .filter(([, score]) => Number(score) < 15)
        .map(([name, score]) => (
          <li key={name}>
            Review {name.replaceAll("_", " ")} (score: {score})
            and identify opportunities for improvement.
          </li>
        ))}
    </ul>
  )}
</div>

  </section>
)}

      </div>
      <div className="welcome-icon">⌁</div>
    </section>

    {!repository ? (
      <section className="panel">
        <h3>No repository selected</h3>
        <p>
          Go to Overview, search for a GitHub repository, then return
          here to view its analytics.
        </p>
        <button onClick={() => setPage("overview")}>
          Go to Overview
        </button>
      </section>
    ) : (
      <>
        <section className="section-heading">
          <div>
            <h2>{repository.full_name || repository.name}</h2>
            <p>Live repository analytics</p>
          </div>
          <span className="demo-tag">LIVE DATA</span>
        </section>

        <section className="analytics-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Commit Activity</h3>
                <p>Daily commits over the last 30 days</p>
              </div>
            </div>

            {activity.length > 0 ? (
              <div style={{ width: "100%", height: 260, marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#28354d" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      tickFormatter={(date) => date.slice(5)}
                    />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="commits"
                      name="Commits"
                      stroke="#8795ff"
                      fill="#8795ff"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-chart">
                <strong>{chartError || "No commit activity available."}</strong>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Top Contributors</h3>
                <p>Ranked by contributions</p>
              </div>
            </div>

            {contributors.length > 0 ? (
              <div style={{ width: "100%", height: 260, marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...contributors]
                      .sort((a, b) => b.contributions - a.contributions)
                      .slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 10, right: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#28354d" />
                    <XAxis
                      type="number"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="username"
                      width={90}
                      tick={{ fill: "#b8c5dd", fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="contributions"
                      name="Contributions"
                      fill="#8795ff"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-chart">
                <strong>{chartError || "No contributor data available."}</strong>
              </div>
            )}

          </div>
        </section>
      </>
    )}
  </>
) : (
  <section className="panel">


    <h2>Compare Repositories</h2>
    <p>Compare GitHub repositories side by side.</p>

    <form onSubmit={compareRepositories} className="compare-form">
      <div>
        <label>First Repository</label>
        <input
          value={compareRepo1}
          onChange={(e) => setCompareRepo1(e.target.value)}
          placeholder="owner/repo"
          required
        />
      </div>

      <div>
        <label>Second Repository</label>
        <input
          value={compareRepo2}
          onChange={(e) => setCompareRepo2(e.target.value)}
          placeholder="owner/repo"
          required
        />
      </div>

      <button type="submit" disabled={compareLoading}>
        {compareLoading ? "Comparing..." : "Compare Repositories"}
      </button>
    </form>

    {compareError && <p className="error-message">{compareError}</p>}


{comparison && (() => {
  const repo1 = comparison.repository_1;
  const repo2 = comparison.repository_2;
  const differences = comparison.differences;

  const metrics = [
    {
      label: "Stars",
      key: "stars",
      value1: repo1.stars,
      value2: repo2.stars,
      difference: differences.stars,
    },
    {
      label: "Forks",
      key: "forks",
      value1: repo1.forks,
      value2: repo2.forks,
      difference: differences.forks,
    },
    {
      label: "Open Issues",
      key: "open_issues",
      value1: repo1.open_issues,
      value2: repo2.open_issues,
      difference: differences.open_issues,
    },
    {
      label: "Health Score",
      key: "health_score",
      value1: repo1.health_score,
      value2: repo2.health_score,
      difference: differences.health_score,
    },
  ];

  return (
    <div className="comparison-results">
      {[repo1, repo2].map((repo, index) => (
        <div className="comparison-card" key={index}>
          <p className="comparison-label">
            {index === 0 ? "REPOSITORY 1" : "REPOSITORY 2"}
          </p>
          <h3>{repo.full_name}</h3>
          <div className="comparison-stat">
            <span>⭐ Stars</span>
            <strong>{formatNumber(repo.stars)}</strong>
          </div>
          <div className="comparison-stat">
            <span>🍴 Forks</span>
            <strong>{formatNumber(repo.forks)}</strong>
          </div>
          <div className="comparison-stat">
            <span>Open Issues</span>
            <strong>{formatNumber(repo.open_issues)}</strong>
          </div>
          <div className="comparison-stat">
            <span>Health Score</span>
            <strong>
              {repo.health_score == null
                ? "—"
                : `${repo.health_score}/100`}
            </strong>
          </div>
        </div>
      ))}

      <div className="comparison-differences">
        <h3>Metric Differences</h3>
        {metrics.map((metric) => (
          <div className="comparison-stat" key={metric.key}>
            <span>{metric.label}</span>
            <strong>
              {metric.difference == null
                ? "—"
                : `${metric.difference > 0 ? "+" : ""}${formatNumber(metric.difference)}`}
            </strong>
          </div>
        ))}
        <p className="comparison-note">
          Differences are calculated as Repository 1 minus Repository 2.
        </p>
      </div>
    </div>
  );
})()}

  </section>
)}
      </main>
    </div>
  );
}

function formatNumber(value) {
  return value == null ? "—" : Number(value).toLocaleString("en-US");
}

function Metric({ title, value, note, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p>{note}</p>
    </div>
  );
}

export default App;
