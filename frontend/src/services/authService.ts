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

export function getToken(): string | null {
  return localStorage.getItem('codexa_token');
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload) return false;
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    return true;
  } catch (e) {
    return false;
  }
}
