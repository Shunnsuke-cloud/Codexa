import React, { useState } from 'react';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      setUser(res.user);
      navigate('/operations', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-4 text-2xl font-semibold">Login</h2>
      <p className="mb-4 text-sm text-slate-300">
        登録済みのメールアドレスとパスワードでサインインしてください。アカウントがなければ <Link to="/register" className="text-cyan-300 underline">新規登録</Link> へ進んでください。
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-2 rounded bg-white/3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="w-full p-2 rounded bg-white/3" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-rose-400">{error}</p>}
        <div className="flex gap-2">
          <button className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">Login</button>
        </div>
      </form>
    </div>
  );
}
