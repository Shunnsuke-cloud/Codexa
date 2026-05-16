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
