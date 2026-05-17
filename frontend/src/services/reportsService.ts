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
