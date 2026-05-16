import axios from 'axios';
import type { StudyLog, StudyLogRequest } from '../types/study';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function authHeaders() {
  const token = localStorage.getItem('codexa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getLogs(): Promise<StudyLog[]> {
  const res = await axios.get(`${apiBase}/api/logs`, { headers: authHeaders() });
  return res.data as StudyLog[];
}

export async function createLog(payload: StudyLogRequest): Promise<StudyLog> {
  const res = await axios.post(`${apiBase}/api/logs`, payload, { headers: authHeaders() });
  return res.data as StudyLog;
}

export async function updateLog(id: number, payload: StudyLogRequest): Promise<StudyLog> {
  const res = await axios.put(`${apiBase}/api/logs/${id}`, payload, { headers: authHeaders() });
  return res.data as StudyLog;
}

export async function deleteLog(id: number): Promise<void> {
  await axios.delete(`${apiBase}/api/logs/${id}`, { headers: authHeaders() });
}
