import React, { useState } from 'react';
import { register } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await register({ name, email, password });
      setUser(res.user);
      navigate('/logs');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-4 text-2xl font-semibold">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-2 rounded bg-white/3" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="w-full p-2 rounded bg-white/3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="w-full p-2 rounded bg-white/3" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-rose-400">{error}</p>}
        <div className="flex gap-2">
          <button className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">Register</button>
        </div>
      </form>
    </div>
  );
}
