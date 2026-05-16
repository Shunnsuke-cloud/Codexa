import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await axios.post(`${apiBase}/api/auth/register`, req);
  const data = res.data as AuthResponse;
  localStorage.setItem('codexa_token', data.token);
  localStorage.setItem('codexa_user', JSON.stringify(data.user));
  return data;
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await axios.post(`${apiBase}/api/auth/login`, req);
  const data = res.data as AuthResponse;
  localStorage.setItem('codexa_token', data.token);
  localStorage.setItem('codexa_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('codexa_token');
  localStorage.removeItem('codexa_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('codexa_user');
  return raw ? (JSON.parse(raw) as AuthResponse['user']) : null;
}
