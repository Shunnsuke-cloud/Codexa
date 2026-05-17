import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function getDashboardSummary() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/reports/summary`, { headers });
  return res.data as {
    totalStudyTime: number;
    studyDays: number;
    topTechnologies: { technology: string; totalTime: number; count: number }[];
  };
}

export async function getWeeklyReport() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/reports/weekly`, { headers });
  return res.data as { days: { date: string; totalTime: number }[] };
}

export async function postGithubSync() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`${apiBase}/api/github/sync`, {}, { headers });
  return res.data as any;
}

export async function postGithubPoll() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`${apiBase}/api/github/poll`, {}, { headers });
  return res.data as any;
}

export async function getGithubHistory() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/github/history`, { headers });
  return res.data as any;
}

export async function getGithubOauthStart() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/github/oauth/start`, { headers });
  return res.data as { url: string };
}

export async function getGithubStatus() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/github/oauth/status`, { headers });
  return res.data as { connected: boolean; githubLogin?: string; scope?: string; createdAt?: string };
}

export async function getGithubRepos() {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/github/oauth/repos`, { headers });
  return res.data as {
    connected: boolean;
    repos: {
      name: string;
      fullName: string;
      htmlUrl: string;
      description?: string;
      pushedAt?: string;
      private?: boolean;
    }[];
  };
}

export async function getGithubCommits(repoFullName: string) {
  const token = localStorage.getItem('codexa_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${apiBase}/api/github/oauth/commits`, {
    headers,
    params: { repo: repoFullName },
  });
  return res.data as {
    connected: boolean;
    commits: {
      sha: string;
      message: string;
      htmlUrl: string;
      authorName: string;
      date: string;
    }[];
  };
}
